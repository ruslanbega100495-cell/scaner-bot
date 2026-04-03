"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KworkScraper = void 0;
const base_1 = require("./base");
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * Kwork скрапер
 */
class KworkScraper extends base_1.BaseScraper {
    baseUrl = 'https://kwork.ru/projects';
    async scrape(url) {
        const scrapeUrl = url || this.baseUrl;
        logger_1.default.info(`🔍 Scraping Kwork: ${scrapeUrl}`);
        try {
            const html = await this.get(scrapeUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                },
            });
            // DEBUG: сохраняем сырой HTML для анализа
            // Открой файл debug-kwork.html в браузере и посмотри структуру
            Promise.resolve().then(() => __importStar(require('fs'))).then(fs => {
                fs.writeFileSync('debug-kwork.html', html);
                logger_1.default.info('📄 Saved debug-kwork.html');
            });
            const jobs = this.parseHTML(html);
            logger_1.default.info(`✅ Kwork scraped: ${jobs.length} jobs`);
            return jobs;
        }
        catch (error) {
            logger_1.default.error(`❌ Kwork scraping failed: ${error.message}`);
            return [];
        }
    }
    /**
     * Парсинг HTML Kwork
     *
     * ⚠️ ВНИМАНИЕ: Kwork использует React (JavaScript-рендеринг),
     * поэтому простой axios + regex не видит контент.
     *
     * РЕШЕНИЯ:
     * 1. Использовать моки (ниже) для тестов
     * 2. Переписать на Playwright для реального парсинга
     * 3. Использовать официальный API (если есть)
     */
    parseHTML(html) {
        // ========================================
        // 🔧 ВРЕМЕННО: моки для тестов пайплайна
        // ========================================
        // Удали этот блок, когда настроишь настоящий парсер
        logger_1.default.info('⚠️ Using mock data (Kwork renders via JS)');
        return [
            {
                jobId: Date.now(),
                title: 'Создание Telegram бота для магазина',
                description: 'Нужен бот для приёма заказов в Телеграм. Интеграция с базой данных, оплата, уведомления.',
                url: 'https://kwork.ru/projects/12345',
                priceMin: 5000,
                priceMax: 10000,
                source: 'kwork',
            },
            {
                jobId: Date.now() + 1,
                title: 'Парсинг Wildberries + выгрузка в Excel',
                description: 'Собрать данные о товарах с WB: название, цена, рейтинг. Выгрузить в CSV. Python + Selenium.',
                url: 'https://kwork.ru/projects/12346',
                priceMin: 3500,
                priceMax: 3500,
                source: 'kwork',
            },
            {
                jobId: Date.now() + 2,
                title: 'Сайт на Tilda под ключ',
                description: 'Лендинг для услуги. Дизайн готов, нужно сверстать и настроить формы. Tilda / Zero Block.',
                url: 'https://kwork.ru/projects/12347',
                priceMin: 4000,
                priceMax: 4000,
                source: 'kwork',
            },
        ];
        // ========================================
        // 🛠️ НАСТОЯЩИЙ ПАРСЕР (раскомментируй позже)
        // ========================================
        /*
        import * as cheerio from 'cheerio';
        const $ = cheerio.load(html);
        const jobs: any[] = [];
        
        // Селекторы нужно уточнить по debug-kwork.html
        $('[data-project-id], .project-card, .kwork-item').each((i, el) => {
          const $el = $(el);
          const title = $el.find('a.title, h3 a').first().text().trim();
          const href = $el.find('a.title, h3 a').first().attr('href');
          const priceText = $el.find('.price, .budget').first().text();
          
          if (!title || !href) return;
          
          const priceMatch = priceText.match(/(\d{1,3}(?:\s?\d{3})*)\s*₽/);
          const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ''), 10) : undefined;
          const idMatch = href.match(/\/projects\/(\d+)/);
          
          jobs.push({
            jobId: idMatch ? parseInt(idMatch[1], 10) : Date.now() + i,
            title,
            description: $el.find('.desc').first().text().trim(),
            url: href.startsWith('http') ? href : `https://kwork.ru${href}`,
            priceMin: price,
            priceMax: price,
            source: 'kwork',
          });
        });
        
        return jobs.slice(0, 10);
        */
    }
}
exports.KworkScraper = KworkScraper;
//# sourceMappingURL=kwork.js.map