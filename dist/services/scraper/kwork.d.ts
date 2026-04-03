import { BaseScraper } from './base';
/**
 * Kwork скрапер
 */
export declare class KworkScraper extends BaseScraper {
    protected baseUrl: string;
    scrape(url?: string): Promise<any[]>;
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
    private parseHTML;
}
//# sourceMappingURL=kwork.d.ts.map