# 🧪 ТЕСТИРОВАНИЕ СИСТЕМЫ

## ✅ ЧТО ИСПРАВЛЕНО

1. **Source Foreign Key** - Автоматическое создание Source
2. **AI Filter** - Graceful fallback при ошибке
3. **Telegram** - Подробное логирование
4. **Duplicates** - Обработка P2002 ошибки
5. **GET /scan** - Поддержка для тестирования

---

## 🚀 БЫСТРОЕ ТЕСТИРОВАНИЕ

### Шаг 1: Запуск инфраструктуры

```bash
# PostgreSQL + Redis
docker-compose up -d postgres redis

# Проверка
docker-compose ps
```

### Шаг 2: Миграция БД

```bash
npx prisma migrate dev --name init
```

### Шаг 3: Запуск приложения

```bash
# Терминал 1: API + Workers
npm run dev
```

### Шаг 4: Проверка API

```bash
# Health check
curl http://localhost:3000/health

# Должно вернуть: {"status":"ok",...}
```

### Шаг 5: Запуск скрапинга

**Вариант A: Через браузер (GET)**
```
http://localhost:3000/api/v1/jobs/scan
```

**Вариант B: curl (POST)**
```bash
curl -X POST http://localhost:3000/api/v1/jobs/scan \
  -H "Content-Type: application/json" \
  -d '{"source": "kwork"}'
```

**Вариант C: curl (GET)**
```bash
curl http://localhost:3000/api/v1/jobs/scan?source=kwork
```

### Шаг 6: Проверка логов

Смотрите логи в реальном времени:

```bash
# Все логи
tail -f logs/all.log

# Только ошибки
tail -f logs/error.log

# Фильтр по ключевым словам
tail -f logs/all.log | grep -E "(Processing|Telegram|AI)"
```

### Шаг 7: Проверка Telegram

1. Откройте @Agent_freelance_bot
2. Нажмите **Start**
3. Через 5-10 секунд после скрапинга должно прийти сообщение

---

## 🔍 ОТЛАДКА

### Логи по компонентам

```bash
# Scraping
tail -f logs/all.log | grep "🔍 Scraping"

# Processing
tail -f logs/all.log | grep "⚙️ Processing"

# AI Filter
tail -f logs/all.log | grep "🤖 AI"

# Telegram
tail -f logs/all.log | grep "📬"

# Database
tail -f logs/all.log | grep "💾"
```

### Проверка очередей

```bash
# Подключиться к Redis CLI
docker-compose exec redis redis-cli

# Проверить размер очереди scraping
LLEN fms:scraping

# Проверить размер очереди processing
LLEN fms:processing

# Проверить размер очереди notification
LLEN fms:notification

# Выйти
exit
```

### Проверка БД

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U fms_user -d fms_db

# Посмотреть заказы
SELECT id, title, "sourceId", "isSuitable", "aiScore" FROM "Job" ORDER BY "scrapedAt" DESC LIMIT 10;

# Посмотреть источники
SELECT id, name, type FROM "Source";

# Посмотреть уведомления
SELECT id, "jobId", status, "sentAt" FROM "Notification" ORDER BY "createdAt" DESC LIMIT 10;

# Выйти
\q
```

---

## 📊 ТИПИЧНЫЕ СЦЕНАРИИ

### Сценарий 1: Полная цепочка работает

```
1. POST /api/v1/jobs/scan
   ↓
2. Scraping Worker находит 10 jobs
   ↓
3. Processing Worker обрабатывает:
   - Проверка дубликатов ✅
   - AI фильтрация ✅ (score: 8/10)
   - Создание Source ✅
   - Сохранение в БД ✅
   - Отправка в Telegram ✅
   ↓
4. Notification Worker отправляет
   ↓
5. Сообщение приходит в Telegram ✅
```

**Ожидаемые логи:**
```
🔍 Scraping Kwork: https://kwork.ru/freelance
✅ Kwork scraped: 10 jobs
⚙️ Processing job: Разработать Telegram бота
🔍 Checking duplicate for: https://kwork.ru/freelance/12345
✅ Not a duplicate
🤖 Running AI filter...
🤖 AI Score: 8/10 - ✅
📌 Using Source ID: 1
💾 Job saved to DB: ID=1
✅ Job is suitable, sending to Telegram...
📬 Sending Telegram message to: 6802394907
📬 Sending message to Telegram
✅ Message sent successfully! Message ID: 456
✅ Notification queued successfully
```

### Сценарий 2: AI недоступен

```
🤖 Running AI filter...
⚠️ AI filter API failed: connect ECONNREFUSED
⚠️ Ollama not running - using fallback
🤖 AI Score: 10/10 - ✅ (fallback)
```

**Результат:** Job проходит через фильтр с score=10

### Сценарий 3: Telegram заблокирован

```
📬 Sending Telegram message to: 6802394907
❌ Telegram notification failed: 403 Forbidden
⚠️ User 6802394907 blocked the bot
💾 Notification status updated to FAILED
```

**Результат:** Уведомление помечено как FAILED

---

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### "Source not found"

**Решение:**
```bash
# Проверить наличие Sources
docker-compose exec postgres psql -U fms_user -d fms_db -c "SELECT * FROM \"Source\";"

# Если пусто - Source создадутся автоматически при обработке первого job
```

### "AI filter failed"

**Решение:**
```bash
# Проверить Ollama
docker-compose ps ollama

# Если не запущен - запустить
docker-compose up -d ollama

# Проверить модель
docker-compose exec ollama ollama list

# Если нет модели - загрузить
docker-compose exec ollama ollama pull qwen2.5:14b
```

### "Telegram not sending"

**Проверка:**
1. Токен правильный в .env?
2. Chat ID правильный?
3. Бот запущен (нажали Start)?

**Тест вручную:**
```bash
curl "https://api.telegram.org/bot8796940198:AAE5Dym0W9GgVzQLKhsBBX1HKk-XBuZcRAc/sendMessage?chat_id=6802394907&text=Test"
```

---

## 🎯 ФИНАЛЬНАЯ ПРОВЕРКА

Выполните команды по очереди:

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Запустить скрапинг
curl http://localhost:3000/api/v1/jobs/scan?source=kwork

# 3. Подождать 5-10 секунд

# 4. Проверить заказы
curl http://localhost:3000/api/v1/jobs

# 5. Проверить Telegram
# Откройте бота @Agent_freelance_bot
```

**✅ УСПЕХ если:**
- Health возвращает `{"status":"ok"}`
- Scan возвращает `{"success":true,"jobId":...}`
- Jobs возвращает список заказов
- Telegram сообщение пришло

---

## 📞 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

1. Проверьте логи: `tail -f logs/all.log`
2. Проверьте Docker: `docker-compose ps`
3. Проверьте .env файл
4. Перезапустите приложение: `Ctrl+C` → `npm run dev`

---

**Удачи! 🚀**
