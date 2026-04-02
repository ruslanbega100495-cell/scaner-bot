import crypto from 'crypto';
import logger from '../../utils/logger';

/**
 * Дедупликация заказов
 */
export class Deduplicator {
  private seenHashes: Set<string> = new Set();
  
  /**
   * Проверка на дубликат
   */
  async checkDuplicate(job: {
    title: string;
    description: string;
    url: string;
    priceMin?: number | null;
    priceMax?: number | null;
  }): Promise<boolean> {
    // 1. Проверка по URL (точный дубликат)
    if (this.seenHashes.has(job.url)) {
      logger.info(`⏭️ Duplicate URL: ${job.url}`);
      return true;
    }
    
    // 2. Проверка по content hash
    const contentHash = this.computeContentHash(job);
    
    if (this.seenHashes.has(contentHash)) {
      logger.info(`⏭️ Duplicate content: ${contentHash}`);
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
  private computeContentHash(job: {
    title: string;
    description: string;
    url: string;
    priceMin?: number | null;
    priceMax?: number | null;
  }): string {
    // Нормализация текста
    const normalize = (text: string) => {
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
    
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  /**
   * Очистка кэша
   */
  clear() {
    this.seenHashes.clear();
    logger.info('🧹 Deduplicator cache cleared');
  }
}
