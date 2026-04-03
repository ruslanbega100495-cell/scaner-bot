"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLruScraper = void 0;
const base_1 = require("./base");
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * FL.ru скрапер (RSS)
 */
class FLruScraper extends base_1.BaseScraper {
    baseUrl = 'https://www.fl.ru/projects/rss/';
    async scrape(url) {
        const scrapeUrl = url || this.baseUrl;
        logger_1.default.info(`🔍 Scraping FL.ru: ${scrapeUrl}`);
        try {
            const xml = await this.get(scrapeUrl);
            // Парсинг RSS
            const jobs = this.parseRSS(xml);
            logger_1.default.info(`✅ FL.ru scraped: ${jobs.length} jobs`);
            return jobs;
        }
        catch (error) {
            logger_1.default.error(`❌ FL.ru scraping failed: ${error.message}`);
            return [];
        }
    }
    /**
     * Парсинг RSS ленты
     */
    parseRSS(xml) {
        const jobs = [];
        // Разбираем RSS entries
        const items = xml.split('<item>');
        for (let i = 1; i < items.length; i++) { // Пропускаем первый элемент
            const item = items[i];
            // Извлекаем данные
            const titleMatch = item.match(/<title><!\[CDATA\[(.+?)\]\]><\/title>/);
            const linkMatch = item.match(/<link>(.+?)<\/link>/);
            const descMatch = item.match(/<description><!\[CDATA\[(.+?)\]\]><\/description>/);
            const guidMatch = item.match(/<guid>(.+?)<\/guid>/);
            if (titleMatch && linkMatch) {
                const job = {
                    jobId: guidMatch ? guidMatch[1] : i,
                    title: titleMatch[1].trim(),
                    description: descMatch ? this.stripHtml(descMatch[1]) : '',
                    url: linkMatch[1],
                    source: 'flru',
                };
                // Парсим цену из описания
                if (descMatch) {
                    job.priceMin = this.parsePrice(descMatch[1]);
                }
                jobs.push(job);
            }
        }
        return jobs.slice(0, 10); // Первые 10 для MVP
    }
    /**
     * Очистка HTML тегов
     */
    stripHtml(html) {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }
}
exports.FLruScraper = FLruScraper;
//# sourceMappingURL=flru.js.map