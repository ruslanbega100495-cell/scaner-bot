"use strict";
/**
 * Freelance Monitoring System
 * Main entry point
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const logger_1 = __importDefault(require("./utils/logger"));
logger_1.default.info('🚀 Starting Freelance Monitoring System...');
logger_1.default.info(`📍 Environment: ${config_1.default.nodeEnv}`);
logger_1.default.info(`📍 Port: ${config_1.default.port}`);
logger_1.default.info(`📍 Redis: ${config_1.default.redisUrl}`);
logger_1.default.info(`📍 Database: ${config_1.default.databaseUrl.substring(0, 30)}...`);
// Start API server
Promise.resolve().then(() => __importStar(require('./api/server'))).catch((error) => {
    logger_1.default.error(`❌ Failed to start API server: ${error.message}`);
    process.exit(1);
});
// Start workers (in production, run workers as separate processes)
if (config_1.default.nodeEnv === 'development') {
    logger_1.default.info('👷 Starting workers (development mode)...');
    Promise.resolve().then(() => __importStar(require('./workers/scrapingWorker'))).catch((error) => {
        logger_1.default.error(`❌ Failed to start scraping worker: ${error.message}`);
    });
    Promise.resolve().then(() => __importStar(require('./workers/processingWorker'))).catch((error) => {
        logger_1.default.error(`❌ Failed to start processing worker: ${error.message}`);
    });
    Promise.resolve().then(() => __importStar(require('./workers/notificationWorker'))).catch((error) => {
        logger_1.default.error(`❌ Failed to start notification worker: ${error.message}`);
    });
}
logger_1.default.info('✅ System started');
//# sourceMappingURL=index.js.map