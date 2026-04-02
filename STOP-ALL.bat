@echo off
echo ============================================
echo  ОСТАНОВКА СИСТЕМЫ
echo ============================================
echo.

echo [1/2] Остановка приложения...
taskkill /F /FI "WINDOWTITLE eq Freelance Monitor*" >nul 2>&1
echo  Готово

echo.
echo [2/2] Остановка инфраструктуры...
docker-compose down
echo  Готово

echo.
echo ============================================
echo  СИСТЕМА ОСТАНОВЛЕНА
echo ============================================
echo.
pause
