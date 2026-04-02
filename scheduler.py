import asyncio
import aiohttp
import config
from db import order_exists, save_order
from llm import evaluate_relevance
from notifier import notify


async def poll_once():
    """Один цикл опроса всех бирж."""
    async with aiohttp.ClientSession() as session:
        for ExchangeClass in config.EXCHANGES:
            exchange = ExchangeClass()
            try:
                orders = await exchange.fetch_orders(session)
            except Exception as e:
                print(f"[{exchange.__class__.__name__}] Ошибка fetch: {e}")
                continue

            for order in orders:
                # Шаг 2: проверить, есть ли url в БД
                if await order_exists(order.url):
                    continue

                # Шаг 3: сохранить в БД, отправить в LLM
                relevance = await evaluate_relevance(order.title, order.description)
                await save_order(order, relevance)

                # Шаг 4: если LLM вернул 70%+ — отправить уведомление
                if relevance >= config.RELEVANCE_THRESHOLD:
                    try:
                        await notify(order, relevance)
                    except Exception as e:
                        print(f"[Notifier] Ошибка: {e}")


async def run_scheduler():
    """Бесконечный цикл опроса раз в POLL_INTERVAL_SECONDS секунд."""
    print(f"[Scheduler] Запуск. Интервал: {config.POLL_INTERVAL_SECONDS} сек.")
    while True:
        try:
            await poll_once()
        except Exception as e:
            print(f"[Scheduler] Непредвиденная ошибка: {e}")
        await asyncio.sleep(config.POLL_INTERVAL_SECONDS)
