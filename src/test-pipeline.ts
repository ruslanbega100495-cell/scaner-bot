import config from '../config';
import logger from '../utils/logger';
import { addProcessingJob } from '../queues';

/**
 * Тестовый скрипт для проверки pipeline
 * Запускает тестовую задачу напрямую в processing queue
 */

async function runTest() {
  logger.info('🧪 Starting pipeline test...');
  
  // Тестовые данные
  const testData = {
    jobId: Date.now(),
    title: 'Разработать Telegram бота для магазина',
    description: 'Нужен Telegram бот для интернет-магазина. Функционал: каталог товаров, корзина, оформление заказа, оплата. Интеграция с 1С. Срок: 2 недели. Бюджет: 50000₽',
    source: 'kwork',
    url: 'https://kwork.ru/freelance/test-' + Date.now(),
    priceMin: 50000,
    priceMax: 50000,
  };
  
  logger.info('📝 Test job data:');
  logger.info(`   Title: ${testData.title}`);
  logger.info(`   Source: ${testData.source}`);
  logger.info(`   Price: ${testData.priceMin}₽`);
  logger.info(`   URL: ${testData.url}`);
  
  try {
    // Добавляем задачу в очередь processing
    const job = await addProcessingJob(testData);
    
    logger.info(`✅ Test job queued successfully!`);
    logger.info(`   Job ID: ${job.id}`);
    logger.info(`   Queue: ${job.queue.name}`);
    
    logger.info('⏳ Waiting for processing... (check logs in 5-10 seconds)');
    
    // Ждём 10 секунд для обработки
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    logger.info('✅ Test completed! Check logs and Telegram.');
    
  } catch (error: any) {
    logger.error(`❌ Test failed: ${error.message}`);
    logger.error(error.stack);
  }
}

// Запуск
runTest().then(() => {
  logger.info('🏁 Test script finished');
  process.exit(0);
}).catch((error) => {
  logger.error('💥 Test script crashed');
  logger.error(error);
  process.exit(1);
});
