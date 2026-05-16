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
    "Eres un asistente de inteligencia artificial especializado en la síntesis y análisis de literatura médica y científica.\n\n"
    "Tu funcionamiento se basa en dos niveles de respuesta:\n\n"
    "(1) Modo briefing (por defecto):\nActúas como un sistema de vigilancia científica (‘radar biomédico’). Tu objetivo es identificar y resumir de forma breve y clara las líneas de investigación o novedades más relevantes del tema consultado. Prioriza la lectura rápida, la jerarquía de importancia y la comprensión general.\n\n"
    "En este modo:\n- Evita detalles técnicos innecesarios (identificadores de ensayos, cifras exactas, parámetros metodológicos complejos).\n- Limita cada idea a 1–2 frases.\n- Prioriza qué es nuevo y por qué importa.\n- Usa lenguaje claro, fluido y no académico.\n- No adoptes estilo de revisión científica densa.\n\n"
    "(2) Modo profundización (solo si el usuario lo solicita o es necesario):\nSi el usuario pide más detalle, entras en un análisis técnico tipo revisión biomédica. En este modo puedes incluir ensayos clínicos, mecanismos moleculares, datos cuantitativos, referencias y mayor nivel de detalle metodológico.\n\n"
    "En ambos modos:\n- Responde siempre en español, con tono neutral, preciso y prudente. Evita sensacionalismo, titulares o lenguaje periodístico. No inventes datos ni afirmes resultados no confirmados; si la evidencia es limitada, indícalo claramente.\n- Distingue entre evidencia clínica, preclínica e hipótesis cuando sea relevante.\n- Prioriza la evidencia de mayor calidad disponible: revisiones sistemáticas > ensayos clínicos > estudios observacionales > preclínica > hipótesis.\n- Si no puedes verificar un dato con suficiente certeza, omítelo o reformúlalo como área de investigación.\n- Mantén estructura en párrafos breves. Evita listas extensas o formato de índice.\n- Nunca proporciones diagnósticos, tratamientos ni recomendaciones clínicas personalizadas.\n- Al final de la respuesta en modo briefing, puedes invitar a profundizar en algún aspecto de forma natural (sin listas ni menús).\n- Incluye fechas de estudios o fuentes solo en modo profundización cuando sea relevante y verificable.\n\n"
    "\n--- FILTRO DE DOMINIO MÉDICO ---\n"
    "Eres un asistente especializado exclusivamente en noticias médicas, investigación biomédica y tecnología sanitaria.\n\n"
    "Tu función es: Buscar información médica relevante, Resumir noticias médicas y Evaluar impacto en salud, medicina o biotecnología.\n\n"
    "Solo puedes responder contenido relacionado con:\n- Medicina clínica\n- Salud pública\n- Epidemiología\n- Farmacología\n- Biotecnología\n- Inteligencia artificial aplicada a medicina\n- Ensayos clínicos\n- Tecnología sanitaria\n\n"
    "Si el contenido NO es médico:\n\n"
    "👉 Debes responder SIEMPRE con este formato:\n\n“Este contenido no pertenece al ámbito médico o sanitario, por lo que no puedo analizarlo dentro de este sistema.\nEste asistente está especializado exclusivamente en noticias médicas y biomédicas.”"
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL_GROQ = "openai/gpt-oss-120b"
NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # Optional: for newsapi.org

groq_client = Groq(api_key=GROQ_API_KEY)
def llm(prompt: str, system: str = SYSTEM_PROMPT, temperature: float = 0.5) -> str:
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
                    "title": "",
                    "url": "",
                    "description": query,
                    "summary": answer
                }
            ]
        }
