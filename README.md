
# Deep Dive on LLMs e IA Generativa

## Medical News Web – Chat para Profesionales Sanitarios
**MDA25 | IA Generativa Deep Dive LLMs**  
**MDA2510A | Profesor: Jorge Alcantara**

**Autora: Susana Alvarez**  

---

## ¿Por qué esta app?
La idea nació al ver la sobrecarga de información médica y la dificultad que tienen muchos profesionales sanitarios para filtrar lo realmente relevante en su día a día.

El objetivo es ofrecer una herramienta sencilla y directa que ayude a médicos y personal de salud a estar informados, sin perder tiempo buscando o leyendo artículos extensos.

Esta app resuelve el problema de la infoxicación médica: automatiza la búsqueda, el resumen y la valoración de noticias, entregando solo lo esencial y siempre con la fuente a mano. Así, cualquier profesional puede tomar mejores decisiones y estar actualizado en minutos, no horas.

Va dirigida a médicos, enfermeros, farmacéuticos y cualquier profesional sanitario que quiera estar al día de forma rápida, fiable y sin complicaciones.

---

## ¿Qué se pedía realizar?
- Chatbot web para profesionales sanitarios.
- Integración de LLM (Groq) para resumen y análisis de noticias médicas.
- Uso de NewsAPI para obtener noticias actualizadas.
- Prompts y system prompt diseñados para rigor científico, brevedad y siempre incluir fuente.
- Filtro de dominio médico y memoria conversacional.
- UI moderna, modo oscuro, despliegue en Vercel/Render.

---

## Uso de la IA y Deep Dive LLMs
Para el corazón de la app utilicé Groq LLM, un modelo de lenguaje avanzado que permite resumir y analizar noticias médicas de forma automática y fiable.

### Herramientas:
- **Groq LLM** para generación de resúmenes y respuestas.
- **NewsAPI** para obtener noticias actualizadas.

### Prompts clave:
El prompt principal fue diseñado para pedir resúmenes breves, directos y útiles para sanitarios, siempre incluyendo la fuente y una valoración de relevancia. Ejemplo:

> Resume y evalúa la relevancia de esta noticia para profesionales médicos. Recuerda incluir el enlace de la fuente al final.\n\nTítulo: ...\nDescripción: ...\nEnlace: ...

### Iteración y prompt engineering:
El proceso fue muy iterativo: probé diferentes formulaciones de prompt hasta conseguir respuestas claras, sin información inventada y con el formato esperado. Ajusté el prompt para que la IA no diera consejos médicos y siempre priorizara la fuente y la brevedad. También se ajustó el system prompt para que el tono fuera profesional y útil para el día a día sanitario.

### Enfoque RAG (Retrieval-Augmented Generation):
El sistema implementa un enfoque RAG:
- **Retrieval:** NewsAPI obtiene noticias médicas relevantes.
- **Contexto:** se envían título, descripción y enlace al modelo.
- **Generation:** Groq genera resumen y evaluación basada únicamente en ese contexto.
Esto reduce alucinaciones y mejora la fiabilidad, manteniendo el foco en resultados relevantes para el sector sanitario.

---

## Decisiones técnicas y arquitectura
El reto fue construir una solución funcional usando herramientas gratuitas o free-tier, lo que ayudó a comprender en profundidad la comunicación frontend-backend, integración de APIs externas y despliegue en distintas plataformas.

Elegí una arquitectura desacoplada (frontend y backend separados) para facilitar el mantenimiento, la escalabilidad y la posibilidad de evolucionar cada parte de forma independiente.

### Stack elegido:
- **Frontend:** Next.js + Tailwind CSS (despliegue en Vercel)
- **Backend:** FastAPI (despliegue en Render)
- **Groq LLM:** Generación de resúmenes y respuestas
- **NewsAPI:** Búsqueda de noticias médicas

---

## Instalación y despliegue

### Backend (FastAPI)
1. Clona el repositorio y entra a la carpeta del backend.
2. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Configura variables de entorno en Render:
   - `GROQ_API_KEY` (tu clave de Groq)
   - `NEWS_API_KEY` (tu clave de NewsAPI)
4. Despliega en Render.

### Frontend (Next.js)
1. Clona el repositorio y entra a la carpeta del frontend.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea `.env.local` con:
   ```env
   NEXT_PUBLIC_API_URL=https://<tu-backend-en-render>.onrender.com
   ```
4. Despliega en Vercel.

---

## Uso
- Accede a la web https://medical-news-web-nu.vercel.app/ y escribe una consulta en el chatbot.
- El agente buscará noticias, las resumirá y evaluará su relevancia usando IA.

Pensado para médicos, personal sanitario y cualquier profesional que quiera información médica fiable, rápida y con contexto.

---

## Problemas y soluciones
Durante el desarrollo surgieron varios retos:
- **Errores de dependencias y versiones:** Al principio, intenté usar OpenAI, pero la API tenía límites y problemas de cuota. Cambié a Groq, lo que implicó adaptar el backend y ajustar los prompts.
- **Despliegue en Render y Vercel:** Hubo problemas de configuración de variables de entorno y compatibilidad de versiones. La solución fue revisar la documentación oficial y simplificar el archivo de dependencias.
- **Integración frontend-backend:** Al principio, el frontend no recibía respuestas del backend por errores en las rutas y CORS. Se solucionó revisando los endpoints y añadiendo la configuración adecuada de CORS en FastAPI.
- **Formato de las respuestas:** Conseguir que la IA respondiera siempre con la fuente y en el formato esperado requirió iterar varias veces el prompt y el system prompt.

Cada problema fue una oportunidad para aprender y mejorar la solución, asegurando que la app fuera robusta y fácil de usar para cualquier sanitario.

---

## Repositorio
El proyecto desarrollado se puede encontrar en https://github.com/susiealva/Medical-News-Web
