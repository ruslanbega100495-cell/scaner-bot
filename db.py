import aiosqlite
from dataclasses import dataclass

DB_PATH = "orders.db"


@dataclass
class Order:
    title: str
    description: str
    price: str
    deadline: str
    client: str
    source: str   # "Kwork" / "Яндекс.Услуги"
    url: str      # уникальный идентификатор


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS orders (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                title       TEXT,
                description TEXT,
                price       TEXT,
                deadline    TEXT,
                client      TEXT,
                source      TEXT,
                url         TEXT UNIQUE,
                relevance   INTEGER,
                created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def order_exists(url: str) -> bool:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT 1 FROM orders WHERE url = ?", (url,)) as cursor:
            return await cursor.fetchone() is not None


async def save_order(order: Order, relevance: int):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT OR IGNORE INTO orders
                (title, description, price, deadline, client, source, url, relevance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            order.title,
            order.description,
            order.price,
            order.deadline,
            order.client,
            order.source,
            order.url,
            relevance,
        ))
        await db.commit()
