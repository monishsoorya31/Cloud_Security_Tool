import requests
from django.conf import settings

def call_llm(prompt: str) -> str:
    
    response = requests.post(
        f"{settings.OLLAMA_BASE_URL}/api/generate",
        json={
            "model": settings.LLM_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,   #low for low creativity 
                "top_p": 0.9
            }
        },
        timeout=400
    )

    response.raise_for_status()
    return response.json()["response"]