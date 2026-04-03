"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIFilter = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * AI фильтрация заказов
 */
class AIFilter {
    ollamaUrl;
    model;
    constructor() {
        this.ollamaUrl = `${config_1.default.ollamaBaseUrl}/api/generate`;
        this.model = config_1.default.ollamaModel;
    }
    /**
     * Анализ заказа
     */
    async analyze(job) {
        const prompt = this.createPrompt(job);
        try {
            const response = await axios_1.default.post(this.ollamaUrl, {
                model: this.model,
                prompt: prompt,
                stream: false,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            const aiResponse = response.data.response || '';
            // Парсим ответ AI
            return this.parseAIResponse(aiResponse);
        }
        catch (error) {
            logger_1.default.error(`❌ AI filter failed: ${error.message}`);
            // Возвращаем дефолтный результат при ошибке
            return {
                isSuitable: false,
                score: 0,
                reason: 'AI service unavailable',
                technologies: [],
                priceFound: null,
            };
        }
    }
    /**
     * Создание промпта с ключевыми словами
     */
    createPrompt(job) {
        // Ключевые слова для фильтрации
        const keywords = [
            // Боты и Telegram
            'боты', 'создание бота', 'телеграм', 'telegram', 'tg bot',
            'мини апп', 'telegram mini app', 'web app telegram',
            // Сайты (основные)
            'сайт под ключ', 'создание сайта', 'веб-разработка', 'landing page',
            // Сайты (платформы)
            'вордпрес', 'wordpress', 'wp', 'инсейлс', 'insales', 'тильда', 'tilda',
            // Автоматизация
            'автоматизация бизнеса', 'n8n', 'make', 'zapier', 'автопостинг',
            // Парсинг и данные
            'парсинг', 'скрапинг', 'data extraction', 'web scraping',
            // Маркетплейсы
            'wildberries', 'валдберрис', 'ozon', 'маркетплейс', 'интеграция маркетплейс',
            // Технологии
            'api integration', 'python', 'node.js', 'typescript', 'php'
        ].join(', ');
        return `Ты — эксперт по анализу фриланс-заказов для разработчика.

НАШИ КЛЮЧЕВЫЕ НАВЫКИ (ищем только такие заказы):
${keywords}

ЗАДАЧА:
1. Подходит ли заказ под наши навыки? (строго по списку выше)
2. Оцени от 1 до 10 (10 = идеально подходит, бюджет от 3000₽, ясное ТЗ)
3. Извлеки упомянутые технологии

ПРАВИЛА ФИЛЬТРАЦИИ:
✅ Бери: боты, Telegram, Mini Apps, сайты (под ключ, создание, веб-разработка, landing page, WordPress, InSales, Tilda), парсинг, n8n, автоматизация, маркетплейсы (WB, Ozon)
✅ Бери: бюджет от 3000₽, понятное описание, адекватный заказчик
❌ Отклоняй: дизайн без кода, копирайтинг, "просто консультация", бюджет <3000₽, спам, не по теме

ЗАКАЗ:
Заголовок: ${job.title}
Описание: ${job.description.substring(0, 600)}
${job.price ? `Цена: ${job.price}₽` : 'Цена: не указана'}

ВЕРНИ СТРОГО JSON:
{
  "is_suitable": true/false,
  "score": 0-10,
  "reason": "кратко: почему подходит/нет, упоминание бюджета",
  "technologies": ["найдены", "технологии"],
  "price_found": число или null
}

Ответ ТОЛЬКО JSON, без пояснений, без markdown.`;
    }
    /**
     * Парсинг ответа AI
     */
    parseAIResponse(response) {
        try {
            // Очищаем от markdown
            const cleaned = response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            const parsed = JSON.parse(cleaned);
            return {
                isSuitable: parsed.is_suitable || false,
                score: parsed.score || 0,
                reason: parsed.reason || 'No reason provided',
                technologies: parsed.technologies || [],
                priceFound: parsed.price_found || null,
            };
        }
        catch (error) {
            logger_1.default.error(`Failed to parse AI response: ${error}`);
            return {
                isSuitable: false,
                score: 0,
                reason: 'Failed to parse AI response',
                technologies: [],
                priceFound: null,
            };
        }
    }
}
exports.AIFilter = AIFilter;
//# sourceMappingURL=aiFilter.js.map