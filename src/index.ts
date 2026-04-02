// src/index.ts
import config from './config';
import { setupBotCommands } from './bot/commands';
import TelegramBot from 'node-telegram-bot-api';
import logger from './utils/logger';
import { connectDatabase } from './config/database';
import { scrapingWorker } from './workers/scrapingWorker';
import { processingWorker } from './workers/processingWorker';
import { notificationWorker } from './workers/notificationWorker';
import app from './api/server';
import { startAutoScrape } from './utils/scheduler';

// ✅ Инициализируем бота ОДИН РАЗ здесь (не в воркерах!)
const bot = new TelegramBot(config.telegramBotToken, { polling: true });

async function bootstrap() {
  logger.info('🚀 Starting Freelance Monitoring System...');
  
  try {
    await connectDatabase();
    logger.info('✅ Database connected');
    
    // ✅ Инициализация команд бота
    setupBotCommands(bot);
    logger.info('✅ Bot commands initialized');
    
    logger.info('👷 Workers started');
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`🚀 Server started on port ${PORT}`);
      logger.info(`📍 Health: http://localhost:${PORT}/health`);
    });
    
    startAutoScrape();
    logger.info('✅ System started');
    
  } catch (error) {
    logger.error(`❌ Failed to start: ${error}`);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down gracefully...');
  await scrapingWorker.close();
  await processingWorker.close();
  await notificationWorker.close();
  bot.stopPolling(); // ✅ Останавливаем polling при выходе
  process.exit(0);
});

bootstrap();