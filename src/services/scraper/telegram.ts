import { BaseScraper } from './base';
import logger from '../../utils/logger';
import * as cheerio from 'cheerio';

export interface TelegramChannel {
  username: string;
  keywords?: string[];
}

export class TelegramScraper extends BaseScraper {
  private channels: TelegramChannel[] = [
    { username: 'freelance_ru', keywords: ['бот', 'сайт', 'разработка', 'парсинг', 'автоматизация', 'telegram', 'python', 'node.js', 'n8n'] },
    { username: 'python_jobs', keywords: ['python', 'бот', 'скрипт', 'парсинг', 'api', 'django', 'fastapi'] },
    { username: 'it_jobs_ru', keywords: ['разработка', 'сайт', 'бот', 'веб', 'frontend', 'backend', 'fullstack'] },
    { username: 'tg_jobs', keywords: ['telegram', 'бот', 'mini app', 'web app', 'разработка'] },
    { username: 'freelancehunt', keywords: ['заказ', 'проект', 'разработка', 'сайт', 'бот'] },
    { username: 'remote_ru', keywords: ['удалённо', 'разработка', 'сайт', 'бот', 'python', 'javascript'] },
    { username: 'it_freelance', keywords: ['фриланс', 'заказ', 'проект', 'разработка', 'веб'] },
    { username: 'webfreelance', keywords: ['веб', 'сайт', 'landing', 'wordpress', 'tilda', 'разработка'] },
    { username: 'botmakers', keywords: ['бот', 'telegram', 'discord', 'чат-бот', 'автоматизация'] },
    { username: 'n8n_ru', keywords: ['n8n', 'автоматизация', 'workflow', 'интеграция', 'api'] },
    { username: 'jobs_start', keywords: ['работа', 'проект', 'разработка', 'заказ'] },
    { username: 'rueventjob', keywords: ['проект', 'разработка', 'сайт', 'бот'] },
    { username: 'habr_career', keywords: ['разработка', 'программист', 'проект', 'веб'] },
    { username: 'hmoffice', keywords: ['работа', 'проект', 'разработка', 'удалённо'] },
    { username: 'workk_on', keywords: ['работа', 'проект', 'заказ', 'разработка'] },
    { username: 'onlinevakansii', keywords: ['удалённо', 'онлайн', 'разработка', 'проект'] },
    { username: 'rabotay', keywords: ['работа', 'проект', 'заказ', 'фриланс'] },
    { username: 'rabota_doma', keywords: ['дома', 'удалённо', 'разработка', 'проект'] },
    { username: 'rabotax', keywords: ['работа', 'проект', 'разработка', 'заказ'] },
    { username: 'juniors_rabota_jobs', keywords: ['junior', 'начинающий', 'проект', 'разработка'] },
    { username: 'freetasks', keywords: ['задача', 'проект', 'скрипт', 'бот', 'парсинг'] },
    { username: 'normrabota', keywords: ['работа', 'проект', 'разработка', 'заказ'] },
    { username: 'freelancce', keywords: ['фриланс', 'проект', 'заказ', 'разработка'] },
    { username: 'rabota_udalennaya_vakansii_tg', keywords: ['удалённо', 'разработка', 'проект', 'сайт'] },
    { username: 'freelance_exchange', keywords: ['биржа', 'проект', 'заказ', 'разработка'] },
    { username: 'kwork_ru', keywords: ['кворк', 'проект', 'заказ', 'разработка', 'бот', 'сайт'] },
    { username: 'fl_ru', keywords: ['fl.ru', 'проект', 'заказ', 'разработка', 'веб'] },
    { username: 'weblancer', keywords: ['weblancer', 'проект', 'заказ', 'сайт', 'разработка'] },
    { username: 'freelancehub_ru', keywords: ['фриланс', 'проект', 'заказ', 'разработка'] },
    { username: 'zakazchik_freelancer', keywords: ['заказчик', 'проект', 'заказ', 'разработка'] },
    { username: 'freelance_tg', keywords: ['фриланс', 'проект', 'заказ', 'телеграм', 'бот'] },
    { username: 'freelance_projects', keywords: ['проект', 'заказ', 'разработка', 'веб', 'бот'] },
    { username: 'test_monitor_ruslan', keywords: ['тест', 'мониторинг', 'проект'] },
  ];
  
  async scrape(): Promise<any[]> {
    const jobs: any[] = [];
    
    logger.info(`🔍 Scraping ${this.channels.length} Telegram channels...`);
    
    for (const channel of this.channels) {
      try {
        const url = `https://t.me/s/${channel.username}`;
        const html = await this.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        });
        
        const messages = this.parseWebChannel(html, channel.username);
        const filtered = this.filterMessages(messages, channel);
        
        jobs.push(...filtered);
        logger.info(`✅ @${channel.username}: ${filtered.length} jobs`);
        
      } catch (error: any) {
        logger.warn(`⚠️ Failed to scrape @${channel.username}: ${error.message}`);
      }
    }
    
    logger.info(`✅ Telegram scraped: ${jobs.length} total jobs`);
    return jobs;
  }
  
  private parseWebChannel(html: string, channelUsername: string): any[] {
    const $ = cheerio.load(html);
    const messages: any[] = [];
    
    $('.tgme_widget_message').each((i, el) => {
      const $el = $(el);
      const text = $el.find('.tgme_widget_message_text').text().trim();
      const linkEl = $el.find('.tgme_widget_message_date').attr('href');
      const dateText = $el.find('.tgme_widget_message_date time').attr('datetime');
      
      if (!text || text.length < 20) return;
      
      // ✅ ИСПРАВЛЕНО: правильный формат URL (без дублирования)
      let messageUrl = `https://t.me/${channelUsername}`;
      if (linkEl) {
        if (linkEl.startsWith('http')) {
          messageUrl = linkEl;
        } else if (linkEl.startsWith('/')) {
          messageUrl = `https://t.me${linkEl}`;
        } else {
          messageUrl = `https://t.me/${channelUsername}/${linkEl}`;
        }
      }
      
      messages.push({ text, url: messageUrl, date: dateText ? new Date(dateText) : new Date() });
    });
    
    return messages;
  }
  
  private filterMessages(messages: any[], channel: TelegramChannel): any[] {
    const jobs: any[] = [];
    
    for (const msg of messages) {
      const text = msg.text.toLowerCase();
      
      if (channel.keywords && !channel.keywords.some(k => text.includes(k.toLowerCase()))) continue;
      if (!/нужен|ищу|требуется|заказ|работа|бюджет|оплата|₽|руб|срочно|вакансия/.test(text)) continue;
      
      const priceMatch = text.match(/(\d{1,3}(?:\s?\d{3})*)\s*₽/i);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/\s/g, ''), 10) : undefined;
      
      jobs.push({
        jobId: Date.now() + Math.random(),
        title: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        description: text,
        url: msg.url,
        priceMin: price,
        priceMax: price,
        publishedAt: msg.date,
        source: 'telegram',
        channel: `@${channel.username}`,
      });
    }
    
    return jobs;
  }
}