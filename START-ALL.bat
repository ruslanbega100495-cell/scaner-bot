@echo off
echo ============================================
echo  FREELANCE MONITORING SYSTEM - ЗАПУСК
echo ============================================
echo.

REM Проверка Docker
echo [1/4] Проверка Docker...
docker-compose ps >nul 2>&1
if %errorlevel% neq 0 (
    echo  Docker не запущен. Запускаем инфраструктуру...
    docker-compose up -d postgres redis ollama
    timeout /t 10 /nobreak >nul
) else (
    echo  Docker уже запущен
)
echo.

REM Проверка портов
echo [2/4] Проверка портов...
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo  Порт 3000 уже занят. Завершаем старый процесс...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)
echo.

REM Запуск приложения
echo [3/4] Запуск приложения...
echo  Откроется новое окно с логами
start "Freelance Monitor" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul
echo.

REM Открытие браузера
echo [4/4] Открытие браузера...
echo  Health check: http://localhost:3000/health
echo  Скрапинг: http://localhost:3000/api/v1/jobs/scan?source=kwork
echo  Заказы: http://localhost:3000/api/v1/jobs
timeout /t 3 /nobreak >nul
start http://localhost:3000/health
start http://localhost:3000/api/v1/jobs/scan?source=kwork
start http://localhost:3000/api/v1/jobs
echo.

echo ============================================
echo  СИСТЕМА ЗАПУЩЕНА!
echo ============================================
echo.
echo  Окна:
echo   1. Freelance Monitor - логи приложения
echo   2. Браузер - API endpoints
echo.
echo  Для остановки:
echo   1. Закройте окно Freelance Monitor (Ctrl+C)
echo   2. docker-compose down
echo.
echo ============================================
pause
