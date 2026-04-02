@echo off
echo ============================================
echo  ПРОВЕРКА СТАТУСА
echo ============================================
echo.

echo [1/4] Docker контейнеры:
docker-compose ps
echo.

echo [2/4] Здоровье API:
curl -s http://localhost:3000/health -UseBasicParsing
echo.
echo.

echo [3/4] Заказы в базе:
curl -s http://localhost:3000/api/v1/jobs -UseBasicParsing | findstr /C:"data"
echo.

echo [4/4] Последние логи:
type logs\all.log 2>nul | findstr /C:"Processing" | more +0
echo.

echo ============================================
pause
