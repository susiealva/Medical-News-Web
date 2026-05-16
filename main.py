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
    "Eres un asistente especializado exclusivamente en noticias médicas, investigación biomédica y tecnología sanitaria.\n\n"

    "## PIPELINE OBLIGATORIO (SEGUIR EN ORDEN)\n\n"
    "ANTES de responder cualquier cosa, debes ejecutar estos pasos internamente:\n\n"

    "1. CLASIFICACIÓN DEL CONTENIDO\n"
    "Determina si el contenido pertenece al dominio médico.\n"
    "Etiquetas posibles:\n"
    "- MEDICO → relacionado con medicina, salud, biomedicina, investigación clínica\n"
    "- NO_MEDICO → cualquier otro tema\n\n"

    "2. REGLA ESTRICTA\n"
    "Si el contenido es NO_MEDICO:\n"
    "NO lo resumas, NO lo adaptes, NO lo interpretes.\n\n"

    "Responde EXACTAMENTE con:\n"
    "Este contenido no pertenece al ámbito médico o sanitario, por lo que no puedo analizarlo dentro de este sistema. "
    "Este asistente está especializado exclusivamente en noticias médicas y biomédicas.\n\n"

    "3. SOLO SI ES MEDICO\n"
    "Solo en este caso puedes continuar con la respuesta.\n\n"

    "## MODO DE RESPUESTA (SOLO CONTENIDO MEDICO)\n\n"

    "(A) BRIEFING (por defecto):\n"
    "- 1 a 3 párrafos\n"
    "- lenguaje claro y no técnico\n"
    "- enfoque en relevancia e impacto\n"
    "- evitar exceso de detalles técnicos\n\n"

    "(B) PROFUNDIZACIÓN (solo si el usuario lo solicita):\n"
    "- ensayos clínicos\n"
    "- mecanismos biológicos\n"
    "- datos cuantitativos\n"
    "- referencias relevantes cuando sea posible\n\n"

    "## REGLAS DE CALIDAD\n"
    "- No inventes datos\n"
    "- No conviertas contenido no médico en médico\n"
    "- Prioriza evidencia clínica sobre hipótesis\n"
    "- Distingue evidencia clínica, preclínica y especulativa\n"
    "- No des recomendaciones médicas personalizadas\n\n"

    "## OBJETIVO\n"
    "Actuar como un filtro científico biomédico estricto que elimina ruido informativo y solo conserva conocimiento médico válido."
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
    history = data.get("history", [])  # Recibe historial de mensajes


    # Filtro de clasificación médica/no médica considerando contexto
    chat_history = "\n".join([
        f"{m['role']}: {m['content']}" for m in history[-6:] if m.get("role") in ("user", "bot")
    ])
    filtro_prompt = (
        "Si la consulta depende del contexto previo, reinterpreta la intención antes de clasificar. "
        "Clasifica la siguiente consulta como MEDICA o NO_MEDICA. "
        "Responde solo MEDICA o NO_MEDICA.\n\n"
        f"Historial:\n{chat_history}\n\nPregunta:\n{query}"
    )
    query_check = llm(
        filtro_prompt,
        system="Eres un filtro experto. Solo responde MEDICA o NO_MEDICA."
    )
    if "NO_MEDICA" in query_check:
        return {
            "results": [
                {
                    "title": "Consulta no válida",
                    "url": "",
                    "description": query,
                    "summary": "Este sistema solo responde a consultas médicas o biomédicas."
                }
            ]
        }

    news = requests.get(
        "https://newsapi.org/v2/everything",
        params={"q": query, "apiKey": NEWS_API_KEY or "demo"}
    ).json()
    articles = news.get("articles", [])[:3]
    summaries = []
    if articles:
        for article in articles:
            # Construir contexto de historial para el LLM
            context_msgs = []
            for m in history[-6:]:  # Solo los últimos 6 mensajes para no saturar
                if m.get("role") in ("user", "bot"):
                    context_msgs.append({
                        "role": "user" if m["role"] == "user" else "assistant",
                        "content": m.get("content", "")
                    })
            # Añadir el mensaje actual
            context_msgs.append({"role": "user", "content": query})
            # Llamada al LLM con historial
            try:
                resp = groq_client.chat.completions.create(
                    model=MODEL_GROQ,
                    messages=[{"role": "system", "content": SYSTEM_PROMPT}] + context_msgs + [
                        {"role": "user", "content": f"Resume y evalúa la relevancia de esta noticia para profesionales médicos. Recuerda incluir el enlace de la fuente al final.\n\nTítulo: {article.get('title','')}\nDescripción: {article.get('description','')}\nEnlace: {article.get('url','')}"}
                    ],
                    temperature=0.5
                )
                summary = resp.choices[0].message.content
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
        context_msgs = []
        for m in history[-6:]:
            if m.get("role") in ("user", "bot"):
                context_msgs.append({
                    "role": "user" if m["role"] == "user" else "assistant",
                    "content": m.get("content", "")
                })
        context_msgs.append({"role": "user", "content": query})
        prompt = (
            f"No se han encontrado noticias recientes en la búsqueda. Por favor, proporciona un resumen breve y actualizado de los últimos avances conocidos en el área consultada, aunque no haya contexto nuevo. Si existe algún hito relevante de los últimos años, menciónalo.\n\nConsulta: {query}"
        )
        try:
            resp = groq_client.chat.completions.create(
                model=MODEL_GROQ,
                messages=[{"role": "system", "content": SYSTEM_PROMPT}] + context_msgs + [
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
            )
            answer = resp.choices[0].message.content
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
