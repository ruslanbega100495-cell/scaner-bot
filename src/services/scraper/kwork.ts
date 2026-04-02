import { BaseScraper } from './base';
import logger from '../../utils/logger';
import { chromium } from 'playwright';

export class KworkScraper extends BaseScraper {
  protected baseUrl = 'https://kwork.ru/projects';

  async scrape(): Promise<any[]> {
    logger.info('🔥 Playwright scraper started (Kwork)');

    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      await page.goto(this.baseUrl, {
        waitUntil: 'domcontentloaded',
      });

      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);

      // 🔥 Более универсальные селекторы
      const items = await page.$$('a[href*="/project"]');

      const jobs: any[] = [];

      for (const item of items) {
        const title = await item.innerText().catch(() => '');
        const href = await item.getAttribute('href');

        if (!title || !href) continue;

        jobs.push({
          jobId: Date.now() + Math.random(),
          title: title.trim(),
          description: title.trim(),
          url: href.startsWith('http')
            ? href
            : `https://kwork.ru${href}`,
          priceMin: null,
          priceMax: null,
          source: 'kwork',
        });
      }

      logger.info(`✅ Scraped ${jobs.length} jobs from kwork`);

      return jobs.slice(0, 10);
    } catch (error: any) {
      logger.error(`❌ Playwright scraping failed: ${error.message}`);
      return [];
    } finally {
      await browser.close();
    }
  }
}