# Problemas y soluciones

Durante el desarrollo surgieron varios retos:

- **Errores de dependencias y versiones:** Al principio, intenté usar OpenAI, pero la API tenía límites y problemas de cuota. Cambié a Groq, lo que implicó adaptar el backend y ajustar los prompts.
- **Despliegue en Render y Vercel:** Hubo problemas de configuración de variables de entorno y compatibilidad de versiones. La solución fue revisar la documentación oficial y simplificar el archivo de dependencias.
- **Integración frontend-backend:** Al principio, el frontend no recibía respuestas del backend por errores en las rutas y CORS. Se solucionó revisando los endpoints y añadiendo la configuración adecuada de CORS en FastAPI.
- **Formato de las respuestas:** Conseguir que la IA respondiera siempre con la fuente y en el formato esperado requirió iterar varias veces el prompt y el system prompt.

Cada problema fue una oportunidad para aprender y mejorar la solución, asegurando que la app fuera robusta y fácil de usar para cualquier sanitario.
# Decisiones técnicas
Este enfoque supuso un reto técnico mayor, ya que implicó investigar y aprender conceptos que iban más allá de los contenidos vistos en clase. Este proceso fortaleció mi curiosidad y se convirtió en una experiencia de aprendizaje muy valiosa.
Además, el enfoque del proyecto estuvo también condicionado por la intención de construir una solución funcional utilizando herramientas gratuitas o con planes free-tier. Aunque esta aproximación puede diferir de arquitecturas más habituales en entornos empresariales, resultó especialmente útil para comprender en profundidad la comunicación entre frontend y backend, la integración de APIs externas y la gestión de servicios desplegados en distintas plataformas.

Elegí una arquitectura desacoplada (frontend y backend separados) para facilitar el mantenimiento, la escalabilidad y la posibilidad de evolucionar cada parte de forma independiente. Así, si en el futuro se quiere cambiar el modelo de IA, la fuente de noticias o el diseño web, es sencillo hacerlo sin afectar todo el sistema.

**Stack elegido:**
- **Next.js + Tailwind CSS:** Permiten crear una interfaz moderna, rápida y adaptable, ideal para que cualquier profesional sanitario pueda usar la app desde cualquier dispositivo, sin complicaciones.
- **FastAPI:** Es ligero, rápido y muy fácil de desplegar en la nube. Perfecto para exponer la lógica de negocio y conectar con servicios externos como Groq o NewsAPI.
- **Groq LLM:** Elegí Groq por su velocidad y capacidad para generar resúmenes útiles y directos, justo lo que necesita un sanitario con poco tiempo.
- **NewsAPI:** Proporciona acceso sencillo y legal a noticias médicas de calidad.

En resumen, el objetivo fue usar herramientas modernas, robustas y fáciles de mantener, siempre pensando en la experiencia del usuario sanitario y en la posibilidad de adaptar la app a nuevas necesidades.
# Uso de la IA

Para el corazón de la app utilicé Groq LLM, un modelo de lenguaje avanzado que permite resumir y analizar noticias médicas de forma automática y fiable.

**Herramientas:**
- Groq LLM para generación de resúmenes y respuestas.
- NewsAPI para obtener noticias actualizadas.

**Prompts clave:**
El prompt principal fue diseñado para pedir resúmenes breves, directos y útiles para sanitarios, siempre incluyendo la fuente y una valoración de relevancia. Ejemplo:

> Resume y evalúa la relevancia de esta noticia para profesionales médicos. Recuerda incluir el enlace de la fuente al final.\n\nTítulo: ...\nDescripción: ...\nEnlace: ...

**Iteración:**
El proceso fue muy iterativo: probé diferentes formulaciones de prompt hasta conseguir respuestas claras, sin información inventada y con el formato esperado. Ajusté el prompt para que la IA no diera consejos médicos y siempre priorizara la fuente y la brevedad. También se ajustó el system prompt para que el tono fuera profesional y útil para el día a día sanitario.
# ¿Por qué esta app?

La idea nació al ver la sobrecarga de información médica y la dificultad que tienen muchos profesionales sanitarios para filtrar lo realmente relevante en su día a día. El objetivo es ofrecer una herramienta sencilla y directa que ayude a médicos y personal de salud a estar informados, sin perder tiempo buscando o leyendo artículos extensos.

Esta app resuelve el problema de la infoxicación médica: automatiza la búsqueda, el resumen y la valoración de noticias, entregando solo lo esencial y siempre con la fuente a mano. Así, cualquier profesional puede tomar mejores decisiones y estar actualizado en minutos, no horas.

Va dirigida a médicos, enfermeros, farmacéuticos y cualquier profesional sanitario que quiera estar al día de forma rápida, fiable y sin complicaciones.

# Medical News Web – Chat para Profesionales Sanitarios

Esta app es tu asistente digital para estar al día en medicina. Simplemente escribe tu duda o tema de interés y el chatbot hará el resto:

- Busca noticias médicas recientes y relevantes.
- Resume cada noticia de forma breve y clara, siempre mostrando la fuente.
- Evalúa si la noticia es útil para el día a día sanitario.
- Si no hay noticias, el asistente responde igualmente usando IA.

## ¿Cómo funciona?

1. Escribe tu consulta en lenguaje natural (por ejemplo: “¿Novedades en vacunas personalizadas?”).
2. El sistema busca y resume las noticias más actuales.
3. Recibes respuestas directas, con enlaces a la fuente y valoración de relevancia.

## Tecnologías

- **Frontend:** Next.js + Tailwind CSS (despliegue en Vercel)
- **Backend:** FastAPI (despliegue en Render)
- **Groq LLM:** Generación de resúmenes y respuestas
- **NewsAPI:** Búsqueda de noticias médicas

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

## Uso
- Accede a la web y escribe una consulta en el chatbot.
- El agente buscará noticias, las resumirá y evaluará su relevancia usando IA.

Pensado para médicos, personal sanitario y cualquier profesional que quiera información médica fiable, rápida y con contexto.

---

¿Te gusta? ¡Úsalo, compártelo o adáptalo a tu centro! Demuestra tus habilidades en IA, chatbots y desarrollo web moderno.
