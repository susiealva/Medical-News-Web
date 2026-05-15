


import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

const APP_NAME = "Chatbot";


  const [messages, setMessages] = useState([
    { role: "bot", content: "¡Hola! ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
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
  };

  return (
    <>
      <Head>
        <title>{APP_NAME} - UI</title>
      </Head>
      {/* Chatbot box centrado */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10">
        <div className="w-[370px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col" style={{minHeight:'520px', maxHeight:'80vh'}}>
          {/* Header */}
          <div className="flex items-center justify-center px-6 py-4 bg-blue-600 rounded-t-2xl">
            <h2 className="text-white text-lg font-semibold tracking-tight">{APP_NAME}</h2>
          </div>
          {/* Chat body */}
          <ul className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#f6f6f6]" style={{minHeight:'320px'}}>
            {messages.map((msg, idx) => (
              <li key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                {msg.role === 'bot' && (
                  <span className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white mr-2"><ChatBubbleLeftRightIcon className="w-5 h-5" /></span>
                )}
                <p className={`max-w-[75%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-2xl' : 'bg-[#f2f2f2] text-gray-900 rounded-bl-2xl'}`} style={{wordBreak:'break-word'}} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
              </li>
            ))}
            <div ref={chatEndRef} />
          </ul>
          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-gray-200 bg-white rounded-b-2xl">
            <textarea
              className="flex-1 resize-none border-none outline-none bg-transparent text-base text-gray-900 placeholder-gray-400 py-2 px-0 min-h-[36px] max-h-32"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={1}
              disabled={loading}
              required
              spellCheck={false}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button type="submit" className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition" disabled={loading || !input.trim()} aria-label="Enviar">
              <PaperAirplaneIcon className="w-6 h-6 rotate-90" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center bg-[#ececec] dark:bg-[#181c23] transition-colors">
      <Head>
        <title>{APP_NAME} - Chatbot de Noticias Médicas</title>
      </Head>
      <div className="w-full max-w-md h-[80vh] flex flex-col rounded-lg shadow bg-[#f7f7f7] dark:bg-[#23272f] border border-gray-200 dark:border-gray-700 mt-8 relative">
        {/* Header plano tipo app */}
        <div className="flex items-center justify-center py-3 bg-[#3b82f6] dark:bg-[#1e293b] rounded-t-lg">
          <span className="text-lg font-semibold text-white tracking-tight">{APP_NAME}</span>
        </div>
        {/* Chat body plano */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-[#f7f7f7] dark:bg-[#23272f] transition-all">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <img src={BOT_AVATAR} alt="Bot" className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white" />
              )}
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl whitespace-pre-line text-base leading-relaxed transition-all duration-200
                  ${msg.role === "user"
                    ? "bg-white text-[#1e3a5c] rounded-br-2xl border border-blue-100 dark:bg-[#1e90ff]/10 dark:text-blue-200 dark:border-blue-900"
                    : "bg-[#e3e3e3] text-gray-800 rounded-bl-2xl border border-gray-200 dark:bg-[#23272f] dark:text-gray-100 dark:border-gray-700"}
                `}
                style={{ wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}
              />
              {msg.role === "user" && (
                <img src={USER_AVATAR} alt="Tú" className="w-6 h-6 rounded-full border border-blue-100 dark:border-blue-900 bg-white" />
              )}
            </div>
          ))}
          {/* Animación escribiendo... */}
          {typing && (
            <div className="flex items-end gap-2 animate-fade-in">
              <img src={BOT_AVATAR} alt="Bot" className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white" />
              <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-[#e3e3e3] text-gray-800 border border-gray-200 dark:bg-[#23272f] dark:text-gray-100 dark:border-gray-700">
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
        <form onSubmit={handleSend} className="absolute bottom-0 left-0 w-full flex items-center gap-2 px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-[#ececec] dark:bg-[#23272f] rounded-b-lg">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-base bg-white dark:bg-[#181c23] dark:text-gray-100"
            placeholder="Escribe tu pregunta sobre medicina..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-full font-semibold transition disabled:opacity-50"
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
          background: #3b82f6;
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

