



import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, UserCircleIcon } from "@heroicons/react/24/solid";

const APP_NAME = "MedAI Chat";


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
      {/* Fondo degradado moderno */}
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-100 to-white flex items-center justify-center py-8 px-2">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{minHeight:'600px', maxHeight:'90vh'}}>
          {/* Header elegante */}
          <div className="flex items-center gap-3 px-8 py-6 bg-gradient-to-r from-blue-700 to-indigo-600 rounded-t-3xl shadow-md">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border-2 border-white shadow-lg">
              <ChatBubbleLeftRightIcon className="w-7 h-7 text-white drop-shadow" />
            </span>
            <h2 className="text-white text-2xl font-extrabold tracking-tight drop-shadow">{APP_NAME}</h2>
          </div>
          {/* Chat body */}
          <ul className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-white/80 to-blue-50" style={{minHeight:'340px'}}>
            {messages.map((msg, idx) => (
              <li key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {msg.role === 'bot' ? (
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-lg border-2 border-white">
                    <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-200 text-indigo-700 shadow border-2 border-white">
                    <UserCircleIcon className="w-7 h-7" />
                  </span>
                )}
                <p className={`max-w-[70%] px-5 py-3 rounded-2xl text-base whitespace-pre-line font-medium shadow-md transition-all duration-200 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-3xl' : 'bg-white/90 text-gray-900 rounded-bl-3xl border border-blue-100'}`} style={{wordBreak:'break-word'}} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
              </li>
            ))}
            <div ref={chatEndRef} />
          </ul>
          {/* Input moderno */}
          <form onSubmit={handleSend} className="flex items-center gap-3 px-6 py-5 border-t border-gray-100 bg-white/80 rounded-b-3xl">
            <textarea
              className="flex-1 resize-none border border-blue-200 rounded-full outline-none bg-blue-50 text-base text-gray-900 placeholder-gray-400 py-3 px-5 min-h-[44px] max-h-32 focus:ring-2 focus:ring-blue-200 transition shadow-sm"
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
            <button type="submit" className="p-3 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 hover:from-indigo-500 hover:to-blue-600 text-white disabled:opacity-50 shadow-lg transition" disabled={loading || !input.trim()} aria-label="Enviar">
              <PaperAirplaneIcon className="w-7 h-7 rotate-90" />
            </button>
          </form>
        </div>
      </div>
    </>
  );

