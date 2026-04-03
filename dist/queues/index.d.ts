import { Queue, Job } from 'bullmq';
import IORedis from 'ioredis';
declare const connection: IORedis;
export declare const scrapingQueue: Queue<any, any, string, any, any, string>;
export declare const processingQueue: Queue<any, any, string, any, any, string>;
export declare const notificationQueue: Queue<any, any, string, any, any, string>;
export interface ScrapingJobData {
    source: string;
    url?: string;
    priority?: 'high' | 'normal' | 'low';
}
export interface ProcessingJobData {
    jobId: number;
    title: string;
    description?: string;
    source: string;
    url: string;
    priceMin?: number;
    priceMax?: number;
}
export interface NotificationJobData {
    userId: string;
    telegramId: number;
    jobId: number;
    message: string;
    priority?: 'high' | 'normal' | 'low';
}
/**
 * Добавить задачу на скрапинг
 */
export declare function addScrapingJob(data: ScrapingJobData): Promise<Job<any, any, string>>;
/**
 * Добавить задачу на обработку
 */
export declare function addProcessingJob(data: ProcessingJobData): Promise<Job<any, any, string>>;
/**
 * Добавить задачу на уведомление
 */
export declare function addNotificationJob(data: NotificationJobData): Promise<Job<any, any, string>>;
export { connection };
//# sourceMappingURL=index.d.ts.map