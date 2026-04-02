import express from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';
import { addScrapingJob } from '../../queues';

export const jobsRouter = express.Router();

/**
 * GET /api/v1/jobs/scan?source=kwork|flru|telegram
 * Быстрый запуск скрейпинга (для браузера)
 */
jobsRouter.get('/scan', async (req, res) => {
  try {
    // ✅ ЧИТАЕМ source из query параметров
    const source = (req.query.source as string) || 'kwork';
    
    // ✅ Валидация источника
    const validSources = ['kwork', 'flru', 'telegram'];
    if (!validSources.includes(source)) {
      return res.status(400).json({ 
        error: `Invalid source. Valid: ${validSources.join(', ')}` 
      });
    }

    const job = await addScrapingJob({
      source,
      priority: 'high',
    });

    logger.info(`Scan job queued: ${job.id} - ${source}`);

    res.json({
      success: true,
      jobId: job.id,
      message: `Scanning ${source}...`,
    });

  } catch (error: any) {
    logger.error(`Failed to start scan: ${error.message}`);
    res.status(500).json({ error: 'Failed to start scan' });
  }
});

/**
 * GET /api/v1/jobs
 */
jobsRouter.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
      take: Number(limit),
      skip: Number(offset),
      include: { source: true },
    });

    const total = await prisma.job.count({ where });

    res.json({
      data: jobs,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });

  } catch (error: any) {
    logger.error(`Failed to get jobs: ${error.message}`);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
});

/**
 * GET /api/v1/jobs/:id
 */
jobsRouter.get('/:id', async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
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

  } catch (error: any) {
    logger.error(`Failed to get job: ${error.message}`);
    res.status(500).json({ error: 'Failed to get job' });
  }
});

/**
 * POST /api/v1/jobs/scan (для Postman)
 */
jobsRouter.post('/scan', async (req, res) => {
  try {
    const { source = 'kwork', url } = req.body;
    
    // ✅ Валидация источника
    const validSources = ['kwork', 'flru', 'telegram'];
    if (!validSources.includes(source)) {
      return res.status(400).json({ 
        error: `Invalid source. Valid: ${validSources.join(', ')}` 
      });
    }

    const job = await addScrapingJob({ source, url, priority: 'high' });

    logger.info(`Scan job queued: ${job.id} - ${source}`);

    res.json({
      success: true,
      jobId: job.id,
      message: `Scanning ${source}...`,
    });

  } catch (error: any) {
    logger.error(`Failed to start scan: ${error.message}`);
    res.status(500).json({ error: 'Failed to start scan' });
  }
});

/**
 * DELETE /api/v1/jobs/:id
 */
jobsRouter.delete('/:id', async (req, res) => {
  try {
    await prisma.job.delete({
      where: { id: Number(req.params.id) },
    });

    logger.info(`Job deleted: ${req.params.id}`);

    res.json({ success: true });

  } catch (error: any) {
    logger.error(`Failed to delete job: ${error.message}`);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});