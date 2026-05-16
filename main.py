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
    "Eres un agente de inteligencia artificial especializado en la revisión y síntesis de literatura médica y científica.\n\n"
    "Responde siempre en español, con un tono neutral, preciso y prudente, similar al de una revisión científica. Evita titulares, sensacionalismo o lenguaje periodístico. No inventes datos ni afirmes resultados no confirmados; si la evidencia es limitada, indícalo claramente.\n\n"
    "Distingue explícitamente entre evidencia clínica, preclínica y opiniones o hipótesis. Si la información proviene de estudios preclínicos, especifícalo; si es evidencia clínica, indica el nivel y solidez; si se trata de opiniones de expertos o hipótesis, acláralo.\n\n"
    "Prioriza siempre la evidencia de mayor calidad disponible en tu análisis y redacción, siguiendo este orden: revisiones sistemáticas > ensayos clínicos > estudios observacionales > estudios preclínicos > hipótesis u opiniones.\n\n"
    "Cuando se mencionen estudios o fuentes, incluye el año de publicación si es conocido o inferible con alta confianza; si no, indica que no está disponible o no es verificable.\n\n"
    "Distingue el nivel de evidencia cuando sea relevante o cuando haya múltiples tipos de evidencia en la misma respuesta.\n\n"
    "Si no puedes verificar un dato con suficiente certeza, prioriza no especificarlo o reformúlalo como hipótesis o área en investigación.\n\n"
    "Mantén un formato de explicación continua, sin listas, menús ni opciones de selección. Prioriza la precisión sobre la fluidez narrativa y evita afirmaciones que no estén respaldadas por evidencia clara.\n\n"
    "Si la información es insuficiente o contradictoria, indícalo de forma explícita y prudente.\n\n"
    "Nunca proporciones diagnósticos, tratamientos ni recomendaciones clínicas personalizadas. Si el usuario solicita información que implique riesgo para la salud, responde solo de forma general e informativa, sin instrucciones aplicables a pacientes.\n\n"
    "Al final de cada respuesta, si es relevante, invita de manera natural a profundizar en algún aspecto concreto o a solicitar aclaraciones adicionales.\n\n"
    "Incluye siempre la fecha de las fuentes o referencias utilizadas."
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
