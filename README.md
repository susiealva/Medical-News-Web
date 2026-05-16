# Medical News Web – Agente de Análisis de Noticias Médicas con RAG

Este proyecto implementa una aplicación web con un chatbot inteligente que:
- Recupera noticias recientes sobre investigación médica y tecnología aplicada a la medicina usando una API web.
- Resume cada noticia usando un modelo de lenguaje (LLM, OpenAI GPT).
- Evalúa la relevancia de cada noticia para profesionales de la medicina.
- Aplica capacidades de RAG (Retrieval-Augmented Generation) para enriquecer los resúmenes con contexto adicional.
- Visualiza y exporta los resultados, sugiriendo temas emergentes.

## Estructura del Proyecto
- **Frontend:** Next.js + Tailwind CSS (Vercel)
- **Backend:** FastAPI (Render)

## Instalación y despliegue

### Backend (FastAPI)
1. Clona el repositorio y entra a la carpeta del backend.
2. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Define las variables de entorno en Render:
   - `OPENAI_API_KEY` (tu clave de OpenAI)
   - `NEWS_API_KEY` (tu clave de NewsAPI)
4. Despliega en Render.

### Frontend (Next.js)
1. Clona el repositorio y entra a la carpeta del frontend.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env.local` con:
   ```env
   NEXT_PUBLIC_API_URL=https://<tu-backend-en-render>.onrender.com
   ```
4. Despliega en Vercel.

## Uso
- Accede a la web y escribe una consulta en el chatbot.
- El agente buscará noticias, las resumirá y evaluará su relevancia usando IA.

## Créditos
- OpenAI GPT para resúmenes y análisis.
- NewsAPI para obtención de noticias.
- FastAPI, Next.js, Tailwind CSS.

---

¡Incluye este proyecto en tu portfolio para demostrar habilidades en IA, RAG y desarrollo web moderno!
