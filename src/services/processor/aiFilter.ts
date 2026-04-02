import axios from 'axios';
import config from '../../config';
import logger from '../../utils/logger';

export interface AIResult {
  isSuitable: boolean;
  score: number;
  reason: string;
  technologies: string[];
  priceFound: number | null;
}

/**
 * AI фильтрация заказов
 * С graceful fallback при недоступности API
 */
export class AIFilter {
  private ollamaUrl: string;
  private model: string;
  
  constructor() {
    this.ollamaUrl = `${config.ollamaBaseUrl}/api/generate`;
    this.model = config.ollamaModel;
    
    logger.info(`🤖 AI Filter initialized: ${this.ollamaUrl} (${this.model})`);
  }
  
  /**
   * Анализ заказа
   * Всегда возвращает результат (даже при ошибке API)
   */
  async analyze(job: {
    title: string;
    description: string;
    price?: number | null;
  }): Promise<AIResult> {
    const prompt = this.createPrompt(job);
    
    try {
      logger.info(`🤖 Sending request to Ollama...`);
      
      const response = await axios.post(this.ollamaUrl, {
        model: this.model,
        prompt: prompt,
        stream: false,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 секунд
      });
      
      const aiResponse = response.data.response || '';
      logger.info(`🤖 Raw AI response: ${aiResponse.substring(0, 200)}...`);
      
      // Парсим ответ AI
      const result = this.parseAIResponse(aiResponse);
      logger.info(`🤖 Parsed result: score=${result.score}, suitable=${result.isSuitable}`);
      
      return result;
      
    } catch (error: any) {
      logger.warn(`⚠️ AI filter API failed: ${error.message}`);
      
      if (error.code === 'ECONNREFUSED') {
        logger.warn(`⚠️ Ollama not running - using fallback`);
      } else if (error.response?.status === 404) {
        logger.warn(`⚠️ Ollama endpoint not found - using fallback`);
      } else if (error.code === 'ETIMEDOUT') {
        logger.warn(`⚠️ Ollama timeout - using fallback`);
      }
      
      // Graceful fallback - пропускаем job с высоким score
      return {
        isSuitable: true,
        score: 10,
        reason: 'AI service unavailable - using fallback (all jobs pass through)',
        technologies: [],
        priceFound: job.price || null,
      };
    }
  }
  
  /**
   * Создание промпта
   */
  private createPrompt(job: {
    title: string;
    description: string;
    price?: number | null;
  }): string {
    return `Ты — эксперт по анализу фриланс-заказов.

Проанализируй заказ и определи:
1. Подходит ли нам (программист, боты, сайты, автоматизация)
2. Оцени от 1 до 10
3. Извлеки технологии

ЗАКАЗ:
Заголовок: ${job.title}
Описание: ${job.description.substring(0, 500)}
${job.price ? `Цена: ${job.price}₽` : ''}

ВЕРНИ JSON:
{
  "is_suitable": true/false,
  "score": 0-10,
  "reason": "краткое объяснение",
  "technologies": ["список"],
  "price_found": число или null
}

Ответ ТОЛЬКО JSON, без markdown.`;
  }
  
  /**
   * Парсинг ответа AI
   */
  private parseAIResponse(response: string): AIResult {
    try {
      logger.debug(`Parsing AI response: ${response}`);
      
      // Очищаем от markdown
      const cleaned = response
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Пытаемся найти JSON в ответе
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleaned;
      
      const parsed = JSON.parse(jsonString);
      
      return {
        isSuitable: parsed.is_suitable || false,
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        reason: parsed.reason || 'No reason provided',
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
        priceFound: typeof parsed.price_found === 'number' ? parsed.price_found : null,
      };
      
    } catch (error) {
      logger.error(`Failed to parse AI response: ${error}`);
      logger.error(`Raw response: ${response}`);
      
      // Возвращаем дефолтный результат при ошибке парсинга
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
