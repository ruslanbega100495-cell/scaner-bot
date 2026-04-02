/**
 * Seed script для добавления источников в БД
 * Запуск: npx tsx src/scripts/seed-sources.ts
 */

import prisma from '../config/database';
import logger from '../utils/logger';

async function seedSources() {
  logger.info('🌱 Seeding sources...');

  try {
    // Добавляем источники
    const sources = [
      {
        name: 'Kwork',
        type: 'WEBSITE' as const,
        url: 'https://kwork.ru/projects',
        isActive: true,
        scanInterval: 300,
        rateLimit: 60,
      },
      {
        name: 'FL.ru',
        type: 'WEBSITE' as const,
        url: 'https://www.fl.ru/projects/',
        isActive: true,
        scanInterval: 300,
        rateLimit: 60,
      },
      {
        name: 'Telegram',
        type: 'TELEGRAM' as const,
        url: 'https://t.me/',
        isActive: true,
        scanInterval: 180,
        rateLimit: 30,
      },
    ];

    for (const sourceData of sources) {
      // Используем upsert для защиты от дубликатов
      const source = await prisma.scannerSource.upsert({
        where: { name: sourceData.name },
        update: sourceData,
        create: sourceData,
      });

      logger.info(`✅ Source: ${source.name} (ID: ${source.id})`);
    }

    logger.info('🎉 Seeding completed!');

  } catch (error: any) {
    logger.error(`❌ Seeding failed: ${error.message}`);
    logger.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск
seedSources()
  .then(() => {
    logger.info('✅ Script finished');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('💥 Script crashed');
    logger.error(error);
    process.exit(1);
  });
