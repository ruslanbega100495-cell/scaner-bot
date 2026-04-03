export interface AIResult {
    isSuitable: boolean;
    score: number;
    reason: string;
    technologies: string[];
    priceFound: number | null;
}
/**
 * AI фильтрация заказов
 */
export declare class AIFilter {
    private ollamaUrl;
    private model;
    constructor();
    /**
     * Анализ заказа
     */
    analyze(job: {
        title: string;
        description: string;
        price?: number | null;
    }): Promise<AIResult>;
    /**
     * Создание промпта с ключевыми словами
     */
    private createPrompt;
    /**
     * Парсинг ответа AI
     */
    private parseAIResponse;
}
//# sourceMappingURL=aiFilter.d.ts.map