


import Head from "next/head";
import { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

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
      {/* Chatbot box centrado y moderno */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20">
        <div className="w-[390px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col" style={{minHeight:'540px', maxHeight:'85vh'}}>
          {/* Header elegante */}
          <div className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-t-2xl shadow-sm">
            <h2 className="text-white text-xl font-bold tracking-tight drop-shadow">{APP_NAME}</h2>
          </div>
          {/* Chat body */}
          <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#f4f7fb]" style={{minHeight:'340px'}}>
            {messages.map((msg, idx) => (
              <li key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end`}>
                {msg.role === 'bot' && (
                  <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white mr-2 shadow"><ChatBubbleLeftRightIcon className="w-6 h-6" /></span>
                )}
                <p className={`max-w-[75%] px-4 py-2 rounded-2xl text-base whitespace-pre-line font-medium shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-2xl' : 'bg-white text-gray-900 rounded-bl-2xl border border-gray-200'}`} style={{wordBreak:'break-word'}} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
              </li>
            ))}
            <div ref={chatEndRef} />
          </ul>
          {/* Input moderno */}
          <form onSubmit={handleSend} className="flex items-center gap-2 px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
            <textarea
              className="flex-1 resize-none border border-gray-200 rounded-full outline-none bg-[#f4f7fb] text-base text-gray-900 placeholder-gray-400 py-2 px-4 min-h-[38px] max-h-32 focus:ring-2 focus:ring-blue-200 transition"
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
            <button type="submit" className="p-2 rounded-full bg-blue-600 hover:bg-indigo-500 text-white disabled:opacity-50 shadow transition" disabled={loading || !input.trim()} aria-label="Enviar">
              <PaperAirplaneIcon className="w-7 h-7 rotate-90" />
            </button>
          </form>
        </div>
      </div>
    </>
  );

