import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001")

MY_SKILLS = os.getenv("MY_SKILLS", "")
RELEVANCE_THRESHOLD = int(os.getenv("RELEVANCE_THRESHOLD", "70"))
POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "60"))

KWORK_COOKIES = os.getenv("KWORK_COOKIES", "")
YANDEX_COOKIES = os.getenv("YANDEX_COOKIES", "")

# Список активных бирж (импортируется в scheduler.py)
from exchanges.kwork import KworkExchange
from exchanges.yandex_uslugi import YandexUslugiExchange

EXCHANGES = [
    KworkExchange,
    YandexUslugiExchange,
]
