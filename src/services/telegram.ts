// src/services/telegram.ts

import axios from 'axios';
import logger from '../utils/logger';

export async function sendTelegramMessage(text: string, chatId?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const targetChatId = chatId || process.env.TELEGRAM_ADMIN_ID;

  if (!token || !targetChatId) {
    logger.error('Telegram env not configured');
    throw new Error('Telegram env not configured');
  }

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: targetChatId,
      text,
      parse_mode: 'Markdown',
    });
    logger.info(`✅ Telegram message sent to ${targetChatId}`);
  } catch (error: any) {
    logger.error(`❌ Telegram send failed: ${error.message}`);
    throw error;
  }
}
