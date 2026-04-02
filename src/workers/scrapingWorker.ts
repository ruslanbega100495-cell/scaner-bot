// src/workers/scrapingWorker.ts
import { Worker, Job } from 'bullmq';
import config from '../config';
import logger from '../utils/logger';
import { scrapingQueue, ScrapingJobData } from '../queues';
import { KworkScraper } from '../services/scraper/kwork';
import { FLruScraper } from '../services/scraper/flru';
import { TelegramScraper } from '../services/scraper/telegram';

// Скраперы
const scrapers = {
  kwork: new KworkScraper(),
  flru: new FLruScraper(),
  telegram: new TelegramScraper(),
};

/**
 * Воркер скрапинга
 */
export const scrapingWorker = new Worker(
  `${config.queuePrefix}_scraping`,
  async (job: Job<ScrapingJobData>) => {
    const { source, url } = job.data;
    
    logger.info(`🔍 Starting scraping: ${source}`);
    
    try {
      const scraper = scrapers[source as keyof typeof scrapers];
      
      if (!scraper) {
        throw new Error(`Unknown source: ${source}`);
      }
      
      // Запуск скрапинга
      let jobs = [];
      
      if (source === 'telegram') {
        // Telegram скрапит все каналы сразу (без URL)
        jobs = await scraper.scrape();
      } else {
        // Kwork и FL.ru скрапят по URL
        jobs = await scraper.scrape(url);
      }
      
      logger.info(`✅ Scraped ${jobs.length} jobs from ${source}`);
      
      // Добавляем задачи на обработку
      for (const jobData of jobs) {
        await import('../queues').then(({ addProcessingJob }) => 
          addProcessingJob(jobData)
        );
      }
      
      return { success: true, count: jobs.length };
      
    } catch (error: any) {
      logger.error(`❌ Scraping failed: ${source} - ${error.message}`);
      throw error;
    }
  },
  {
    connection: scrapingQueue.opts.connection,
    concurrency: 5,
  }
);

scrapingWorker.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed: ${JSON.stringify(result)}`);
});

scrapingWorker.on('failed', (job, error) => {
  logger.error(`Job ${job?.id} failed: ${error.message}`);
});

logger.info('🚀 Scraping worker started');