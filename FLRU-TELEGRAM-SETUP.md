# 🚀 ЗАПУСК FL.RU + TELEGRAM КАНАЛОВ

## ✅ ЧТО СДЕЛАНО

### Новые файлы:
- `src/services/scraper/flru.ts` - FL.ru RSS парсер
- `src/services/scraper/telegram.ts` - Telegram парсер (32 канала)
- `src/scripts/seed-sources.ts` - Seed скрипт для БД

### Обновлённые файлы:
- `src/workers/scrapingWorker.ts` - Добавлены flru и telegram
- `package.json` - Добавлен скрипт seed:sources

### НЕ ИЗМЕНЯЛИСЬ:
- ✅ Kwork scraper (работает как прежде)
- ✅ processingWorker.ts
- ✅ notificationWorker.ts
- ✅ AI фильтр
- ✅ Схема БД
- ✅ Очереди

---

## 🚀 БЫСТРЫЙ СТАРТ

### 1. Запустить инфраструктуру

```bash
docker-compose up -d postgres redis ollama
```

### 2. Запустить приложение

```bash
npm run dev
```

### 3. Инициализировать источники в БД

```bash
npm run seed:sources
```

**Ожидаемый вывод:**
```
🌱 Seeding sources...
✅ Source: Kwork (ID: 1)
✅ Source: FL.ru (ID: 2)
✅ Source: Telegram (ID: 3)
🎉 Seeding completed!
```

---

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Kwork (уже работал)

```bash
curl "http://localhost:3000/api/v1/jobs/scan?source=kwork"
```

### Тест 2: FL.ru (новый)

```bash
curl "http://localhost:3000/api/v1/jobs/scan?source=flru"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "jobId": "...",
  "message": "Scanning flru..."
}
```

### Тест 3: Telegram (новый)

```bash
curl "http://localhost:3000/api/v1/jobs/scan?source=telegram"
```

**Ожидаемый ответ:**
```json
{
  "success": true,
  "jobId": "...",
  "message": "Scanning telegram..."
}
```

---

## 📊 МОНИТОРИНГ

### Логи в реальном времени

```bash
tail -f logs/all.log
```

### Фильтр по источникам

```bash
# FL.ru
tail -f logs/all.log | grep "FL.ru"

# Telegram
tail -f logs/all.log | grep "Telegram"

# Kwork
tail -f logs/all.log | grep "Kwork"
```

### Проверка БД

```bash
# Подключиться к PostgreSQL
docker-compose exec postgres psql -U fms_user -d fms_db

# Проверить источники
SELECT id, name, type, url, "isActive" FROM "Source";

# Проверить заказы по источникам
SELECT source, COUNT(*) FROM "Job" GROUP BY source;

# Выйти
\q
```

---

## 📺 TELEGRAM КАНАЛЫ (32 штуки)

Все каналы уже добавлены в `src/services/scraper/telegram.ts`:

1. freelance_ru
2. python_jobs
3. it_jobs_ru
4. tg_jobs
5. freelancehunt
6. remote_ru
7. it_freelance
8. webfreelance
9. botmakers
10. n8n_ru
11. jobs_start
12. rueventjob
13. habr_career
14. hmoffice
15. workk_on
16. onlinevakansii
17. rabotay
18. rabota_doma
19. rabotax
20. juniors_rabota_jobs
21. freetasks
22. normrabota
23. freelancce
24. rabota_udalennaya_vakansii_tg
25. freelance_exchange
26. kwork_ru
27. fl_ru
28. weblancer
29. freelancehub_ru
30. zakazchik_freelancer
31. freelance_tg
32. freelance_projects
33. test_monitor_ruslan

**Фильтрация:**
- Общие ключевые слова: "нужен|ищу|требуется|заказ|работа|бюджет|оплата|₽|руб"
- Ключевые слова канала: индивидуально для каждого

---

## ⚙️ НАСТРОЙКИ

### Частота скрапинга

В `seed-sources.ts`:
- Kwork: 300 сек (5 минут)
- FL.ru: 300 сек (5 минут)
- Telegram: 180 сек (3 минуты)

### Rate limiting

- Kwork: 60 запросов/мин
- FL.ru: 60 запросов/мин
- Telegram: 30 запросов/мин (медленнее из-за большого количества каналов)

---

## 🛠 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### "Source not found"

**Решение:**
```bash
npm run seed:sources
```

### "Telegram rate limited"

Telegram ограничивает запросы. Это нормально.

**Решение:**
- Воркер автоматически делает паузу 1-3 секунды между каналами
- При 429 ошибке ждёт 5 секунд

### "FL.ru возвращает 0 jobs"

FL.ru может блокировать запросы.

**Решение:**
- Проверьте RSS вручную: https://www.fl.ru/projects/rss/
- Увеличьте интервал скрапинга

### "Module cheerio not found"

**Решение:**
```bash
npm install
```

---

## 📊 ПОЛНЫЙ ЦИКЛ РАБОТЫ

```
1. npm run dev                      # Запуск приложения
2. npm run seed:sources             # Инициализация источников
3. curl .../scan?source=kwork       # Тест Kwork
4. curl .../scan?source=flru        # Тест FL.ru
5. curl .../scan?source=telegram    # Тест Telegram
6. tail -f logs/all.log             # Мониторинг логов
7. Проверить Telegram               # Уведомления
```

---

## ✅ ГОТОВОСТЬ

**После запуска:**

- ✅ Kwork работает (без изменений)
- ✅ FL.ru работает (RSS парсинг)
- ✅ Telegram работает (32 канала)
- ✅ processingWorker без изменений
- ✅ notificationWorker без изменений
- ✅ AI фильтр без изменений
- ✅ Уведомления без изменений

---

**ВСЁ РАБОТАЕТ! 🚀**
