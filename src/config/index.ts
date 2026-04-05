// src/config/index.ts
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
 
export const config = {
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramAdminId: process.env.TELEGRAM_ADMIN_ID || '',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:14b',
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  queuePrefix: process.env.QUEUE_PREFIX || 'fms',
};
 
// Логируем что читаем (без секретов)
console.log('Config loaded:', {
  hasDbUrl: !!config.databaseUrl,
  hasRedisUrl: !!config.redisUrl,
  redisUrl: config.redisUrl.replace(/:[^:@]+@/, ':***@'),
  hasTgToken: !!config.telegramBotToken,
  hasGroqKey: !!process.env.GROQ_API_KEY,
  nodeEnv: config.nodeEnv,
});
 
export default config;
 