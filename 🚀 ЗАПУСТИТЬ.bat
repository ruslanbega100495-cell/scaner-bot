# 🎯 ЗАПУСК FREELANCE MONITORING SYSTEM

## 🚀 ЗАПУСК ОДНИМ КЛИКОМ

### Главный файл для запуска:

**📄 [`START-ALL.bat`](START-ALL.bat)** ← **ДВАЖДЫ КЛИКНИТЕ СЮДА!**

---

## 📁 ВСЕ ФАЙЛЫ

| Файл | Описание |
|------|----------|
| 🚀 [`START-ALL.bat`](START-ALL.bat) | **ЗАПУСТИТЬ ВСЁ** (инфраструктура + приложение + браузер) |
| 📬 [`TEST-TELEGRAM.bat`](TEST-TELEGRAM.bat) | Проверка Telegram бота |
| 📊 [`STATUS.bat`](STATUS.bat) | Проверка статуса системы |
| ⏹️ [`STOP-ALL.bat`](STOP-ALL.bat) | Остановить всё |
| 📖 [`README-RUN.md`](README-RUN.md) | Полная инструкция |
| 📖 [`START.md`](START.md) | Подробный запуск |

---

## 🎯 БЫСТРЫЙ СТАРТ

1. **Дважды кликните** на [`START-ALL.bat`](START-ALL.bat)
2. Дождитесь "СИСТЕМА ЗАПУЩЕНА!"
3. Браузер откроется автоматически
4. Кликните на ссылку **"Скрапинг"**
5. Через 5-10 секунд проверьте Telegram

---

## 📊 ЧТО ОТКРОЕТСЯ

После запуска:

**Окно 1: Freelance Monitor**
```
🚀 Starting Freelance Monitoring System...
✅ Database connected
🚀 Server started on port 3000
👷 Starting workers...
```

**Окно 2: Браузер (3 вкладки)**
- Health: http://localhost:3000/health
- Скрапинг: http://localhost:3000/api/v1/jobs/scan?source=kwork
- Заказы: http://localhost:3000/api/v1/jobs

---

## 🧪 ПРОВЕРКА РАБОТЫ

### Telegram тест

**Дважды кликните:** [`TEST-TELEGRAM.bat`](TEST-TELEGRAM.bat)

**Придёт сообщение:**
```
✅ ТЕСТОВОЕ СООБЩЕНИЕ

Бот работает! Система готова.
```

### Статус системы

**Дважды кликните:** [`STATUS.bat`](STATUS.bat)

**Покажет:**
- ✅ Docker контейнеры
- ✅ Здоровье API
- ✅ Заказы в базе
- ✅ Логи

---

## ⏹️ ОСТАНОВКА

**Дважды кликните:** [`STOP-ALL.bat`](STOP-ALL.bat)

---

## 📋 РУЧНОЙ ЗАПУСК

Если batch-файлы не работают:

```bash
# 1. Инфраструктура
docker-compose up -d postgres redis ollama

# 2. Приложение
npm run dev

# 3. Проверка
curl http://localhost:3000/health -UseBasicParsing
```

---

## ⚠️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

| Проблема | Решение |
|----------|---------|
| Docker не запущен | Запустите Docker Desktop |
| Порт 3000 занят | Измените PORT в `.env` |
| Telegram не работает | Проверьте `.env` файл |

---

## 📞 ПОДДЕРЖКА

**Документация:**
- [`README-RUN.md`](README-RUN.md) - полная инструкция
- [`START.md`](START.md) - подробный запуск
- [`README.md`](README.md) - о проекте

**Логи:**
- `logs/all.log` - все события
- `logs/error.log` - ошибки

---

**🚀 КЛИКАЙТЕ НА [`START-ALL.bat`](START-ALL.bat) И РАБОТАЙТЕ!**
