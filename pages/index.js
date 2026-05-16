import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

// Estilo para agregar espacio después de cada párrafo
const markdownComponents = {
  p: ({ children }) => (
    <p style={{ marginBottom: "1.2em" }}>{children}</p>
  ),
};
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

const APP_NAME = "MedAI Chat";

function isSafeHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function renderMessageContent(message) {
  if (message.role === "bot" && message.article) {
    const { title, summary, url } = message.article;
    return (
      <div className="space-y-2">
        {title ? <div className="font-bold">{title}</div> : null}
        {summary ? (
          <div className="prose prose-blue max-w-none">
            <ReactMarkdown components={markdownComponents}>{summary}</ReactMarkdown>
          </div>
        ) : null}
        {isSafeHttpUrl(url) ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-blue-700 hover:text-blue-900 underline"
          >
            Leer más
          </a>
        ) : null}
      </div>
    );
  }
  return (
    <span className="whitespace-pre-line prose prose-blue max-w-none">
      <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
    </span>
  );
}

export default function Home() {
  const promptSuggestions = [
    "¿Qué avances recientes hay en vacunas personalizadas?",
    "Resúmeme noticias sobre inteligencia artificial en medicina.",
    "¿Qué tendencias emergen en terapias genéticas?",
    "¿Qué impacto tiene la telemedicina en la atención médica?",
  ];

  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "👋 ¡Bienvenido al Agente de Análisis de Noticias Médicas!\n\nPuedo buscar, resumir y evaluar noticias recientes sobre investigación médica y tecnología aplicada a la salud. También te ayudo a identificar tendencias y temas emergentes.\n\nSelecciona una sugerencia o escribe tu consulta para comenzar:",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e, customInput) => {
    if (e) e.preventDefault();
    const trimmedInput = (customInput !== undefined ? customInput : input).trim();
    if (!trimmedInput || loading) return;

    const userMsg = { role: "user", content: trimmedInput };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint = apiUrl ? `${apiUrl}/analyze` : "/api/analyze";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedInput }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();

      if (data.results && data.results.length > 0) {
        setMessages((msgs) => [
          ...msgs,
          ...data.results.map((article) => ({
            role: "bot",
            article,
            content: article.summary || "",
          })),
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          {
            role: "bot",
            content: data.message || "No se encontraron resultados.",
          },
        ]);
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        {
          role: "bot",
          content: `Ocurrió un error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>{APP_NAME} - UI</title>
      </Head>
      {/* Fondo degradado moderno */}
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-100 to-white flex items-center justify-center py-8 px-2">
        <div className="w-full max-w-7xl h-[80vh] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 flex flex-row overflow-hidden" style={{ maxHeight: "92vh" }}>
          {/* Sidebar/header a la izquierda */}
          <div className="flex flex-col items-center gap-6 w-72 min-w-[220px] bg-gradient-to-b from-blue-700 to-indigo-600 p-8 text-white">
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 border-2 border-white shadow-lg">
              <ChatBubbleLeftRightIcon className="w-10 h-10 text-white drop-shadow" />
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight drop-shadow text-center">{APP_NAME}</h2>
            {/* Sugerencias de prompts (solo si es el primer mensaje) */}
            {messages.length === 1 && (
              <div className="flex flex-col gap-2 w-full mt-8">
                {promptSuggestions.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium shadow transition text-left"
                    onClick={() => handleSend(null, prompt)}
                    disabled={loading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Chat principal a la derecha */}
          <div className="flex flex-col flex-1 h-full">
            <ul className="flex-1 overflow-y-auto px-16 py-12 space-y-8 bg-gradient-to-b from-white/80 to-blue-50" style={{ minHeight: "480px" }}>
              {messages.map((msg, idx) => (
                <li key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                  {msg.role === "bot" ? (
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white">
                      <ChatBubbleLeftRightIcon className="w-6 h-6" />
                    </span>
                  ) : (
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 shadow border-2 border-white">
                      <UserCircleIcon className="w-7 h-7" />
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] px-7 py-4 rounded-2xl text-lg font-medium shadow-md transition-all duration-200 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-br-3xl"
                        : "bg-white/90 text-gray-900 rounded-bl-3xl border border-blue-100"
                    }`}
                    style={{ wordBreak: "break-word" }}
                  >
                    {renderMessageContent(msg)}
                  </div>
                </li>
              ))}
              {loading && (
                <li className="flex justify-start items-end gap-2 animate-pulse">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </span>
                  <div className="px-5 py-3 rounded-2xl bg-white/90 text-gray-900 border border-blue-100 font-medium shadow-md">
                    <span>Investigando...</span>
                  </div>
                </li>
              )}
              <div ref={chatEndRef} />
            </ul>
            <form
              onSubmit={handleSend}
              className="flex items-center gap-4 px-16 py-8 border-t border-gray-100 bg-white/80"
            >
              <textarea
                className="flex-1 resize-none border border-blue-200 rounded-full outline-none bg-blue-50 text-lg text-gray-900 placeholder-gray-400 py-4 px-7 min-h-[56px] max-h-40 focus:ring-2 focus:ring-blue-300"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                disabled={loading}
                required
                spellCheck={false}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
              <button
                type="submit"
                className="p-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-600 text-white disabled:opacity-50 shadow-lg transition"
                disabled={loading || !input.trim()}
                aria-label="Enviar"
              >
                <PaperAirplaneIcon className="w-8 h-8" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
