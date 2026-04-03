/**
 * Дедупликация заказов
 */
export declare class Deduplicator {
    private seenHashes;
    /**
     * Проверка на дубликат
     */
    checkDuplicate(job: {
        title: string;
        description: string;
        url: string;
        priceMin?: number | null;
        priceMax?: number | null;
    }): Promise<boolean>;
    /**
     * Вычисление хэша контента
     */
    private computeContentHash;
    /**
     * Очистка кэша
     */
    clear(): void;
}
//# sourceMappingURL=deduplicator.d.ts.map