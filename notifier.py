from aiogram import Bot
from db import Order
import config

_bot: Bot | None = None


def get_bot() -> Bot:
    global _bot
    if _bot is None:
        _bot = Bot(token=config.TELEGRAM_BOT_TOKEN)
    return _bot


async def notify(order: Order, relevance: int):
    text = (
        f"🔔 <b>Новый заказ ({relevance}%)</b>\n\n"
        f"<b>{order.title}</b>\n"
        f"{order.description[:300]}{'...' if len(order.description) > 300 else ''}\n\n"
        f"💰 {order.price}  ⏰ {order.deadline}\n"
        f"👤 {order.client}  📌 {order.source}\n\n"
        f'<a href="{order.url}">Открыть заказ</a>'
    )
    bot = get_bot()
    await bot.send_message(
        chat_id=config.TELEGRAM_CHAT_ID,
        text=text,
        parse_mode="HTML",
        disable_web_page_preview=True,
    )
