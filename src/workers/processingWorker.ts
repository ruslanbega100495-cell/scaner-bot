// src/workers/processingWorker.ts
import { Worker, Job } from 'bullmq';
import config from '../config';
import logger from '../utils/logger';
import { processingQueue, ProcessingJobData, addNotificationJob } from '../queues';
import { AIFilter } from '../services/processor/aiFilter';
import { Deduplicator } from '../services/processor/deduplicator';
import prisma from '../config/database';

// Инициализация с проверкой
let aiFilter: AIFilter;
let deduplicator: Deduplicator;

try {
  aiFilter = new AIFilter();
  deduplicator = new Deduplicator();
  logger.info('✅ Processing worker initialized successfully');
} catch (error: any) {
  logger.error(`❌ Failed to initialize processing worker: ${error.message}`);
  throw error;
}

// Маппинг источников
const SOURCE_MAP: Record<string, string> = {
  'kwork': 'Kwork',
  'flru': 'FL.ru',
  'telegram': 'Telegram',
};

/**
 * Получить или создать Source
 */
async function getOrCreateSource(sourceName: string): Promise<number> {
  const displayName = SOURCE_MAP[sourceName] || sourceName;

  let source = await prisma.scannerSource.findFirst({
    where: { name: displayName },
  });

  if (!source) {
    source = await prisma.scannerSource.create({
      data: {
        name: displayName,
        type: sourceName === 'telegram' ? 'TELEGRAM' : 'WEBSITE',
        url: sourceName === 'kwork' ? 'https://kwork.ru/freelance' :
             sourceName === 'flru' ? 'https://www.fl.ru/projects/' :
             'https://t.me/',
        isActive: true,
        scanInterval: 300,
        rateLimit: 60,
      },
    });
    logger.info(`✅ Source created: ${displayName} (ID: ${source.id})`);
  }

  return source.id;
}

/**
 * Воркер обработки заказов
 */
export const processingWorker = new Worker(
  `${config.queuePrefix}_processing`,
  async (job: Job<ProcessingJobData>) => {
    const { jobId, title, description, source, url, priceMin, priceMax } = job.data;

    logger.info(`⚙️ Processing job: ${title} (Source: ${source})`);

    try {
      // 1. Проверка на дубликат
      logger.info(`🔍 Checking duplicate for: ${url}`);
      const isDuplicate = await deduplicator.checkDuplicate({
        title,
        description: description || '',
        url,
        priceMin,
        priceMax,
      });

      if (isDuplicate) {
        logger.info(`⏭️ Duplicate skipped: ${title}`);
        return { success: false, reason: 'duplicate' };
      }
      logger.info(`✅ Not a duplicate`);

      // 2. AI фильтрация (с graceful fallback)
      let aiResult;
      try {
        logger.info(`🤖 Running AI filter...`);
        aiResult = await aiFilter.analyze({
          title,
          description: description || '',
          price: priceMin || priceMax,
        });
        logger.info(`🤖 AI Score: ${aiResult.score}/10 - ${aiResult.isSuitable ? '✅' : '❌'}`);
      } catch (aiError: any) {
        logger.warn(`⚠️ AI filter failed, using fallback: ${aiError.message}`);
        aiResult = {
          isSuitable: true,
          score: 10,
          reason: 'AI unavailable - using fallback',
          technologies: [],
          priceFound: priceMin || priceMax || null,
        };
      }

      // 3. Получаем или создаём Source
      let sourceId: number;
      try {
        sourceId = await getOrCreateSource(source);
        logger.info(`📌 Using Source ID: ${sourceId}`);
      } catch (sourceError: any) {
        logger.error(`❌ Failed to get/create source: ${sourceError.message}`);
        sourceId = 1;
      }

      // 4. Сохранение в БД
      let newJob;
      try {
        newJob = await prisma.scannerJob.create({
          data: {
            sourceId,
            externalId: String(jobId),
            url,
            title,
            description: description || null,
            priceMin,
            priceMax,
            aiScore: aiResult.score,
            aiReason: aiResult.reason,
            isSuitable: aiResult.isSuitable,
            status: aiResult.isSuitable ? 'READY' : 'REJECTED',
          },
        });
        logger.info(`💾 Job saved to DB: ID=${newJob.id}`);
      } catch (dbError: any) {
        if (dbError.code === 'P2002') {
          logger.warn(`⚠️ Job already exists, fetching existing`);
          newJob = await prisma.scannerJob.findFirst({ where: { url } });
          if (!newJob) {
            logger.error(`❌ Failed to fetch existing job`);
            throw new Error('Failed to fetch existing job');
          }
        } else {
          logger.error(`❌ Database error: ${dbError.message}`);
          throw dbError;
        }
      }

      // 5. Если подходит - отправляем в Telegram
      if (aiResult.isSuitable) {
        logger.info(`✅ Job is suitable, sending to Telegram...`);

        const adminTelegramId = parseInt(config.telegramAdminId, 10);

        if (isNaN(adminTelegramId)) {
          logger.error(`❌ Invalid Telegram ID: ${config.telegramAdminId}`);
          return { success: true, jobId: Number(newJob.id), suitable: true, telegramError: 'Invalid admin ID' };
        }

        const message = formatNotificationMessage({
          title,
          source,
          url,
          price: priceMin || priceMax,
          aiScore: aiResult.score,
        });

        logger.info(`📬 Sending Telegram message to: ${adminTelegramId}`);

        try {
          await addNotificationJob({
            userId: 'admin',
            telegramId: adminTelegramId,
            jobId: Number(newJob.id),
            message,
            priority: aiResult.score >= 8 ? 'high' : 'normal',
          });
          logger.info(`✅ Notification queued successfully`);
        } catch (notifError: any) {
          logger.error(`❌ Failed to queue notification: ${notifError.message}`);
          return { success: true, jobId: Number(newJob.id), suitable: true, telegramError: notifError.message };
        }
      } else {
        logger.info(`❌ Job not suitable, skipping notification`);
      }

      return { success: true, jobId: Number(newJob.id), suitable: aiResult.isSuitable };

    } catch (error: any) {
      logger.error(`❌ Processing failed: ${error.message}`);
      logger.error(`Stack trace: ${error.stack}`);
      return { success: false, error: error.message };
    }
  },
  {
    connection: processingQueue.opts.connection,
    concurrency: 3,
  }
);

processingWorker.on('completed', (job, result) => {
  logger.info(`✅ Job ${job.id} completed: ${JSON.stringify(result)}`);
});

processingWorker.on('failed', (job, error) => {
  logger.error(`❌ Job ${job?.id} failed: ${error.message}`);
});

// ============================================
// HELPERS
// ============================================

/**
 * Экранирует текст для Telegram (убирает спецсимволы Markdown)
 */
function escapeForTelegram(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/\=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.');
}

/**
 * Формирует безопасное сообщение для Telegram
 */
function formatNotificationMessage(data: {
  title: string;
  source: string;
  url: string;
  price?: number;
  aiScore: number;
}): string {
  const safeTitle = escapeForTelegram(data.title);
  const safeSource = escapeForTelegram(data.source);

  return `🎯 Новый заказ!
📌 Источник: ${safeSource}
📝 Заголовок: ${safeTitle}
💰 Цена: ${data.price ? `${data.price} ₽` : 'Не указана'}
🤖 AI оценка: ${data.aiScore}/10

🔗 Открыть заказ: ${data.url}

—
AI-агент`;
}

logger.info('🚀 Processing worker started');
