/**
 * Generation Worker - Обработка изображений
 * 
 * Обрабатывает очередь на генерацию 4 изображений для каждого товара:
 * 1. MAIN (обложка)
 * 2. FEATURES (характеристики)
 * 3. BENEFITS (преимущества)
 * 4. DETAILS (детали)
 */

import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { join, basename, dirname } from 'path';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import axios from 'axios';
import { SharpProcessor } from '@migs/image-processor';
import prisma from '../config/database';
import logger from '../utils/logger';
import config from '../config';

// Redis подключение
const redisConnection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

// Интерфейсы
interface ProcessItemData {
  jobId: string;
  itemId: string;
  article: string;
}

interface ImageTemplate {
  type: string;
  template: string;
}

/**
 * Конфигурация воркера
 */
const WORKER_CONFIG = {
  concurrency: 3, // 3 параллельные задачи (обработка изображений тяжёлая)
  limiter: {
    max: 10, // 10 задач
    duration: 1000, // в секунду
  },
};

/**
 * Шаблоны изображений
 */
const IMAGE_TEMPLATES: ImageTemplate[] = [
  { type: 'MAIN', template: 'main-template.json' },
  { type: 'FEATURES', template: 'features-template.json' },
  { type: 'BENEFITS', template: 'benefits-template.json' },
  { type: 'DETAILS', template: 'details-template.json' },
];

/**
 * Generation Worker
 */
export const generationWorker = new Worker<ProcessItemData>(
  `${config.queuePrefix}_generation`,
  async (job: Job<ProcessItemData>) => {
    const { jobId, itemId, article } = job.data;
    
    logger.info(`🖼️ [Generation] Starting job ${job.id} for item ${article}`);
    
    try {
      // 1. Получаем Item из БД
      logger.debug(`[Generation] Fetching item ${itemId} from DB`);
      
      const item = await prisma.item.findUnique({
        where: { id: itemId },
        include: {
          job: {
            include: {
              user: true,
            },
          },
        },
      });
      
      if (!item) {
        throw new Error(`Item ${itemId} not found`);
      }
      
      logger.debug(`[Generation] Item found: ${item.article}`);
      
      // 2. Обновляем статус
      await updateItemStatus(itemId, 'DOWNLOADING_IMAGE');
      await updateJobProgress(jobId, 10);
      
      // 3. Скачиваем исходное изображение
      logger.info(`[Generation] Downloading source image: ${item.sourceImageUrl}`);
      
      const localPath = await downloadSourceImage(
        item.sourceImageUrl,
        jobId,
        article
      );
      
      if (!localPath) {
        throw new Error('Failed to download source image');
      }
      
      logger.debug(`[Generation] Image downloaded: ${localPath}`);
      await updateItemStatus(itemId, 'PROCESSING', { sourceImageLocal: localPath });
      await updateJobProgress(jobId, 30);
      
      // 4. Создаём процессор изображений
      const outputPath = join(config.tempDir, jobId, article);
      
      if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true });
      }
      
      const processor = new SharpProcessor(localPath, {
        outputPath,
        templateDir: config.templateDir,
      });
      
      await processor.load();
      
      // 5. Генерируем 4 изображения
      logger.info(`[Generation] Generating 4 images for ${article}`);
      
      const imagePaths: string[] = [];
      
      for (let i = 0; i < IMAGE_TEMPLATES.length; i++) {
        const template = IMAGE_TEMPLATES[i];
        const progress = 30 + ((i + 1) * 15); // 45%, 60%, 75%, 90%
        
        logger.debug(`[Generation] Generating ${template.type} image (${i + 1}/4)`);
        
        try {
          await processor.applyTemplate(template.template, {
            ...item.characteristics,
            name: item.name || item.article,
            brand: item.brand || 'No brand',
            article: item.article,
          });
          
          const imagePath = join(outputPath, `${basename(article)}.${template.type}.jpg`);
          imagePaths.push(imagePath);
          
          logger.debug(`[Generation] ${template.type} image generated: ${imagePath}`);
          
        } catch (error: any) {
          logger.warn(`[Generation] Failed to generate ${template.type}: ${error.message}`);
          // Продолжаем генерацию остальных изображений
        }
        
        await updateJobProgress(jobId, progress);
      }
      
      // 6. Сохраняем изображения в БД
      logger.info(`[Generation] Saving ${imagePaths.length} images to DB`);
      
      for (const imagePath of imagePaths) {
        const imageType = basename(imagePath).split('.')[1] as 'MAIN' | 'FEATURES' | 'BENEFITS' | 'DETAILS';
        
        try {
          await prisma.image.create({
            data: {
              itemId,
              type: imageType,
              localPath: imagePath,
              storageProvider: 'LOCAL',
              storageId: '',
              uploadStatus: 'PENDING',
              width: processor['dimensions'].width,
              height: processor['dimensions'].height,
              fileSize: 0, // Будет обновлено после загрузки
            },
          });
          
          logger.debug(`[Generation] Image saved to DB: ${imageType}`);
          
        } catch (error: any) {
          logger.error(`[Generation] Failed to save image ${imageType}: ${error.message}`);
        }
      }
      
      // 7. Обновляем Item
      logger.debug(`[Generation] Updating item status to UPLOADING_IMAGES`);
      
      await updateItemStatus(itemId, 'UPLOADING_IMAGES');
      await updateJobProgress(jobId, 95);
      
      // 8. Добавляем в очередь на загрузку
      logger.info(`[Generation] Adding to storage queue`);
      
      const { storageQueue } = await import('../queues');
      
      await storageQueue.add(
        'upload-images',
        { itemId, jobId, article },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
      
      logger.info(`✅ [Generation] Completed for ${article}`);
      
      return {
        success: true,
        itemId,
        article,
        imagesCount: imagePaths.length,
      };
      
    } catch (error: any) {
      logger.error(`❌ [Generation] Failed: ${error.message}`);
      logger.error(`[Generation] Stack: ${error.stack}`);
      
      // Обновляем Item с ошибкой
      try {
        await updateItemStatus(itemId, 'FAILED', {
          errorMessage: error.message,
        });
      } catch (dbError: any) {
        logger.error(`[Generation] Failed to update DB: ${dbError.message}`);
      }
      
      // Пробрасываем ошибку для retry
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: WORKER_CONFIG.concurrency,
    limiter: WORKER_CONFIG.limiter,
  }
);

