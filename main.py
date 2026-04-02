import asyncio
from aiogram import Bot, Dispatcher
from db import init_db
from scheduler import run_scheduler
import config


async def main():
    # Инициализация БД
    await init_db()
    print("[DB] База данных инициализирована.")

    # Запуск бота и планировщика параллельно
    bot = Bot(token=config.TELEGRAM_BOT_TOKEN)
    dp = Dispatcher()

    await asyncio.gather(
        dp.start_polling(bot, handle_signals=False),
        run_scheduler(),
    )


if __name__ == "__main__":
    asyncio.run(main())
