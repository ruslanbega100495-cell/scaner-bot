from abc import ABC, abstractmethod
from typing import List
import aiohttp
from db import Order


class BaseExchange(ABC):
    """
    Абстрактный базовый класс для парсеров бирж.
    Каждая биржа — отдельный файл, реализующий fetch_orders().
    Для добавления новой биржи: создать файл, добавить в список EXCHANGES в config.py.
    """

    @abstractmethod
    async def fetch_orders(self, session: aiohttp.ClientSession) -> List[Order]:
        """Возвращает список новых заказов с биржи."""
        ...
