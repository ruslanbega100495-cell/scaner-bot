"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = exports.notificationQueue = exports.processingQueue = exports.scrapingQueue = void 0;
exports.addScrapingJob = addScrapingJob;
exports.addProcessingJob = addProcessingJob;
exports.addNotificationJob = addNotificationJob;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
// Redis подключение
const connection = new ioredis_1.default(config_1.default.redisUrl, {
    maxRetriesPerRequest: null,
});
exports.connection = connection;
// ============================================
// QUEUES
// ============================================
// Очередь скрапинга
exports.scrapingQueue = new bullmq_1.Queue(`${config_1.default.queuePrefix}_scraping`, {
    connection,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});
// Очередь обработки
exports.processingQueue = new bullmq_1.Queue(`${config_1.default.queuePrefix}_processing`, {
    connection,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000,
        },
    },
});
// Очередь уведомлений
exports.notificationQueue = new bullmq_1.Queue(`${config_1.default.queuePrefix}_notification`, {
    connection,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 1000,
        attempts: 5,
        backoff: {
            type: 'exponential',
            delay: 5000,
        },
    },
});
// ============================================
// HELPER FUNCTIONS
// ============================================
/**
 * Добавить задачу на скрапинг
 */
async function addScrapingJob(data) {
    const job = await exports.scrapingQueue.add('scrape', data, {
        priority: data.priority === 'high' ? 10 : data.priority === 'low' ? 1 : 5,
    });
    logger_1.default.info(`📝 Scraping job added: ${job.id} - ${data.source}`);
    return job;
}
/**
 * Добавить задачу на обработку
 */
async function addProcessingJob(data) {
    const job = await exports.processingQueue.add('process', data);
    logger_1.default.info(`⚙️ Processing job added: ${job.id} - ${data.title}`);
    return job;
}
/**
 * Добавить задачу на уведомление
 */
async function addNotificationJob(data) {
    const job = await exports.notificationQueue.add('notify', data, {
        priority: data.priority === 'high' ? 10 : data.priority === 'low' ? 1 : 5,
    });
    logger_1.default.info(`📬 Notification job added: ${job.id} - User ${data.telegramId}`);
    return job;
}
//# sourceMappingURL=index.js.map