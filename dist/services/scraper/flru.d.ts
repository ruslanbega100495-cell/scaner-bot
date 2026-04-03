import { BaseScraper } from './base';
/**
 * FL.ru скрапер (RSS)
 */
export declare class FLruScraper extends BaseScraper {
    protected baseUrl: string;
    scrape(url?: string): Promise<any[]>;
    /**
     * Парсинг RSS ленты
     */
    private parseRSS;
    /**
     * Очистка HTML тегов
     */
    private stripHtml;
}
//# sourceMappingURL=flru.d.ts.map