"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deduplicator = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * Дедупликация заказов
 */
class Deduplicator {
    seenHashes = new Set();
    /**
     * Проверка на дубликат
     */
    async checkDuplicate(job) {
        // 1. Проверка по URL (точный дубликат)
        if (this.seenHashes.has(job.url)) {
            logger_1.default.info(`⏭️ Duplicate URL: ${job.url}`);
            return true;
        }
        // 2. Проверка по content hash
        const contentHash = this.computeContentHash(job);
        if (this.seenHashes.has(contentHash)) {
            logger_1.default.info(`⏭️ Duplicate content: ${contentHash}`);
            return true;
        }
        // Сохраняем хэши
        this.seenHashes.add(job.url);
        this.seenHashes.add(contentHash);
        // Ограничиваем размер множества (последние 10000)
        if (this.seenHashes.size > 10000) {
            const arr = Array.from(this.seenHashes);
            this.seenHashes = new Set(arr.slice(-5000));
        }
        return false;
    }
    /**
     * Вычисление хэша контента
     */
    computeContentHash(job) {
        // Нормализация текста
        const normalize = (text) => {
            return text
                .toLowerCase()
                .replace(/\s+/g, ' ')
                .replace(/[^\w\sа-яё]/g, '')
                .trim();
        };
        const title = normalize(job.title);
        const description = normalize(job.description).substring(0, 200);
        const price = `${job.priceMin || ''}${job.priceMax || ''}`;
        const content = `${title}|${description}|${price}`;
        return crypto_1.default.createHash('sha256').update(content).digest('hex');
    }
    /**
     * Очистка кэша
     */
    clear() {
        this.seenHashes.clear();
        logger_1.default.info('🧹 Deduplicator cache cleared');
    }
}
exports.Deduplicator = Deduplicator;
//# sourceMappingURL=deduplicator.js.map