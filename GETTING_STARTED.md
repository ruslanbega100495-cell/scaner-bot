# 🚀 ЗАПУСК MVP - ПОШАГОВАЯ ИНСТРУКЦИЯ

## ✅ ЧТО ГОТОВО

- [x] Структура проекта создана
- [x] Зависимости установлены
- [x] Prisma клиент сгенерирован
- [x] Код написан

---

## 📋 ШАГ 1: Проверка окружения

Убедитесь, что у вас установлено:

```bash
# Проверка Node.js
node -v  # Должно быть v20+

# Проверка npm
npm -v   # Должно быть 10+

# Проверка Docker (опционально)
docker -v
docker-compose -v
```

---

## 📋 ШАГ 2: Запуск инфраструктуры

### Вариант A: Docker (рекомендуется)

```bash
# Запуск PostgreSQL, Redis и Ollama
docker-compose up -d postgres redis ollama

# Проверка
docker-compose ps

# Логи
docker-compose logs -f
```

### Вариант B: Локально (если Docker недоступен)

**PostgreSQL:**
1. Скачайте с https://www.postgresql.org/download/
2. Установите
3. Создайте базу данных:
```sql
CREATE DATABASE fms_db;
CREATE USER fms_user WITH PASSWORD 'fms_password';
GRANT ALL PRIVILEGES ON DATABASE fms_db TO fms_user;
```

**Redis:**
1. Скачайте с https://github.com/microsoftarchive/redis/releases
2. Запустите `redis-server.exe`

**Ollama:**
1. Скачайте с https://ollama.ai
2. Установите
3. Загрузите модель:
```bash
ollama pull qwen2.5:14b
```

---

## 📋 ШАГ 3: Настройка .env

Файл `.env` уже создан с вашими данными:

```env
TELEGRAM_BOT_TOKEN=8796940198:AAE5Dym0W9GgVzQLKhsBBX1HKk-XBuZcRAc
TELEGRAM_ADMIN_ID=6802394907
```

**Проверьте:**
- [ ] Токен бота правильный
- [ ] Chat ID правильный

---

## 📋 ШАГ 4: Миграция базы данных

```bash
# Применить миграции
npx prisma migrate dev --name init

# Если ошибка - создайте базу вручную
# Затем примените миграции
```

---

## 📋 ШАГ 5: Запуск приложения

### Вариант A: Development (с hot-reload)

```bash
npm run dev
```

Ожидайте вывод:
```
🚀 Starting Freelance Monitoring System...
📍 Environment: development
✅ Database connected
🚀 Server started on port 3000
📍 Health: http://localhost:3000/health
```

### Вариант B: Production

```bash
# Сборка
npm run build

# Запуск
npm start
```

### Вариант C: Docker

```bash
docker-compose up app
```

---

## 📋 ШАГ 6: Проверка работы

### 1. Health check

Откройте в браузере:
```
http://localhost:3000/health
```

Или через curl:
```bash
curl http://localhost:3000/health
```

**Ожидаемый ответ:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-29T..."
}
```

### 2. API endpoints

**Получить заказы:**
```bash
curl http://localhost:3000/api/v1/jobs
```

**Запустить скрапинг Kwork:**
```bash
curl -X POST http://localhost:3000/api/v1/jobs/scan \
  -H "Content-Type: application/json" \
  -d '{"source": "kwork"}'
```

**Проверить статус:**
```bash
curl http://localhost:3000/api/v1/jobs
```

---

## 📋 ШАГ 7: Проверка Telegram уведомлений

1. Откройте своего бота в Telegram: **@Agent_freelance_bot**
2. Нажмите **Start** или **Запустить**
3. Запустите скрапинг (см. Шаг 6.2)
4. Проверьте Telegram — должно прийти сообщение

---

## 🛠 ОТЛАДКА

### Логи приложения

```bash
# Логи в реальном времени
tail -f logs/all.log

# Только ошибки
tail -f logs/error.log
```

### Логи Docker

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f app
docker-compose logs -f postgres
```

### Prisma Studio (визуальный редактор БД)

```bash
npm run prisma:studio
```

Откроется в браузере: http://localhost:5555

---

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### "Cannot connect to database"

**Решение:**
1. Проверьте, запущен ли PostgreSQL
2. Проверьте DATABASE_URL в .env
3. Убедитесь, что база данных создана

### "Redis connection failed"

**Решение:**
1. Проверьте, запущен ли Redis
2. Проверьте REDIS_URL в .env
3. Порт 6379 должен быть свободен

### "Ollama not responding"

**Решение:**
```bash
# Проверьте, запущен ли Ollama
ollama list

# Если пусто - загрузите модель
ollama pull qwen2.5:14b
```

### "Telegram bot not sending messages"

**Решение:**
1. Проверьте токен в .env
2. Убедитесь, что нажали Start в боте
3. Проверьте Chat ID

---

## 📊 АРХИТЕКТУРА MVP

```
┌─────────────┐
│   Browser   │──── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
└─────────────┘                      │
         │                           ▼
         ▼                   ┌──────────────┐
  curl /health              │   Telegram   │
         │                  │     Bot      │
         ▼                  └──────────────┘
┌─────────────┐                      ▲
│ Express API │──────┐               │
└─────────────┘      │               │
         │           │               │
         ▼           ▼               │
┌─────────────┐ ┌──────────────┐     │
│  PostgreSQL │ │    Redis     │─────┘
└─────────────┘ │   (BullMQ)   │
                └──────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Scraping  │ │ Processing  │ │ Notification│
│   Worker    │ │   Worker    │ │   Worker    │
│             │ │             │ │             │
│ - Kwork     │ │ - AI Filter │ │ - Telegram  │
│ - FL.ru     │ │ - Dedup     │ │ - Bot       │
└─────────────┘ └─────────────┘ └─────────────┘
                       │
                       ▼
                ┌─────────────┐
                │   Ollama    │
                │  (qwen2.5)  │
                └─────────────┘
```

---

## ✅ ГОТОВО!

Система работает! Теперь вы можете:

1. **Скрапить заказы** через API
2. **Получать уведомления** в Telegram
3. **Управлять заказами** через API
4. **Мониторить логи** через файлы или Docker

---

## 📞 СЛЕДУЮЩИЕ ШАГИ

1. Добавить больше источников (Profi.ru, Upwork)
2. Улучшить парсинг (Playwright для JS сайтов)
3. Добавить proxy support
4. Создать web dashboard
5. Настроить расписание (cron)

---

**Удачи! 🚀**
