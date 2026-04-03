"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("../utils/logger"));
const database_1 = require("../config/database");
const jobs_1 = require("./routes/jobs");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
// Request logging
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`);
    next();
});
// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/v1/jobs', jobs_1.jobsRouter);
// Error handling
app.use((err, req, res, next) => {
    logger_1.default.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
});
// Start server
async function startServer() {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start server
        app.listen(config_1.default.port, () => {
            logger_1.default.info(`🚀 Server started on port ${config_1.default.port}`);
            logger_1.default.info(`📍 Health: http://localhost:${config_1.default.port}/health`);
            logger_1.default.info(`📍 API: http://localhost:${config_1.default.port}/api/v1/jobs`);
        });
    }
    catch (error) {
        logger_1.default.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully');
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.default.info('SIGINT received, shutting down gracefully');
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map