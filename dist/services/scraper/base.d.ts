/**
 * Базовый класс для скраперов
 */
export declare abstract class BaseScraper {
    protected baseUrl: string;
    protected userAgent: string;
    /**
     * Основной метод скрапинга
     */
    abstract scrape(url?: string): Promise<any[]>;
    /**
     * HTTP GET запрос
     */
    protected get(url: string, headers?: Record<string, string>): Promise<string>;
    /**
     * Парсинг цены из текста
     */
    protected parsePrice(text: string): number | null;
}
//# sourceMappingURL=base.d.ts.map