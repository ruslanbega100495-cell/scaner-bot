// src/bot/commands.ts
import TelegramBot from 'node-telegram-bot-api';
import { UserSettingsService } from '../services/userSettings';
import logger from '../utils/logger';

export function setupBotCommands(bot: TelegramBot) {
  // Устанавливаем список команд (показываются в меню бота)
  bot.setMyCommands([
    { command: 'start', description: '👋 Запустить бота' },
    { command: 'settings', description: '⚙️ Мои настройки' },
    { command: 'keywords', description: '🔑 Ключевые слова' },
    { command: 'price', description: '💰 Диапазон цен' },
    { command: 'toggle', description: '🔘 Вкл/выкл фильтры' },
    { command: 'help', description: '❓ Помощь' },
  ]);

  // /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 
`👋 Привет! Я твой помощник по поиску фриланс-заказов.

📋 Доступные команды:
/settings — показать текущие настройки
/keywords — управлять ключевыми словами
/price — задать диапазон цен
/toggle — включить/выключить фильтры
/help — подробная помощь

🎯 Просто настрой фильтры — и я буду присылать только подходящие заказы!`,
      { 
        parse_mode: 'Markdown',
        ...getSettingsKeyboard()
      }
    );
  });

  // /settings
  bot.onText(/\/settings/, async (msg) => {
    const chatId = msg.chat.id;
    const settings = await UserSettingsService.get(chatId);
    
    const keywords = settings.keywords.length > 0 
      ? settings.keywords.map(k => `\`${k}\``).join(', ')
      : '_не заданы_';
    
    const price = `${settings.minPrice ?? 1000}₽ — ${settings.maxPrice ?? '∞'}₽`;
    
    bot.sendMessage(chatId,
`⚙️ *Твои настройки*

🔑 Ключевые слова: ${keywords}
💰 Диапазон цен: ${price}
🔘 Фильтры: ${settings.enabled ? '✅ Включены' : '❌ Выключены'}
🚫 Закрытые заказы: не отправляются

Используй:
/keywords — изменить слова
/price — изменить цены
/toggle — вкл/выкл фильтры`,
      { parse_mode: 'Markdown' }
    );
  });

  // /keywords
  bot.onText(/\/keywords(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match?.[1]?.trim();
    
    if (!input) {
      const settings = await UserSettingsService.get(chatId);
      const list = settings.keywords.length > 0 
        ? settings.keywords.map((k, i) => `${i+1}. \`${k}\``).join('\n')
        : '_нет заданных слов_';
      
      bot.sendMessage(chatId,
`🔑 *Ключевые слова*

Текущие:
${list}

💡 *Как изменить:*
/keywords python telegram bot parsing
/keywords clear — очистить все слова

📝 Слова разделяй пробелами.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    if (input.toLowerCase() === 'clear') {
      await UserSettingsService.update(chatId, { keywords: [] });
      bot.sendMessage(chatId, '✅ Ключевые слова очищены');
      return;
    }
    
    const keywords = input.split(/\s+/).filter(k => k.length > 1);
    await UserSettingsService.update(chatId, { keywords });
    
    bot.sendMessage(chatId,
`✅ Обновлено! Теперь ищу заказы со словами:
${keywords.map(k => `\`${k}\``).join(', ')}

Проверь: /settings`,
      { parse_mode: 'Markdown' }
    );
  });

  // /price
  bot.onText(/\/price(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const input = match?.[1]?.trim();
    
    if (!input) {
      const settings = await UserSettingsService.get(chatId);
      bot.sendMessage(chatId,
`💰 *Диапазон цен*

Текущий: ${settings.minPrice ?? 1000}₽ — ${settings.maxPrice ?? '∞'}₽
*(минимум по умолчанию: 1000₽)*

💡 *Как изменить:*
/price 5000 50000 — от 5к до 50к
/price min 10000 — только от 10к
/price max 30000 — только до 30к
/price clear — убрать макс. лимит`,
        { parse_mode: 'Markdown' }
      );
      return;
    }
    
    if (input.toLowerCase() === 'clear') {
      await UserSettingsService.update(chatId, { maxPrice: undefined });
      bot.sendMessage(chatId, '✅ Максимальный лимит снят (мин. 1000₽)');
      return;
    }
    
    const parts = input.split(/\s+/);
    let minPrice: number | undefined;
    let maxPrice: number | undefined;
    
    if (parts[0].toLowerCase() === 'min' && parts[1]) {
      minPrice = parseInt(parts[1]);
    } else if (parts[0].toLowerCase() === 'max' && parts[1]) {
      maxPrice = parseInt(parts[1]);
    } else {
      minPrice = parseInt(parts[0]);
      maxPrice = parts[1] ? parseInt(parts[1]) : undefined;
    }
    
    if (isNaN(minPrice!) && isNaN(maxPrice!)) {
      bot.sendMessage(chatId, '❌ Неверный формат. Пример: /price 5000 50000');
      return;
    }
    
    if (minPrice !== undefined && minPrice < 1000) {
      minPrice = 1000;
    }
    
    await UserSettingsService.update(chatId, { 
      minPrice: minPrice, 
      maxPrice: maxPrice 
    });
    
    bot.sendMessage(chatId,
`✅ Обновлено! Теперь ищу заказы:
💰 ${minPrice ?? 1000}₽ — ${maxPrice ?? '∞'}₽

Проверь: /settings`,
      { parse_mode: 'Markdown' }
    );
  });

  // /toggle
  bot.onText(/\/toggle/, async (msg) => {
    const chatId = msg.chat.id;
    const current = await UserSettingsService.get(chatId);
    const updated = await UserSettingsService.update(chatId, { 
      enabled: !current.enabled 
    });
    
    bot.sendMessage(chatId,
`🔘 Фильтры ${updated.enabled ? '✅ включены' : '❌ выключены'}

${updated.enabled 
  ? 'Теперь применяю твои настройки' 
  : 'Теперь отправляю все заказы, прошедшие AI-фильтр'}`,
      { parse_mode: 'Markdown' }
    );
  });

  // /help
  bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id,
`❓ *Помощь*

🎯 *Как это работает:*
1. Бот сканирует Kwork, FL.ru, Telegram
2. AI оценивает каждый заказ (0-10)
3. Если оценка ≥ 8 И проходят фильтры → уведомление

⚙️ *Настройка:*
/keywords python bot — искать с этими словами
/price 5000 50000 — только от 5к до 50к
/toggle — вкл/выкл фильтры

🚫 *Автоматически пропускает:*
- Закрытые/архивные заказы
- Заказы дешевле 1000₽ (по умолчанию)
- Заказы без ключевых слов (если заданы)

💡 *Советы:*
- Используй конкретные слова: "telegram bot"
- Мин. цена: 1000₽ (можно изменить)`,
      { parse_mode: 'Markdown' }
    );
  });

  // Обработчик нажатий на inline-кнопки
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message?.chat.id;
    const data = callbackQuery.data;
    
    if (!chatId) return;
    
    // Эмулируем команду при нажатии
    if (data === 'settings') {
      bot.sendMessage(chatId, '/settings');
    } else if (data === 'keywords') {
      bot.sendMessage(chatId, '/keywords');
    } else if (data === 'price') {
      bot.sendMessage(chatId, '/price');
    } else if (data === 'toggle') {
      bot.sendMessage(chatId, '/toggle');
    } else if (data === 'help') {
      bot.sendMessage(chatId, '/help');
    }
    
    // Убираем "часики" с кнопки
    bot.answerCallbackQuery(callbackQuery.id, { text: 'Открываю...' });
  });

  logger.info('✅ Bot commands registered');
}

/**
 * Создаёт inline keyboard с настройками
 */
export function getSettingsKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '⚙️ Настройки', callback_data: 'settings' },
          { text: '🔑 Ключевые слова', callback_data: 'keywords' },
        ],
        [
          { text: '💰 Цена', callback_data: 'price' },
          { text: '🔘 Вкл/Выкл', callback_data: 'toggle' },
        ],
        [
          { text: '❓ Помощь', callback_data: 'help' },
        ],
      ],
    },
  };
}