


import Head from "next/head";
import { useState, useRef, useEffect } from "react";

const BOT_AVATAR = "https://api.dicebear.com/7.x/bottts/svg?seed=medbot";
const USER_AVATAR = "https://api.dicebear.com/7.x/personas/svg?seed=user";
const LOGO = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png"; // Medical logo
const APP_NAME = "MedAI News";


export default function Home() {
  // Mensajes y estado
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("medai_chat");
      if (saved) return JSON.parse(saved);
    }
    return [
      { role: "bot", content: "¡Hola! Soy tu agente de noticias médicas. Pregúntame sobre cualquier tema de investigación médica o tecnología aplicada a la medicina." }
    ];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Guardar historial en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("medai_chat", JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dark mode automático
  useEffect(() => {
    if (typeof window !== "undefined") {
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", dark);
    }
  }, []);

  // Enviar mensaje
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    setTyping(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const endpoint = apiUrl ? `${apiUrl}/analyze` : "/api/analyze";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        for (const article of data.results) {
          setMessages((msgs) => [
            ...msgs,
            {
              role: "bot",
              content: `**${article.title}**\n${article.summary || article.description || ""}\n[Leer más](${article.url})`
            }
          ]);
        }
      } else {
        setMessages((msgs) => [
          ...msgs,
          { role: "bot", content: "No encontré resultados para ese tema." }
        ]);
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "bot", content: "Ocurrió un error al consultar las noticias." }
      ]);
    }
    setLoading(false);
    setTyping(false);
  };

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center bg-gradient-to-br from-[#00c6fb] via-[#f9f9f9] to-[#f9d423] dark:from-[#0a2540] dark:via-[#23272f] dark:to-[#f9d423] transition-colors">
      <Head>
        <title>{APP_NAME} - Chatbot de Noticias Médicas</title>
      </Head>
      <div className="w-full max-w-md h-[80vh] flex flex-col rounded-2xl shadow-2xl bg-white/95 dark:bg-[#181c23]/95 border border-gray-200 dark:border-gray-700 mt-8 relative">
        {/* Header personalizado */}
        <div className="flex items-center gap-3 justify-center py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#00c6fb] to-[#f9d423] dark:from-[#0a2540] dark:to-[#f9d423] rounded-t-2xl shadow-sm">
          <img src={LOGO} alt="Logo" className="w-9 h-9 rounded-full shadow border-2 border-white dark:border-[#23272f] bg-white" />
          <span className="text-xl font-extrabold text-gray-800 dark:text-yellow-200 tracking-tight drop-shadow">{APP_NAME}</span>
        </div>
        {/* Chat body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gradient-to-b from-white/90 to-[#f9f9f9] dark:from-[#23272f]/90 dark:to-[#181c23] transition-all">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <img src={BOT_AVATAR} alt="Bot" className="w-7 h-7 rounded-full border border-gray-200 dark:border-yellow-300 shadow" />
              )}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-xl shadow-md whitespace-pre-line text-base leading-relaxed transition-all duration-200
                  ${msg.role === "user"
                    ? "bg-[#00c6fb] text-white rounded-br-2xl border border-blue-200 dark:bg-[#1e90ff] dark:border-blue-400"
                    : "bg-[#f9d423]/80 text-gray-900 rounded-bl-2xl border border-yellow-100 dark:bg-yellow-300/80 dark:text-[#23272f] dark:border-yellow-400"}
                `}
                style={{ wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}
              />
              {msg.role === "user" && (
                <img src={USER_AVATAR} alt="Tú" className="w-7 h-7 rounded-full border border-blue-200 dark:border-blue-400 shadow" />
              )}
            </div>
          ))}
          {/* Animación escribiendo... */}
          {typing && (
            <div className="flex items-end gap-2 animate-fade-in">
              <img src={BOT_AVATAR} alt="Bot" className="w-7 h-7 rounded-full border border-gray-200 dark:border-yellow-300 shadow" />
              <div className="max-w-[75%] px-4 py-2 rounded-xl shadow-md bg-[#f9d423]/80 text-gray-900 border border-yellow-100 dark:bg-yellow-300/80 dark:text-[#23272f] dark:border-yellow-400">
                <span className="typing-dots">
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                  <span className="dot">.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {/* Input area fixed at bottom */}
        <form onSubmit={handleSend} className="absolute bottom-0 left-0 w-full flex items-center gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23272f] rounded-b-2xl">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00c6fb] text-base shadow-sm bg-white dark:bg-[#181c23] dark:text-yellow-100"
            placeholder="Escribe tu pregunta sobre medicina..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-[#00c6fb] to-[#f9d423] text-white px-5 py-2 rounded-full font-semibold shadow-lg hover:from-[#00b5e2] hover:to-[#f7c948] transition disabled:opacity-50 dark:from-[#1e90ff] dark:to-[#f9d423]"
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16m0 0l-6-6m6 6l-6 6" />
              </svg>
            )}
          </button>
        </form>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">Desarrollado con Next.js, Tailwind y OpenAI</div>
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s;
        }
        /* Animación escribiendo... */
        .typing-dots {
          display: inline-block;
        }
        .typing-dots .dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 1px;
          background: #f9d423;
          border-radius: 50%;
          animation: blink 1.2s infinite both;
        }
        .typing-dots .dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots .dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        /* Dark mode */
        .dark {
          color-scheme: dark;
        }
      `}</style>
    </div>
  );
}
