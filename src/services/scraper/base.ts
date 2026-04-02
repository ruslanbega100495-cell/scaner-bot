import axios from 'axios';
import logger from '../../utils/logger';

/**
 * Базовый класс для скраперов
 */
export abstract class BaseScraper {
  protected baseUrl: string = '';
  protected userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  
  /**
   * Основной метод скрапинга
   */
  abstract scrape(url?: string): Promise<any[]>;
  
  /**
   * HTTP GET запрос
   */
  protected async get(url: string, headers?: Record<string, string>): Promise<string> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*',
          ...headers,
        },
        timeout: 30000,
      });
      
      return response.data;
      
    } catch (error: any) {
      logger.error(`HTTP request failed: ${url} - ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Парсинг цены из текста
   */
  protected parsePrice(text: string): number | null {
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
