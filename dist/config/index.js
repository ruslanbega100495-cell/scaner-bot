"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    // Database
    databaseUrl: process.env.DATABASE_URL || '',
    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    // Telegram
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
    telegramAdminId: process.env.TELEGRAM_ADMIN_ID || '',
    // Ollama
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'qwen2.5:14b',
    // App
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug',
    // Queue
    queuePrefix: process.env.QUEUE_PREFIX || 'fms',
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map