import Head from "next/head";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "bot", content: "¡Hola! Soy tu agente de noticias médicas. Pregúntame sobre cualquier tema de investigación médica o tecnología aplicada a la medicina." }
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
        data.results.forEach((article) => {
          setMessages((msgs) => [
            ...msgs,
            {
              role: "bot",
              content: `**${article.title}**\n${article.summary || article.description || ""}\n[Leer más](${article.url})`
            }
          ]);
        });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex flex-col items-center justify-center">
      <Head>
        <title>Agente Chatbot de Noticias Médicas</title>
      </Head>
      <div className="w-full max-w-xl h-[80vh] flex flex-col rounded-xl shadow-lg bg-white/80 border border-pink-100 mt-8">
        <div className="flex items-center justify-center py-4 border-b border-pink-200 bg-pink-50 rounded-t-xl">
          <span className="text-xl font-bold text-pink-700">Agente de Noticias Médicas</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm whitespace-pre-line text-sm
                  ${msg.role === "user"
                    ? "bg-blue-100 text-blue-900 rounded-br-md"
                    : "bg-pink-100 text-pink-900 rounded-bl-md border border-pink-200"}
                `}
                style={{ wordBreak: "break-word" }}
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }}
              />
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-2 p-4 border-t border-pink-200 bg-white rounded-b-xl">
          <input
            className="flex-1 border border-pink-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Escribe tu pregunta sobre medicina..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 disabled:opacity-50"
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Enviar"}
          </button>
        </form>
      </div>
      <div className="text-xs text-gray-400 mt-2">Desarrollado con Next.js, Tailwind y OpenAI</div>
    </div>
  );
}
