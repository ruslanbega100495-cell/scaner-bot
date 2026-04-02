// src/workers/notificationWorker.ts
import { Worker, Job } from 'bullmq';
import config from '../config';
import logger from '../utils/logger';
import { notificationQueue, NotificationJobData } from '../queues';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(config.telegramBotToken, { polling: false });
logger.info(`📬 Telegram worker initialized for bot`);

export const notificationWorker = new Worker(
  `${config.queuePrefix}_notification`,
  async (job: Job<NotificationJobData>) => {
    const { telegramId, message, jobId, userId } = job.data;
    
    logger.info(`📬 [Notification] Processing job ${job.id}`);
    
    try {
      const safeMessage = message
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      
      const result = await bot.sendMessage(telegramId, safeMessage, { 
        parse_mode: 'HTML' 
      });
      
      logger.info(`✅ [Telegram] Message sent! ID: ${result.message_id}`);
      
      try {
        const { default: prisma } = await import('../config/database');
        // ✅ ИСПРАВЛЕНО: добавлен ключ "data:"
        await prisma.scannerNotification.updateMany({
          where: { jobId },
          data: { status: 'SENT', sentAt: new Date() }
        });
      } catch (e: any) {
        logger.warn(`⚠️ DB update failed: ${e.message}`);
      }
      
      return { success: true, messageId: result.message_id };
      
    } catch (error: any) {
      logger.error(`❌ [Telegram] Failed: ${error.message}`);
      
      if (error.code === 'ETELEGRAM' && error.response?.body?.error_code === 403) {
        logger.warn(`⚠️ User ${telegramId} blocked the bot`);
        return { success: false, reason: 'blocked' };
      }
      if (error.code === 'ETELEGRAM' && error.response?.body?.error_code === 401) {
        logger.error(`❌ Invalid bot token`);
        return { success: false, reason: 'unauthorized' };
      }
      throw error;
    }
  },
  { 
    connection: notificationQueue.opts.connection, 
    concurrency: 10 
  }
);

notificationWorker.on('completed', (job, result) => {
  logger.info(`✅ Job ${job.id} completed: ${JSON.stringify(result)}`);
});

notificationWorker.on('failed', (job, error) => {
  logger.error(`❌ Job ${job?.id} failed: ${error.message}`);
});

logger.info('🚀 Notification worker started');