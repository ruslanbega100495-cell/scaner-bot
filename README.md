# 🚀 Freelance Monitoring System - MVP

Система автоматического мониторинга фриланс-бирж с AI фильтрацией и Telegram уведомлениями.

---

## 📋 Возможности MVP

- ✅ Парсинг Kwork и FL.ru
- ✅ AI фильтрация через Ollama (qwen2.5:14b)
- ✅ Дедупликация заказов
- ✅ Telegram уведомления
- ✅ Очереди задач (BullMQ + Redis)
- ✅ PostgreSQL для хранения данных
- ✅ REST API

---

## 🛠 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

**Обязательные переменные:**
- `TELEGRAM_BOT_TOKEN` — токен вашего Telegram бота
- `TELEGRAM_ADMIN_ID` — ваш Chat ID

### 3. Запуск инфраструктуры (Docker)

```bash
docker-compose up -d postgres redis ollama
```

Проверка:
```bash
docker-compose ps
```

### 4. Миграции базы данных

```bash
npm run prisma:migrate
```

### 5. Запуск приложения

**Вариант A: Development mode (с hot-reload)**

```bash
npm run dev
```

**Вариант B: Production mode**

```bash
npm run build
npm start
```

**Вариант C: Docker**

```bash
docker-compose up app
```

---

## 📡 API Endpoints

### Health Check
```
GET http://localhost:3000/health
```

### Получить заказы
```
GET http://localhost:3000/api/v1/jobs
GET http://localhost:3000/api/v1/jobs?status=READY&limit=10
```

### Получить заказ по ID
```
GET http://localhost:3000/api/v1/jobs/:id
```

### Запустить скрапинг
```
POST http://localhost:3000/api/v1/jobs/scan
Body: { "source": "kwork" }
```

---

## 🧪 Тестирование

### 1. Проверка API

```bash
curl http://localhost:3000/health
```

### 2. Запуск скрапинга

```bash
curl -X POST http://localhost:3000/api/v1/jobs/scan \
  -H "Content-Type: application/json" \
  -d '{"source": "kwork"}'
```

### 3. Проверка заказов

```bash
curl http://localhost:3000/api/v1/jobs
```

---

## 📊 Архитектура

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Express API │────▶│  PostgreSQL │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                     ┌──────────────┐
                     │    Redis     │
                     │   (BullMQ)   │
                     └──────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Scraping       │ │ Processing     │ │ Notification   │
│ Worker         │ │ Worker         │ │ Worker         │
│                │ │                │ │                │
│ - Kwork        │ │ - AI Filter    │ │ - Telegram     │
│ - FL.ru        │ │ - Dedup        │ │ - Bot          │
└────────────────┘ └────────────────┘ └────────────────┘
```

---

## 🗂 Структура проекта

```
freelance-monitor/
├── src/
│   ├── index.ts                 # Точка входа
│   ├── api/
│   │   ├── server.ts            # Express сервер
│   │   └── routes/jobs.ts       # Jobs endpoints
│   ├── config/
│   │   ├── index.ts             # Конфигурация
│   │   └── database.ts          # Prisma client
│   ├── queues/
│   │   └── index.ts             # BullMQ очереди
│   ├── workers/
│   │   ├── scrapingWorker.ts    # Скрапинг воркер
│   │   ├── processingWorker.ts  # AI обработка
│   │   └── notificationWorker.ts# Telegram бот
│   ├── services/
│   │   ├── scraper/
│   │   │   ├── base.ts          # Базовый скрапер
│   │   │   ├── kwork.ts         # Kwork скрапер
│   │   │   └── flru.ts          # FL.ru скрапер
│   │   └── processor/
│   │       ├── aiFilter.ts      # AI фильтрация
│   │       └── deduplicator.ts  # Дедупликация
│   └── utils/
│       └── logger.ts            # Winston логгер
├── prisma/
│   └── schema.prisma            # Prisma схема
├── docker-compose.yml
├── .env
└── package.json
```

---

## 🔧 Разработка

### Запуск воркеров отдельно

```bash
# Scraping worker
npm run worker:scraping

# Processing worker
npm run worker:processing

# Notification worker
npm run worker:notification
```

### Prisma команды

```bash
# Generate client
npm run prisma:generate

# Create migration
npx prisma migrate dev --name init

# Open Studio
npm run prisma:studio
```

---

## ⚠️ Известные ограничения MVP

1. **Парсинг**: Упрощённый, без proxy rotation
2. **AI**: Локальная Ollama (медленнее чем API)
3. **Масштабирование**: Один инстанс (нет репликации)
4. **Telegram**: Только админ (нет мульти-юзер)

---

## 📈 Следующие шаги

- [ ] Добавить Telegram каналы
- [ ] Улучшить парсинг (Playwright)
- [ ] Добавить proxy support
- [ ] Web dashboard
- [ ] Statistics & analytics

---

## 📞 Поддержка

Вопросы и предложения: создайте issue в репозитории.

---

**License:** MIT
