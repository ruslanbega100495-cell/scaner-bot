// src/utils/scheduler.ts
import { addScrapingJob } from '../queues';
import logger from './logger';

const SCAN_INTERVAL = Number(process.env.SCAN_INTERVAL_MS) || 5 * 60 * 1000; // 5 минут по умолчанию

/**
 * Автоматический запуск скрапинга по расписанию
 */
export function startAutoScrape(): void {
  const sources = ['kwork', 'flru', 'telegram'];
  
  logger.info(`🕒 Auto-scrape started: каждые ${SCAN_INTERVAL / 1000}сек для ${sources.join(', ')}`);

  // Запускаем первый скрапинг сразу через 3 секунды после старта
  setTimeout(() => {
    runScrapeCycle(sources);
    
    // Затем запускаем цикл по расписанию
    setInterval(() => {
      runScrapeCycle(sources);
    }, SCAN_INTERVAL);
  }, 3000);
}

/**
 * Запустить скрапинг всех источников по очереди
 */
async function runScrapeCycle(sources: string[]): Promise<void> {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  logger.info(`\n🔄 [${timestamp}] Запуск цикла скрапинга...`);

  for (const source of sources) {
    try {
      logger.info(`🔍 Запуск скрапинга: ${source}`);
      
      const job = await addScrapingJob({
        source,
        priority: 'normal',
      });
      
      logger.info(`✅ ${source}: задача добавлена в очередь (ID: ${job.id})`);
      
      // Небольшая пауза между источниками (1 секунда)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error: any) {
      logger.error(`❌ Ошибка при скрапинге ${source}: ${error.message}`);
    }
  }

  logger.info(`✅ Цикл скрапинга завершён\n`);
}

logger.info('📅 Scheduler module loaded');
