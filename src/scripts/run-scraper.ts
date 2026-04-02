// src/scripts/run-scraper.ts
import { KworkScraper } from '../services/scraper/kwork';
import { FLruScraper } from '../services/scraper/flru';
import { TelegramScraper } from '../services/scraper/telegram';
import { AIFilter } from '../services/processor/aiFilter';
import prisma from '../config/database';
import TelegramBot from 'node-telegram-bot-api';

async function run() {
  console.log('🚀 Starting scraper...');
  
  const aiFilter = new AIFilter();
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
  const adminId = parseInt(process.env.TELEGRAM_ADMIN_ID!, 10);
  const minPrice = parseInt(process.env.MIN_PRICE_FILTER || '1000', 10);
  
  const sources = [
    { name: 'kwork', scraper: new KworkScraper() },
    { name: 'flru', scraper: new FLruScraper() },
    { name: 'telegram', scraper: new TelegramScraper() },
  ];
  
  for (const { name, scraper } of sources) {
    console.log(`🔍 Scraping ${name}...`);
    
    try {
      const jobs = await scraper.scrape();
      console.log(`✅ ${name}: ${jobs.length} jobs`);
      
      for (const job of jobs) {
        // 1. Проверка дубликата
        const exists = await prisma.scannerJob.findFirst({ 
          where: { url: job.url } 
        });
        if (exists) {
          console.log(`⏭️ Duplicate: ${job.title}`);
          continue;
        }
        
        // 2. AI фильтрация
        const aiResult = await aiFilter.analyze({
          title: job.title,
          description: job.description || '',
          price: job.priceMin || job.priceMax,
        });
        
        if (!aiResult.isSuitable || aiResult.score < 7) {
          console.log(`❌ AI rejected: ${job.title} (score: ${aiResult.score})`);
          continue;
        }
        
        // 3. Проверка цены
        const jobPrice = job.priceMin || job.priceMax;
        if (jobPrice && jobPrice < minPrice) {
          console.log(`❌ Price too low: ${job.title} (${jobPrice}₽)`);
          continue;
        }
        
        // 4. Получаем или создаём источник
        let source = await prisma.scannerSource.findFirst({ 
          where: { name } 
        });
        
        if (!source) {
          source = await prisma.scannerSource.create({
            data: {
              name,
              type: name === 'telegram' ? 'TELEGRAM' : 'WEBSITE',
              url: name === 'kwork' ? 'https://kwork.ru/freelance' :
                   name === 'flru' ? 'https://www.fl.ru/projects/' :
                   'https://t.me/',
              isActive: true,
              scanInterval: 900,
              rateLimit: 60,
            },
          });
        }
        
        // 5. Сохранение в БД
        await prisma.scannerJob.create({
          data: {
            sourceId: source.id,
            externalId: String(job.jobId),
            url: job.url,
            title: job.title.substring(0, 200),
            description: job.description?.substring(0, 1000) || null,
            priceMin: job.priceMin,
            priceMax: job.priceMax,
            aiScore: aiResult.score,
            aiReason: aiResult.reason,
            isSuitable: true,
            status: 'SENT',
            scrapedAt: new Date(),
          },
        });
        
        // 6. Отправка в Telegram
        const message = `🎯 Новый заказ!
📌 Источник: ${name}
📝 ${job.title.substring(0, 100)}${job.title.length > 100 ? '...' : ''}
💰 ${jobPrice ? `${jobPrice} ₽` : 'Не указана'}
🤖 AI оценка: ${aiResult.score}/10

🔗 ${job.url}`;
        
        await bot.sendMessage(adminId, message);
        console.log(`📬 Sent: ${job.title}`);
        
        // Пауза чтобы не спамить
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error: any) {
      console.error(`❌ Error scraping ${name}: ${error.message}`);
    }
  }
  
  console.log('✅ Scraper finished');
  process.exit(0);
}

run().catch(console.error);