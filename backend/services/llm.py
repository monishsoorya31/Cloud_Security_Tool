import requests
from django.conf import settings

def call_llm(prompt: str, temperature: float = 0.2, top_p: float = 0.9) -> str:
    
    response = requests.post(
        f"{settings.OLLAMA_BASE_URL}/api/generate",
        json={
            "model": settings.LLM_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "top_p": top_p
            }
        },
        timeout=400
    )

    response.raise_for_status()
    return response.json()["response"]