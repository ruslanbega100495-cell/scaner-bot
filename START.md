# 🚀 ЗАПУСК FREELANCE MONITORING SYSTEM

## 📋 БЫСТРЫЙ СТАРТ (5 команд)

### 1. Запустить инфраструктуру (PostgreSQL + Redis + Ollama)

```bash
docker-compose up -d postgres redis ollama
```

### 2. Проверить что работает

```bash
docker-compose ps
```

Должно быть:
```
NAME                STATUS
fms-postgres        Up
fms-redis           Up
fms-ollama          Up
```

### 3. Запустить приложение

```bash
npm run dev
```

**Ожидаемый вывод:**
```
🚀 Starting Freelance Monitoring System...
📍 Environment: development
✅ Database connected
🚀 Server started on port 3000
📍 Health: http://localhost:3000/health
👷 Starting workers (development mode)...
🚀 Scraping worker started
🚀 Processing worker started
🚀 Notification worker started
✅ System started
```

### 4. Проверить работу

Откройте в браузере:
```
http://localhost:3000/health
```

Или в PowerShell:
```powershell
curl http://localhost:3000/health -UseBasicParsing
```

**Должно вернуть:**
```json
{"status":"ok","timestamp":"2026-03-30T..."}
```

### 5. Запустить скрапинг

Откройте в браузере:
```
http://localhost:3000/api/v1/jobs/scan?source=kwork
```

Или в PowerShell:
```powershell
curl "http://localhost:3000/api/v1/jobs/scan?source=kwork" -UseBasicParsing
```

**Должно вернуть:**
```json
{"success":true,"jobId":"...","message":"Scanning kwork..."}
```

---

## 📊 МОНИТОРИНГ

### Логи в реальном времени

```bash
# Все логи
tail -f logs/all.log

# Только ошибки
tail -f logs/error.log

# Фильтр по событиям
tail -f logs/all.log | grep "Processing"
tail -f logs/all.log | grep "Telegram"
tail -f logs/all.log | grep "AI"
```

### Проверка очередей (Redis)

```bash
# Подключиться к Redis
docker-compose exec redis redis-cli

# Проверить очереди
LLEN fms:scraping
LLEN fms:processing
LLEN fms:notification

# Выйти
exit
```

### Проверка базы данных

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U fms_user -d fms_db

# Посмотреть заказы
SELECT id, title, "isSuitable", "aiScore" FROM "Job" ORDER BY "scrapedAt" DESC LIMIT 10;

# Посмотреть источники
SELECT * FROM "Source";

# Выйти
\q
```

---

## 🛠 ОСТАНОВКА

### Остановить приложение

В терминале где запущено `npm run dev` нажмите **Ctrl+C**

### Остановить инфраструктуру

```bash
docker-compose down
```

### Полная очистка (если нужно)

```bash
docker-compose down -v  # Удаляет тома с данными
```

---

## 🔄 ПЕРЕЗАПУСК

### Перезапуск приложения

```bash
# Ctrl+C для остановки
# Затем снова:
npm run dev
```

### Перезапуск инфраструктуры

```bash
docker-compose restart
```

---

## 🧪 ТЕСТИРОВАНИЕ

### 1. Health Check

```bash
curl http://localhost:3000/health -UseBasicParsing
```

### 2. Запуск скрапинга

```bash
curl "http://localhost:3000/api/v1/jobs/scan?source=kwork" -UseBasicParsing
```

### 3. Проверка заказов

```bash
curl http://localhost:3000/api/v1/jobs -UseBasicParsing
```

### 4. Проверка Telegram

Откройте @Agent_freelance_bot в Telegram

---

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### "Cannot connect to database"

```bash
# Проверьте PostgreSQL
docker-compose ps postgres

# Если не запущен - перезапустите
docker-compose restart postgres

# Проверьте логи
docker-compose logs postgres
```

### "Redis connection failed"

```bash
# Проверьте Redis
docker-compose ps redis

# Если не запущен - перезапустите
docker-compose restart redis
```

### "Port 3000 already in use"

```bash
# Найдите процесс на порту 3000
netstat -ano | findstr :3000

# Убейте процесс
taskkill /F /PID <PID>

# Или измените порт в .env
PORT=3001
```

### "Ollama not responding"

```bash
# Проверьте Ollama
docker-compose ps ollama

# Проверьте модель
docker-compose exec ollama ollama list

# Если нет модели - загрузите
docker-compose exec ollama ollama pull qwen2.5:14b
```

### "Telegram bot not sending"

1. Проверьте токен в `.env`
2. Убедитесь что нажали Start в боте
3. Проверьте Chat ID

**Тест вручную:**
```bash
curl "https://api.telegram.org/bot8796940198:AAE5Dym0W9GgVzQLKhsBBX1HKk-XBuZcRAc/sendMessage?chat_id=6802394907&text=Test" -UseBasicParsing
```

---

## 📁 СТРУКТУРА ПРОЕКТА

```
freelance-monitor/
├── src/
│   ├── index.ts                 # Точка входа
│   ├── api/
│   │   ├── server.ts            # Express сервер
│   │   └── routes/jobs.ts       # API endpoints
│   ├── workers/
│   │   ├── scrapingWorker.ts    # Скрапинг
│   │   ├── processingWorker.ts  # Обработка + AI
│   │   └── notificationWorker.ts# Telegram
│   └── services/
│       ├── scraper/             # Парсеры
│       └── processor/           # AI + Dedup
├── prisma/
│   └── schema.prisma            # Модели БД
├── logs/
│   ├── all.log                  # Все логи
│   └── error.log                # Ошибки
├── docker-compose.yml           # Инфраструктура
├── .env                         # Конфиг
└── package.json                 # Зависимости
```

---

## 🎯 ПОЛНЫЙ ЦИКЛ РАБОТЫ

```
1. npm run dev                      # Запуск приложения
2. Открыть http://localhost:3000/health
3. Открыть http://localhost:3000/api/v1/jobs/scan?source=kwork
4. Смотреть логи: tail -f logs/all.log
5. Через 5-10 сек проверить Telegram
6. Проверить заказы: curl http://localhost:3000/api/v1/jobs
```

---

## 📞 ПОДДЕРЖКА

**Документация:**
- `README.md` - общая информация
- `GETTING_STARTED.md` - подробный запуск
- `TESTING.md` - тестирование
- `MVP_READY.md` - статус системы

**Логи:**
- `logs/all.log` - все события
- `logs/error.log` - только ошибки

---

**Система готова к работе! 🚀**
