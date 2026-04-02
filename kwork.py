from typing import List
import aiohttp
from db import Order
from exchanges.base import BaseExchange


class KworkExchange(BaseExchange):
    """
    Парсер Kwork. Пока заглушка — возвращает пустой список.
    Реализовать: запросы к API/страницам Kwork с куками из KWORK_COOKIES.
    """

    async def fetch_orders(self, session: aiohttp.ClientSession) -> List[Order]:
        # TODO: реализовать реальный парсинг Kwork
        return []
