# 🧪 ТЕСТИРОВАНИЕ API - MIGS

## 📋 ПРЕДВАРИТЕЛЬНЫЕ ТРЕБОВАНИЯ

1. Запустить инфраструктуру:
```bash
docker-compose up -d postgres redis
```

2. Применить миграции:
```bash
npm run db:migrate
```

3. Запустить API:
```bash
npm run dev:api
```

---

## 🔐 1. РЕГИСТРАЦИЯ И АВТОРИЗАЦИЯ

### Регистрация нового пользователя

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "telegramUsername": "testuser"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "test@example.com",
      "plan": "FREE"
    },
    "token": "jwt_token_here"
  }
}
```

### Логин

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📤 2. ЗАГРУЗКА EXCEL (СОЗДАНИЕ JOB)

### Создать job (загрузить Excel файл)

```bash
curl -X POST http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-data.xlsx" \
  -F "marketplace=wildberries"
```

**Параметры:**
- `file` - Excel файл (.xlsx)
- `marketplace` - wildberries | yandex-market (опционально)

**Ответ:**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid-job-id",
    "status": "PENDING",
    "message": "File uploaded successfully"
  }
}
```

---

## 📊 3. ПРОВЕРКА СТАТУСА

### Получить список jobs

```bash
curl -X GET http://localhost:3000/api/v1/jobs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "PROCESSING",
      "progress": 45,
      "totalRows": 100,
      "processedRows": 45,
      "createdAt": "2026-03-30T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

### Получить детали job

```bash
curl -X GET http://localhost:3000/api/v1/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить прогресс обработки

```bash
curl -X GET http://localhost:3000/api/v1/jobs/JOB_ID/progress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "GENERATING",
    "progress": 75,
    "processedRows": 75,
    "totalRows": 100,
    "estimatedTimeRemaining": 120
  }
}
```

---

## 📥 4. СКАЧИВАНИЕ CSV

### Скачать готовый CSV

```bash
curl -X GET http://localhost:3000/api/v1/jobs/JOB_ID/download \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output export.csv
```

---

## 🖼️ 5. ПРОВЕРКА ИЗОБРАЖЕНИЙ

### Получить список товаров в job

```bash
curl -X GET http://localhost:3000/api/v1/jobs/JOB_ID/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить изображения товара

```bash
curl -X GET http://localhost:3000/api/v1/items/ITEM_ID/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "MAIN",
      "publicUrl": "https://drive.google.com/uc?id=...",
      "uploadStatus": "COMPLETED"
    },
    {
      "id": "uuid",
      "type": "FEATURES",
      "publicUrl": "https://drive.google.com/uc?id=...",
      "uploadStatus": "COMPLETED"
    }
  ]
}
```

---

## 🔗 6. ИНТЕГРАЦИИ

### Подключить Google Drive

```bash
curl -X GET "http://localhost:3000/api/v1/integrations/google-drive/connect" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Перенаправит на OAuth Google**

### Подключить Яндекс Диск

```bash
curl -X GET "http://localhost:3000/api/v1/integrations/yandex-disk/connect" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Получить список интеграций

```bash
curl -X GET http://localhost:3000/api/v1/integrations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 👤 7. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ

### Получить профиль

```bash
curl -X GET http://localhost:3000/api/v1/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "test@example.com",
    "plan": "FREE",
    "jobsThisMonth": 3,
    "jobLimit": 5,
    "totalJobs": 10,
    "totalImages": 40
  }
}
```

### Получить использование лимитов

```bash
curl -X GET http://localhost:3000/api/v1/user/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🗑️ 8. УДАЛЕНИЕ

### Удалить job

```bash
curl -X DELETE http://localhost:3000/api/v1/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Отключить интеграцию

```bash
curl -X DELETE http://localhost:3000/api/v1/integrations/PROVIDER \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 POSTMAN COLLECTION

Импортируйте в Postman:

```json
{
  "info": {
    "name": "MIGS API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"telegramUsername\": \"testuser\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/v1/auth/register",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/v1/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "v1", "auth", "login"]
            }
          },
          "event": [
            {
              "listen": "test",
              "script": {
                "exec": [
                  "const jsonData = pm.response.json();",
                  "pm.collectionVariables.set('token', jsonData.data.token);"
                ]
              }
            }
          ]
        }
      ]
    },
    {
      "name": "Upload Excel",
      "request": {
        "method": "POST",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/test-data.xlsx"
            },
            {
              "key": "marketplace",
              "value": "wildberries",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{base_url}}/api/v1/jobs",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "jobs"]
        }
      }
    },
    {
      "name": "Get Jobs",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": {
          "raw": "{{base_url}}/api/v1/jobs",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "jobs"]
        }
      }
    },
    {
      "name": "Get Job Progress",
      "request": {
        "method": "GET",
        "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
        "url": {
          "raw": "{{base_url}}/api/v1/jobs/{{job_id}}/progress",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "jobs", "{{job_id}}", "progress"]
        }
      }
    }
  ]
}
```

---

## 🧪 ТЕСТОВЫЙ EXCEL ФАЙЛ

Создайте файл `test-data.xlsx` со столбцами:

| article | brand | name | color | size | material | price | imageUrl |
|---------|-------|------|-------|------|----------|-------|----------|
| IS469901 | Nike | Футболка | Red | XL | Cotton | 1500 | https://... |
| IS469902 | Adidas | Брюки | Black | L | Polyester | 2500 | https://... |

---

## ✅ ЧЕК-ЛИСТ ПРОВЕРКИ

- [ ] Регистрация работает
- [ ] Логин работает
- [ ] Excel загружается
- [ ] Job создаётся
- [ ] Прогресс обновляется
- [ ] Изображения генерируются
- [ ] CSV скачивается
- [ ] Интеграции подключаются

---

**Все примеры работают с запущенным API!**
