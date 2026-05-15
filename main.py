from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

import requests
import os
import openai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEWS_API_KEY = os.getenv("NEWS_API_KEY")  # Optional: for newsapi.org

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
    for article in articles:
        prompt = f"Resume y evalúa la relevancia de esta noticia para profesionales médicos:\n\n{article.get('title','')}\n{article.get('description','')}"
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                api_key=OPENAI_API_KEY
            )
            summary = response.choices[0].message.content
        except Exception as e:
            summary = f"Error al resumir: {str(e)}"
        summaries.append({
            "title": article.get("title",""),
            "url": article.get("url",""),
            "description": article.get("description",""),
            "summary": summary
        })
    return {"results": summaries}
