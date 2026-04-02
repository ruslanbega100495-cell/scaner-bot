// src/services/userSettings.ts
import prisma from '../config/database';
import logger from '../utils/logger';

export interface UserFilter {
  keywords: string[];
  minPrice?: number;
  maxPrice?: number;
  enabled: boolean;
}

export class UserSettingsService {
  // ✅ Минимальный порог цены по умолчанию
  static readonly DEFAULT_MIN_PRICE = 1000;

  // Слова, указывающие на закрытый заказ
  static readonly CLOSED_KEYWORDS = [
    'закрыто', 'закрытый', 'архив', 'архивный', 'выполнено', 
    'завершено', 'завершен', 'отменено', 'отмена', 'снято',
    'не актуально', 'неактуально', 'устарело', 'устаревший'
  ];

  /**
   * Получить настройки пользователя
   */
  static async get(telegramId: number): Promise<UserFilter> {
    const settings = await prisma.userSettings.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!settings) {
      return {
        keywords: [],
        minPrice: this.DEFAULT_MIN_PRICE, // ✅ 1000₽ по умолчанию
        maxPrice: undefined,
        enabled: true,
      };
    }

    return {
      keywords: settings.keywords,
      minPrice: settings.minPrice ?? this.DEFAULT_MIN_PRICE,
      maxPrice: settings.maxPrice ?? undefined,
      enabled: settings.enabled,
    };
  }

  /**
   * Обновить настройки пользователя
   */
  static async update(
    telegramId: number,
    updates: Partial<UserFilter>
  ): Promise<UserFilter> {
    const existing = await prisma.userSettings.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (existing) {
      const updated = await prisma.userSettings.update({
        where: { telegramId: BigInt(telegramId) },
        data: {
          keywords: updates.keywords ?? existing.keywords,
          minPrice: updates.minPrice ?? existing.minPrice,
          maxPrice: updates.maxPrice ?? existing.maxPrice,
          enabled: updates.enabled ?? existing.enabled,
        },
      });

      return {
        keywords: updated.keywords,
        minPrice: updated.minPrice ?? this.DEFAULT_MIN_PRICE,
        maxPrice: updated.maxPrice ?? undefined,
        enabled: updated.enabled,
      };
    } else {
      const created = await prisma.userSettings.create({
        data: {
          telegramId: BigInt(telegramId),
          keywords: updates.keywords ?? [],
          minPrice: updates.minPrice ?? this.DEFAULT_MIN_PRICE,
          maxPrice: updates.maxPrice,
          enabled: updates.enabled ?? true,
        },
      });

      return {
        keywords: created.keywords,
        minPrice: created.minPrice ?? this.DEFAULT_MIN_PRICE,
        maxPrice: created.maxPrice ?? undefined,
        enabled: created.enabled,
      };
    }
  }

  /**
   * Проверить, закрыт ли заказ
   */
  static isClosed(title: string, description: string): boolean {
    const text = `${title} ${description}`.toLowerCase();
    return this.CLOSED_KEYWORDS.some(keyword => text.includes(keyword));
  }

  /**
   * Проверить, проходит ли заказ фильтры пользователя
   */
  static matchesFilters(job: {
    title: string;
    description: string;
    priceMin?: number;
    priceMax?: number;
  }, filter: UserFilter): boolean {
    // Если фильтры отключены — пропускаем всё (кроме закрытых)
    if (!filter.enabled) {
      return !this.isClosed(job.title, job.description);
    }

    // ❌ Пропускаем закрытые заказы
    if (this.isClosed(job.title, job.description)) {
      logger.debug(`❌ Job rejected: is closed`);
      return false;
    }

    const text = `${job.title} ${job.description}`.toLowerCase();

    // Проверка ключевых слов
    if (filter.keywords.length > 0) {
      const hasKeyword = filter.keywords.some(kw => 
        text.includes(kw.toLowerCase())
      );
      if (!hasKeyword) {
        logger.debug(`❌ Job rejected: no keyword match`);
        return false;
      }
    }

    // Проверка цены
    const jobPrice = job.priceMin ?? job.priceMax;
    const minPrice = filter.minPrice ?? this.DEFAULT_MIN_PRICE;
    
    if (jobPrice !== undefined && jobPrice < minPrice) {
      logger.debug(`❌ Job rejected: price ${jobPrice} < min ${minPrice}`);
      return false;
    }
    
    if (filter.maxPrice !== undefined && jobPrice !== undefined) {
      if (jobPrice > filter.maxPrice) {
        logger.debug(`❌ Job rejected: price ${jobPrice} > max ${filter.maxPrice}`);
        return false;
      }
    }

    return true;
  }
}