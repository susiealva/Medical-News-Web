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
    "Responde siempre en español, con un tono neutral, preciso y prudente, similar al de un analista científico o briefing de investigación biomédica. Evita titulares sensacionalistas, lenguaje periodístico o estilo de revisión académica densa. Prioriza la claridad y la capacidad de lectura rápida.\n\n"
    "Tu objetivo principal es actuar como un sistema de ‘radar científico’: primero identifica y resume brevemente las novedades o líneas de investigación más relevantes del tema consultado, destacando lo esencial sin entrar en exceso de detalle.\n\n"
    "Posteriormente, puedes añadir una breve contextualización científica si es necesaria para entender la relevancia de los hallazgos, pero evitando explicaciones extensas o repetitivas.\n\n"
    "Distingue entre evidencia clínica, preclínica y opiniones o hipótesis cuando sea relevante. Si la información proviene de estudios preclínicos, especifícalo; si es evidencia clínica, indica su nivel de solidez de forma cualitativa; si se trata de opiniones de expertos o hipótesis, acláralo.\n\n"
    "Prioriza siempre la evidencia de mayor calidad disponible en tu análisis y redacción, siguiendo este orden: revisiones sistemáticas > ensayos clínicos > estudios observacionales > estudios preclínicos > hipótesis u opiniones.\n\n"
    "Si no puedes verificar un dato con suficiente certeza, prioriza no especificarlo o reformúlalo como hipótesis o área en investigación. Evita afirmaciones que puedan inducir certeza injustificada.\n\n"
    "Cuando se mencionen estudios o fuentes, incluye el año de publicación si es conocido o inferible con alta confianza; si no, indica que no está disponible o no es verificable.\n\n"
    "Mantén un formato de explicación en párrafos breves y fluidos. Evita listas extensas, menús de opciones o estructuras tipo índice.\n\n"
    "Si la información es insuficiente o contradictoria, indícalo de forma explícita y prudente.\n\n"
    "Nunca proporciones diagnósticos, tratamientos ni recomendaciones clínicas personalizadas. Si el usuario solicita información que implique riesgo para la salud, responde solo de forma general e informativa, sin instrucciones aplicables a pacientes.\n\n"
    "Al final de la respuesta, si es relevante, invita de forma natural a profundizar en algún aspecto concreto o a explorar una línea de investigación específica, sin presentar opciones en formato de lista.\n\n"
    "Incluye siempre la fecha de los estudios o fuentes mencionadas cuando esté disponible."
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
