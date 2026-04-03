"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = __importDefault(require("express"));
const database_1 = __importDefault(require("../../config/database"));
const logger_1 = __importDefault(require("../../utils/logger"));
const queues_1 = require("../../queues");
exports.jobsRouter = express_1.default.Router();
/**
 * GET /api/v1/jobs
 * Получить список заказов
 */
exports.jobsRouter.get('/', async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const jobs = await database_1.default.job.findMany({
            where,
            orderBy: { scrapedAt: 'desc' },
            take: Number(limit), // ← Исправлено: было limit
            skip: Number(offset), // ← Исправлено: было offset
            include: {
                source: true,
            },
        });
        const total = await database_1.default.job.count({ where });
        res.json({
            data: jobs,
            pagination: {
                total,
                limit: Number(limit),
                offset: Number(offset),
            },
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to get jobs: ${error.message}`);
        res.status(500).json({ error: 'Failed to get jobs' });
    }
});
/**
 * GET /api/v1/jobs/:id
 * Получить заказ по ID
 */
exports.jobsRouter.get('/:id', async (req, res) => {
    try {
        const job = await database_1.default.job.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                source: true,
                notifications: true,
            },
        });
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        res.json(job);
    }
    catch (error) {
        logger_1.default.error(`Failed to get job: ${error.message}`);
        res.status(500).json({ error: 'Failed to get job' });
    }
});
/**
 * POST /api/v1/jobs
 * Создать новый заказ (тестовый endpoint)
 */
exports.jobsRouter.post('/', async (req, res) => {
    try {
        const { title, description, url, priceMin, priceMax, source } = req.body;
        // Валидация
        if (!title || !url) {
            return res.status(400).json({ error: 'Title and URL are required' });
        }
        // Создаем заказ
        const job = await database_1.default.job.create({
            data: {
                sourceId: 1, // TODO: получить из названия source
                externalId: Date.now().toString(),
                url,
                title,
                description,
                priceMin,
                priceMax,
                status: 'NEW',
            },
        });
        logger_1.default.info(`Job created: ${job.id}`);
        res.status(201).json(job);
    }
    catch (error) {
        logger_1.default.error(`Failed to create job: ${error.message}`);
        res.status(500).json({ error: 'Failed to create job' });
    }
});
/**
 * POST /api/v1/jobs/scan
 * Запустить скрапинг
 */
exports.jobsRouter.post('/scan', async (req, res) => {
    try {
        const { source, url } = req.body;
        if (!source) {
            return res.status(400).json({ error: 'Source is required' });
        }
        // Добавляем задачу в очередь
        const job = await (0, queues_1.addScrapingJob)({ source, url, priority: 'high' });
        logger_1.default.info(`Scan job queued: ${job.id}`);
        res.json({
            success: true,
            jobId: job.id,
            message: `Scanning ${source}...`,
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to start scan: ${error.message}`);
        res.status(500).json({ error: 'Failed to start scan' });
    }
});
/**
 * DELETE /api/v1/jobs/:id
 * Удалить заказ
 */
exports.jobsRouter.delete('/:id', async (req, res) => {
    try {
        await database_1.default.job.delete({
            where: { id: Number(req.params.id) },
        });
        logger_1.default.info(`Job deleted: ${req.params.id}`);
        res.json({ success: true });
    }
    catch (error) {
        logger_1.default.error(`Failed to delete job: ${error.message}`);
        res.status(500).json({ error: 'Failed to delete job' });
    }
});
//# sourceMappingURL=jobs.js.map