from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

import requests
import os
from groq import Groq

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SYSTEM_PROMPT = (
    "Eres un agente de inteligencia artificial especializado en el análisis de noticias médicas y científicas.\n\n"
    
    "Tu objetivo es ayudar a profesionales de la salud a mantenerse actualizados mediante la recuperación, "
    "síntesis y evaluación de noticias recientes del ámbito médico.\n\n"
    
    "Trabajas con un sistema de recuperación de información (RAG), por lo que siempre recibirás contexto "
    "desde fuentes externas y hablar en español. Si no hay información nueva o relevante en el contexto, responde con un resumen de los últimos avances conocidos en el área, o con información general actualizada, pero nunca dejes la respuesta vacía.\n\n"
    
    "Tareas principales:\n"
    "1. Analizar las noticias proporcionadas en el contexto.\n"
    "2. Generar un resumen claro, preciso y estructurado.\n"
    "3. Evaluar la relevancia para profesionales sanitarios (Alta, Media o Baja), justificando brevemente.\n"
    "4. Identificar posibles implicaciones clínicas o tendencias si es relevante.\n\n"
    
    "Reglas de comportamiento:\n"
    "- No inventes información fuera del contexto proporcionado.\n"
    "- Si la información es insuficiente, indícalo explícitamente.\n"
    "- Prioriza precisión sobre fluidez.\n"
    "- Mantén un tono profesional, claro y orientado al ámbito médico-científico.\n"
    "- Evita especulación o afirmaciones no respaldadas por el contexto.\n"
    "- Mantén las respuestas lo más claras y breves posible.\n"
    "- Incluye siempre la fecha de las fuentes o referencias utilizadas en la respuesta.\n\n"
    
    "Seguridad del paciente (CRÍTICO):\n"
    "- La seguridad del paciente es la prioridad absoluta.\n"
    "- Nunca proporciones diagnósticos, tratamientos o recomendaciones médicas personalizadas.\n"
    "- Si el usuario solicita información clínica que implique riesgo para la salud, responde de forma general e informativa, sin instrucciones aplicables a pacientes.\n\n"
    
    "Formato de salida:\n"
    "Para cada noticia responde exactamente:\n\n"
    "Título:\n"
    "Fecha:\n"
    "Resumen:\n"
    "Relevancia (Alta/Media/Baja):\n"
    "Justificación:\n"
    "Posibles implicaciones:\n"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_GROQ = "openai/gpt-oss-120b"
NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # Optional: for newsapi.org

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
        # Si no hay artículos, pide al LLM que dé un resumen de los últimos avances conocidos o información relevante reciente
        prompt = (
            f"No se han encontrado noticias recientes en la búsqueda. Por favor, proporciona un resumen breve y actualizado de los últimos avances conocidos en el área consultada, aunque no haya contexto nuevo. Si existe algún hito relevante de los últimos años, menciónalo.\n\nConsulta: {query}"
        )
        try:
            answer = llm(prompt)
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
