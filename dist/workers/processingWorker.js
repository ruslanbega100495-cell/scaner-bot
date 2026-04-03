"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processingWorker = void 0;
const bullmq_1 = require("bullmq");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const queues_1 = require("../queues");
const aiFilter_1 = require("../services/processor/aiFilter");
const deduplicator_1 = require("../services/processor/deduplicator");
const database_1 = __importDefault(require("../config/database"));
const aiFilter = new aiFilter_1.AIFilter();
const deduplicator = new deduplicator_1.Deduplicator();
/**
 * Воркер обработки заказов
 */
exports.processingWorker = new bullmq_1.Worker(`${config_1.default.queuePrefix}_processing`, // ← Исправлено! Было :processing
async (job) => {
    const { jobId, title, description, source, url, priceMin, priceMax } = job.data;
    logger_1.default.info(`⚙️ Processing job: ${title}`);
    try {
        // 1. Проверка на дубликат
        const isDuplicate = await deduplicator.checkDuplicate({
            title,
            description: description || '',
            url,
            priceMin,
            priceMax,
        });
        if (isDuplicate) {
            logger_1.default.info(`⏭️ Duplicate skipped: ${title}`);
            return { success: false, reason: 'duplicate' };
        }
        // 2. AI фильтрация
        const aiResult = await aiFilter.analyze({
            title,
            description: description || '',
            price: priceMin || priceMax,
        });
        logger_1.default.info(`🤖 AI Score: ${aiResult.score}/10 - ${aiResult.isSuitable ? '✅' : '❌'}`);
        // 3. Сохранение в БД
        const newJob = await database_1.default.job.create({
            data: {
                sourceId: 1, // TODO: получить из названия source
                externalId: String(jobId),
                url,
                title,
                description,
                priceMin,
                priceMax,
                aiScore: aiResult.score,
                aiReason: aiResult.reason,
                isSuitable: aiResult.isSuitable,
                status: aiResult.isSuitable ? 'READY' : 'REJECTED',
            },
        });
        // 4. Если подходит - добавляем уведомление
        if (aiResult.isSuitable) {
            const adminTelegramId = parseInt(config_1.default.telegramAdminId, 10);
            const message = formatNotificationMessage({
                title,
                source,
                url,
                price: priceMin || priceMax,
                aiScore: aiResult.score,
            });
            await (0, queues_1.addNotificationJob)({
                userId: 'admin',
                telegramId: adminTelegramId,
                jobId: newJob.id,
                message,
                priority: aiResult.score >= 8 ? 'high' : 'normal',
            });
        }
        return { success: true, jobId: newJob.id, suitable: aiResult.isSuitable };
    }
    catch (error) {
        logger_1.default.error(`❌ Processing failed: ${error.message}`);
        throw error;
    }
}, {
    connection: queues_1.processingQueue.opts.connection,
    concurrency: 3, // 3 параллельные задачи (AI тяжёлый)
});
exports.processingWorker.on('completed', (job, result) => {
    logger_1.default.info(`✅ Job ${job.id} processed: ${JSON.stringify(result)}`);
});
exports.processingWorker.on('failed', (job, error) => {
    logger_1.default.error(`❌ Job ${job?.id} failed: ${error.message}`);
});
logger_1.default.info('🚀 Processing worker started');
// ============================================
// HELPERS
// ============================================
function formatNotificationMessage(data) {
    return `🎯 *Новый заказ!*

📌 *Источник:* ${data.source}
📝 *Заголовок:* ${data.title}
💰 *Цена:* ${data.price ? `${data.price} ₽` : 'Не указана'}
🤖 *AI оценка:* ${data.aiScore}/10

🔗 *Ссылка:* ${data.url}

—
_AI-агент_`;
}
//# sourceMappingURL=processingWorker.js.map