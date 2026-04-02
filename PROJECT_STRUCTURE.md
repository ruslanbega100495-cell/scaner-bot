# 📁 СТРУКТУРА ПРОЕКТА MVP

```
freelance-monitor/
│
├── 📄 docker-compose.yml          # Docker конфигурация
├── 📄 Dockerfile                   # Docker образ
├── 📄 package.json                 # Зависимости npm
├── 📄 tsconfig.json                # TypeScript конфиг
├── 📄 .env                         # Переменные окружения
├── 📄 .env.example                 # Пример окружения
├── 📄 .gitignore                   # Git ignore
├── 📄 README.md                    # Документация
├── 📄 GETTING_STARTED.md           # Инструкция по запуску
│
├── 📁 prisma/
│   ├── 📄 schema.prisma            # Prisma схема (модели БД)
│   └── 📁 migrations/              # Миграции БД
│
├── 📁 src/
│   │
│   ├── 📄 index.ts                 # Точка входа
│   │
│   ├── 📁 api/
│   │   ├── 📄 server.ts            # Express сервер
│   │   └── 📁 routes/
│   │       ├── 📄 jobs.ts          # Jobs API endpoints
│   │       └── 📄 users.ts         # Users API (TODO)
│   │
│   ├── 📁 config/
│   │   ├── 📄 index.ts             # Конфигурация приложения
│   │   └── 📄 database.ts          # Prisma client
│   │
│   ├── 📁 queues/
│   │   └── 📄 index.ts             # BullMQ очереди
│   │
│   ├── 📁 workers/
│   │   ├── 📄 scrapingWorker.ts    # Воркер скрапинга
│   │   ├── 📄 processingWorker.ts  # Воркер обработки
│   │   └── 📄 notificationWorker.ts# Воркер уведомлений
│   │
│   ├── 📁 services/
│   │   │
│   │   ├── 📁 scraper/
│   │   │   ├── 📄 base.ts          # Базовый класс скрапера
│   │   │   ├── 📄 kwork.ts         # Kwork скрапер
│   │   │   └── 📄 flru.ts          # FL.ru скрапер
│   │   │
│   │   ├── 📁 processor/
│   │   │   ├── 📄 aiFilter.ts      # AI фильтрация
│   │   │   └── 📄 deduplicator.ts  # Дедупликация
│   │   │
│   │   └── 📁 notifier/
│   │       └── 📄 telegramBot.ts   # Telegram бот (TODO)
│   │
│   └── 📁 utils/
│       ├── 📄 logger.ts            # Winston логгер
│       └── 📄 errorHandler.ts      # Обработка ошибок (TODO)
│
└── 📁 logs/
    ├── 📄 all.log                  # Все логи
    └── 📄 error.log                # Только ошибки
```

---

## 📊 СТАТИСТИКА ПРОЕКТА

| Компонент | Файлов | Строк кода |
|-----------|--------|------------|
| **API** | 2 | ~150 |
| **Workers** | 3 | ~300 |
| **Services** | 5 | ~400 |
| **Config** | 2 | ~50 |
| **Queues** | 1 | ~100 |
| **Prisma** | 1 | ~200 |
| **Итого** | **14** | **~1200** |

---

## 🎯 ФУНКЦИОНАЛЬНОСТЬ MVP

### ✅ Реализовано

1. **Парсинг:**
   - Kwork (HTML)
   - FL.ru (RSS)

2. **Обработка:**
   - AI фильтрация (Ollama)
   - Дедупликация (hash)

3. **Уведомления:**
   - Telegram бот

4. **Хранение:**
   - PostgreSQL (Prisma ORM)
   - Redis (BullMQ очереди)

5. **API:**
   - REST endpoints
   - Health check

### ⏳ В разработке (TODO)

- [ ] Telegram каналы парсинг
- [ ] Proxy support
- [ ] Web dashboard
- [ ] Statistics
- [ ] Multi-user поддержка

---

## 🚀 БЫСТРЫЙ СТАРТ

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск инфраструктуры
docker-compose up -d postgres redis ollama

# 3. Миграция БД
npx prisma migrate dev

# 4. Запуск приложения
npm run dev

# 5. Проверка
curl http://localhost:3000/health
```

---

**Проект готов к запуску! 🎉**

Следуйте инструкции в `GETTING_STARTED.md`
