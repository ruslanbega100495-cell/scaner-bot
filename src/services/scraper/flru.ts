import { BaseScraper } from './base';
import logger from '../../utils/logger';
import * as cheerio from 'cheerio';

export class FLruScraper extends BaseScraper {
  // ✅ Используем HTML-страницу вместо RSS
  protected baseUrl = 'https://www.fl.ru/projects/';
  
  async scrape(url?: string): Promise<any[]> {
    const scrapeUrl = url || this.baseUrl;
    logger.info(`🔍 Scraping FL.ru HTML: ${scrapeUrl}`);
    
    try {
      const html = await this.get(scrapeUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        },
        timeout: 30000,
      });
      
      const jobs = this.parseHTML(html);
      logger.info(`✅ FL.ru scraped: ${jobs.length} jobs`);
      return jobs;
      
    } catch (error: any) {
      logger.error(`❌ FL.ru scraping failed: ${error.message}`);
      return [];
    }
  }
  
  private parseHTML(html: string): any[] {
    const $ = cheerio.load(html);
    const jobs: any[] = [];
    
    // Ищем проекты по разным возможным селекторам
    $('a[href*="/projects/"]').each((i, el) => {
      if (i >= 10) return; // Лимит для теста
      
      const $el = $(el);
      const title = $el.text().trim();
      const href = $el.attr('href');
      
      if (!title || !href || title.length < 10) return;
      
      // Пропускаем если это не проект
      if (!href.includes('/projects/')) return;
      
      // Формируем полный URL
      const fullUrl = href.startsWith('http') ? href : `https://www.fl.ru${href}`;
      
      // Парсим цену из текста (если есть)
      const priceMatch = title.match(/(\d{1,3}(?:\s?\d{3})*)\s*₽/i) || 
                        title.match(/(\d{1,3}(?:\s?\d{3})*)\s*руб\.?/i);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ''), 10) : undefined;
      
      // Извлекаем ID
      const idMatch = fullUrl.match(/\/projects\/(\d+)/);
      const jobId = idMatch ? parseInt(idMatch[1], 10) : Date.now() + i;
      
      jobs.push({
        jobId,
        title: title.substring(0, 200),
        description: title.substring(0, 500),
        url: fullUrl,
        priceMin: price,
        priceMax: price,
        source: 'flru',
      });
    });
    
    // Удаляем дубликаты по URL
    const unique = new Map();
    for (const job of jobs) {
      if (!unique.has(job.url)) unique.set(job.url, job);
    }
    
    return Array.from(unique.values());
  }
}