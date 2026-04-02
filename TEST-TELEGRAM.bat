@echo off
echo ============================================
echo  TELEGRAM TEST - ПРОВЕРКА БОТА
echo ============================================
echo.

echo  Отправка тестового сообщения...
curl -s "https://api.telegram.org/bot8796940198:AAE5Dym0W9GgVzQLKhsBBX1HKk-XBuZcRAc/sendMessage?chat_id=6802394907&text=✅ ТЕСТОВОЕ СООБЩЕНИЕ%0A%0AБот работает! Система готова." -UseBasicParsing >nul 2>&1

if %errorlevel% equ 0 (
    echo  Сообщение отправлено!
    echo  Проверьте @Agent_freelance_bot
) else (
    echo  Ошибка отправки. Проверьте токен и Chat ID.
)

echo.
pause
