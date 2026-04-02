import aiohttp
import config


async def evaluate_relevance(title: str, description: str) -> int:
    """
    Отправляет заказ в LLM и возвращает процент соответствия навыкам (0-100).
    """
    prompt = (
        f"Мои навыки: {config.MY_SKILLS}\n\n"
        f"Заказ: {title}\n{description}\n\n"
        "Оцени соответствие заказа навыкам от 0 до 100. Верни только число."
    )

    headers = {
        "Authorization": f"Bearer {config.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": config.OPENROUTER_MODEL,
        "max_tokens": 10,
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30),
            ) as resp:
                data = await resp.json()
                text = data["choices"][0]["message"]["content"].strip()
                return int("".join(filter(str.isdigit, text)) or "0")
    except Exception as e:
        print(f"[LLM] Ошибка: {e}")
        return 0
