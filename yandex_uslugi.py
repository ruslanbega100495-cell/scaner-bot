from typing import List
import aiohttp
from db import Order
from exchanges.base import BaseExchange


class YandexUslugiExchange(BaseExchange):
    """
    Парсер Яндекс.Услуги. Пока заглушка — возвращает пустой список.
    Реализовать: запросы к API/страницам Яндекс.Услуги с куками из YANDEX_COOKIES.
    """

    async def fetch_orders(self, session: aiohttp.ClientSession) -> List[Order]:
        # TODO: реализовать реальный парсинг Яндекс.Услуги
        return []
