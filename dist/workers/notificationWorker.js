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
exports.notificationWorker = void 0;
const bullmq_1 = require("bullmq");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const queues_1 = require("../queues");
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
// Telegram бот
const bot = new node_telegram_bot_api_1.default(config_1.default.telegramBotToken);
/**
 * Воркер уведомлений
 */
exports.notificationWorker = new bullmq_1.Worker(`${config_1.default.queuePrefix}_notification`, // ← Исправлено! Было :notification
async (job) => {
    const { telegramId, message, jobId } = job.data;
    logger_1.default.info(`📬 Sending notification to ${telegramId}`);
    try {
        // Отправка сообщения
        await bot.sendMessage(telegramId, message, {
            parse_mode: 'Markdown',
        });
        logger_1.default.info(`✅ Notification sent to ${telegramId}`);
        // Обновление статуса в БД
        await Promise.resolve().then(() => __importStar(require('../config/database'))).then(({ default: prisma }) => prisma.notification.updateMany({
            where: { jobId },
            data: {
                status: 'SENT',
                sentAt: new Date(),
            },
        }));
        return { success: true };
    }
    catch (error) {
        logger_1.default.error(`❌ Notification failed: ${error.message}`);
        // Если пользователь заблокировал бота
        if (error.code === 'ETELEGRAM' && error.response.body.error_code === 403) {
            logger_1.default.warn(`User ${telegramId} blocked the bot`);
            // Помечаем уведомление как failed
            await Promise.resolve().then(() => __importStar(require('../config/database'))).then(({ default: prisma }) => prisma.notification.updateMany({
                where: { jobId },
                data: {
                    status: 'FAILED',
                    errorMessage: 'User blocked the bot',
                },
            }));
            // Не retry'им если заблокировано
            return { success: false, reason: 'blocked' };
        }
        throw error;
    }
}, {
    connection: queues_1.notificationQueue.opts.connection,
    concurrency: 10, // 10 параллельных отправок (I/O bound)
});
exports.notificationWorker.on('completed', (job, result) => {
    logger_1.default.info(`📬 Job ${job.id} notification completed: ${JSON.stringify(result)}`);
});
exports.notificationWorker.on('failed', (job, error) => {
    logger_1.default.error(`❌ Job ${job?.id} notification failed: ${error.message}`);
});
logger_1.default.info('🚀 Notification worker started');
//# sourceMappingURL=notificationWorker.js.map