"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * Базовый класс для скраперов
 */
class BaseScraper {
    baseUrl = '';
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    /**
     * HTTP GET запрос
     */
    async get(url, headers) {
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*',
                    ...headers,
                },
                timeout: 30000,
            });
            return response.data;
        }
        catch (error) {
            logger_1.default.error(`HTTP request failed: ${url} - ${error.message}`);
            throw error;
        }
    }
    /**
     * Парсинг цены из текста
     */
    parsePrice(text) {
        const patterns = [
            /(\d{1,3}(?:\s?\d{3})*)\s*₽/i,
            /(\d{1,3}(?:\s?\d{3})*)\s*руб/i,
            /budget[:\s]+(\d+)/i,
            /цена[:\s]+(\d+)/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return parseInt(match[1].replace(/\s/g, ''), 10);
            }
        }
        return null;
    }
}
exports.BaseScraper = BaseScraper;
//# sourceMappingURL=base.js.map