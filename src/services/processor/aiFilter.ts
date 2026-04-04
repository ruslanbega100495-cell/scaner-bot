import axios from 'axios';
import logger from '../../utils/logger';

export interface AIResult {
  isSuitable: boolean;
  score: number;
  reason: string;
  technologies: string[];
  priceFound: number | null;
}

export class AIFilter {
  private apiKey: string;
  private model: string = 'llama3-8b-8192'; // бесплатная модель Groq

  private GOOD_KEYWORDS = [
    'бот', 'telegram', 'парсер', 'скрапер', 'автоматизация',
    'python', 'javascript', 'typescript', 'node', 'react', 'vue',
    'api', 'сайт', 'лендинг', 'backend', 'frontend', 'fullstack',
    'разработка', 'программист', 'верстка', 'скрипт', 'интеграция',
    'база данных', 'sql', 'mongodb', 'postgresql', 'redis',
    'деплой', 'docker', 'linux', 'vps', 'сервер',
    'openai', 'gpt', 'нейросеть', 'ml', 'ai',
  ];

  private BAD_KEYWORDS = [
    'менеджер', 'продажи', 'холодные звонки', 'колл-центр',
    'smm', 'instagram', 'tiktok', 'контент', 'копирайт',
    'дизайн логотип', 'иллюстрация', 'фото', 'видео монтаж',
    'переводчик', 'перевод текста', 'репетитор',
    'бухгалтер', 'юрист', 'курьер', 'водитель',
  ];

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (this.apiKey) {
      logger.info(`🤖 AI Filter initialized: Groq (${this.model})`);
    } else {
      logger.warn(`⚠️ GROQ_API_KEY not set, using keyword filter only`);
    }
  }

  async analyze(job: {
    title: string;
    description: string;
    price?: number | null;
  }): Promise<AIResult> {
    if (this.apiKey) {
      try {
        return await this.analyzeWithGroq(job);
      } catch (error: any) {
        logger.warn(`⚠️ Groq failed: ${error.message}, switching to keyword filter`);
      }
    }
    return this.analyzeWithKeywords(job);
  }

  private async analyzeWithGroq(job: {
    title: string;
    description: string;
    price?: number | null;
  }): Promise<AIResult> {
    logger.info(`🤖 Sending request to Groq...`);

    const prompt = `Ты — эксперт по анализу фриланс-заказов для программиста.

Проанализируй заказ:
Заголовок: ${job.title}
Описание: ${(job.description || '').substring(0, 400)}
${job.price ? `Цена: ${job.price}₽` : ''}

Подходящие заказы: боты, сайты, скрипты, автоматизация, парсеры, API, программирование.
НЕ подходят: дизайн, SMM, копирайтинг, звонки, менеджмент.

Ответь ТОЛЬКО JSON без markdown:
{"is_suitable": true/false, "score": 0-10, "reason": "кратко", "technologies": [], "price_found": null}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.1,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // Groq очень быстрый, 15 сек хватит
      }
    );

    const aiText = response.data.choices?.[0]?.message?.content || '';
    logger.info(`🤖 Groq response: ${aiText.substring(0, 200)}`);
    return this.parseAIResponse(aiText, job.price);
  }

  private analyzeWithKeywords(job: {
    title: string;
    description: string;
    price?: number | null;
  }): AIResult {
    const text = `${job.title} ${job.description}`.toLowerCase();
    let score = 5;
    const foundTech: string[] = [];

    for (const kw of this.GOOD_KEYWORDS) {
      if (text.includes(kw.toLowerCase())) {
        score += 1;
        foundTech.push(kw);
      }
    }
    for (const kw of this.BAD_KEYWORDS) {
      if (text.includes(kw.toLowerCase())) {
        score -= 2;
      }
    }

    score = Math.max(0, Math.min(10, score));
    const isSuitable = score >= 6;

    logger.info(`🔑 Keyword filter: score=${score}, suitable=${isSuitable}`);

    return {
      isSuitable,
      score,
      reason: isSuitable ? `Keyword match: ${foundTech.slice(0, 3).join(', ')}` : 'No relevant keywords',
      technologies: foundTech,
      priceFound: job.price || null,
    };
  }

  private parseAIResponse(response: string, price?: number | null): AIResult {
    try {
      const cleaned = response.replace(/```json|```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
      return {
        isSuitable: parsed.is_suitable || false,
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        reason: parsed.reason || '',
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [],
        priceFound: typeof parsed.price_found === 'number' ? parsed.price_found : (price || null),
      };
    } catch {
      return this.analyzeWithKeywords({ title: '', description: response, price });
    }
  }
}
