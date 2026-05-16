# Informe de Desarrollo – Agente de Análisis de Noticias Médicas con RAG

## Idea original
La idea surgió al identificar la sobrecarga de información médica y la dificultad de los profesionales para filtrar noticias relevantes. El objetivo es crear un asistente web que recupere, resuma y evalúe noticias médicas recientes, facilitando la actualización profesional y la detección de tendencias emergentes.

## Uso de la IA
Se utilizó Groq LLM para resumir y analizar la relevancia de las noticias. Los prompts clave fueron iterados para obtener resúmenes útiles y evaluaciones contextuales. El proceso incluyó pruebas con diferentes formulaciones de prompt y ajustes en la lógica de recuperación y presentación de resultados.

## Decisiones técnicas
Se eligió un stack moderno: Next.js + Tailwind CSS para el frontend (por su rapidez de desarrollo y despliegue en Vercel) y FastAPI para el backend (por su sencillez y rendimiento, desplegado en Render). Se integró NewsAPI para la obtención de noticias y Groq para el procesamiento de lenguaje natural. La arquitectura desacoplada permite escalar y modificar componentes fácilmente.

## Problemas y soluciones
- **Errores de build en Vercel:** Se resolvieron actualizando dependencias y corrigiendo la estructura del componente principal.
- **Compatibilidad con la API de Groq:** Se actualizó el código backend para usar la sintaxis moderna de Groq.
- **Variables de entorno y CORS:** Se configuraron correctamente en Render y Vercel para permitir la comunicación frontend-backend.
- **Resultados vacíos:** Se mejoró el manejo de errores y la simulación de respuestas para pruebas.

## Capturas de pantalla
1. Chatbot funcionando en la web mostrando resúmenes de noticias médicas.
2. Panel de administración de Render con logs del backend.
3. Código fuente del frontend en Next.js mostrando la integración con la API.

---

_Enlace a la app desplegada:_ [https://medical-news-web-nu.vercel.app/](https://medical-news-web-nu.vercel.app/)

_Enlace al repositorio:_ [https://github.com/susiealva/Medical-News-Web](https://github.com/susiealva/Medical-News-Web)
