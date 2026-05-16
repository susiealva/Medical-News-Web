from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

import requests
import os
import openai
try:
    from groq import Groq
except ImportError:
    Groq = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SYSTEM_PROMPT = (
    "Eres un asistente para profesionales sanitarios. "
    "Responde siempre de forma breve y directa. "
    "Si resumes una noticia, incluye al final una línea con el enlace a la fuente. "
    "Si no hay fuente, indícalo. "
)
# Configuración de LLMs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq").lower()  # "groq" o "openai"
MODEL_OPENAI = "gpt-3.5-turbo"
MODEL_GROQ = "llama-3-70b-8192"

NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # Optional: for newsapi.org

if LLM_PROVIDER == "groq" and Groq and GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    def llm(prompt: str, system: str = SYSTEM_PROMPT, temperature: float = 0.7) -> str:
        resp = groq_client.chat.completions.create(
            model=MODEL_GROQ,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature
        )
        return resp.choices[0].message.content
    print("✓ Cliente Groq configurado con éxito")
else:
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    def llm(prompt: str, system: str = SYSTEM_PROMPT, temperature: float = 0.7) -> str:
        resp = client.chat.completions.create(
            model=MODEL_OPENAI,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature
        )
        return resp.choices[0].message.content

@app.get("/")
def root():
    return {"message": "Medical News Agent API running!"}


@app.post("/analyze")
async def analyze_news(request: Request):
    data = await request.json()
    query = data.get("query", "medical research")
    news = requests.get(
        "https://newsapi.org/v2/everything",
        params={"q": query, "apiKey": NEWS_API_KEY or "demo"}
    ).json()
    articles = news.get("articles", [])[:3]
    summaries = []
    if articles:
        for article in articles:
            prompt = f"Resume y evalúa la relevancia de esta noticia para profesionales médicos. Recuerda incluir el enlace de la fuente al final.\n\nTítulo: {article.get('title','')}\nDescripción: {article.get('description','')}\nEnlace: {article.get('url','')}"
            try:
                summary = llm(prompt)
            except Exception as e:
                summary = f"Error al resumir: {str(e)}"
            summaries.append({
                "title": article.get("title",""),
                "url": article.get("url",""),
                "description": article.get("description",""),
                "summary": summary
            })
        return {"results": summaries}
    else:
        # Si no hay artículos, usa el LLM para responder directamente a la consulta
        try:
            answer = llm(query)
        except Exception as e:
            answer = f"Error al procesar la consulta: {str(e)}"
        return {
            "results": [
                {
                    "title": "Respuesta generada por IA",
                    "url": "",
                    "description": query,
                    "summary": answer
                }
            ]
        }
