import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';

// Redis подключение
const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

// ============================================
// QUEUES
// ============================================

// Очередь скрапинга
export const scrapingQueue = new Queue(`${config.queuePrefix}_scraping`, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Очередь обработки
export const processingQueue = new Queue(`${config.queuePrefix}_processing`, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Очередь уведомлений
export const notificationQueue = new Queue(`${config.queuePrefix}_notification`, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

// ============================================
// JOB INTERFACES
// ============================================

export interface ScrapingJobData {
  source: string;
  url?: string;
  priority?: 'high' | 'normal' | 'low';
}

export interface ProcessingJobData {
  jobId: number;
  title: string;
  description?: string;
  source: string;
  url: string;
  priceMin?: number;
  priceMax?: number;
}

export interface NotificationJobData {
  userId: string;
  telegramId: number;
  jobId: number;
  message: string;
  priority?: 'high' | 'normal' | 'low';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Добавить задачу на скрапинг
 */
export async function addScrapingJob(data: ScrapingJobData) {
  const job = await scrapingQueue.add('scrape', data, {
    priority: data.priority === 'high' ? 10 : data.priority === 'low' ? 1 : 5,
  });
  
  logger.info(`📝 Scraping job added: ${job.id} - ${data.source}`);
  return job;
}

/**
 * Добавить задачу на обработку
 */
export async function addProcessingJob(data: ProcessingJobData) {
  const job = await processingQueue.add('process', data);
  
  logger.info(`⚙️ Processing job added: ${job.id} - ${data.title}`);
  return job;
}

/**
 * Добавить задачу на уведомление
 */
export async function addNotificationJob(data: NotificationJobData) {
  const job = await notificationQueue.add('notify', data, {
    priority: data.priority === 'high' ? 10 : data.priority === 'low' ? 1 : 5,
  });
  
  logger.info(`📬 Notification job added: ${job.id} - User ${data.telegramId}`);
  return job;
}

export { connection };