// ============================================
// EVENT HANDLERS
// ============================================

generationWorker.on('completed', (job, result) => {
  logger.info(`🎉 [Generation] Job ${job.id} completed: ${JSON.stringify(result)}`);
});

generationWorker.on('failed', (job, error) => {
  logger.error(`💥 [Generation] Job ${job?.id} failed: ${error.message}`);
  
  if (job?.attemptsMade >= 3) {
    logger.error(`[Generation] Job ${job.id} exceeded max retries, marking as failed`);
  }
});

generationWorker.on('error', (error) => {
  logger.error(`🚨 [Generation] Worker error: ${error.message}`);
});

generationWorker.on('stalled', (jobId) => {
  logger.warn(`⚠️ [Generation] Job ${jobId} stalled`);
});

logger.info('🚀 [Generation] Worker started');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Скачать исходное изображение
 */
async function downloadSourceImage(
  url: string,
  jobId: string,
  article: string
): Promise<string | null> {
  try {
    const downloadDir = join(config.tempDir, jobId, 'sources');
    
    if (!existsSync(downloadDir)) {
      mkdirSync(downloadDir, { recursive: true });
    }
    
    const filePath = join(downloadDir, `${article}.jpg`);
    
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    const writer = createWriteStream(filePath);
    
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      
      writer.on('finish', () => {
        logger.debug(`[Download] Image saved: ${filePath}`);
        resolve(filePath);
      });
      
      writer.on('error', (error: any) => {
        logger.error(`[Download] Write error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error: any) {
    logger.error(`[Download] Failed: ${error.message}`);
    return null;
  }
}

/**
 * Обновить статус Item
 */
async function updateItemStatus(
  itemId: string,
  status: string,
  additionalData?: Record<string, any>
): Promise<void> {
  try {
    await prisma.item.update({
      where: { id: itemId },
      data: {
        status,
        ...additionalData,
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    logger.error(`[DB] Failed to update item status: ${error.message}`);
  }
}

/**
 * Обновить прогресс Job
 */
async function updateJobProgress(
  jobId: string,
  progress: number
): Promise<void> {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        progress,
        updatedAt: new Date(),
      },
    });
  } catch (error: any) {
    logger.error(`[DB] Failed to update job progress: ${error.message}`);
  }
}

export default generationWorker;
