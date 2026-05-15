import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const endpoint = apiUrl ? `${apiUrl}/analyze` : "/api/analyze";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 flex flex-col items-center justify-center p-4">
      <Head>
        <title>Agente de Noticias Médicas</title>
      </Head>
      <h1 className="text-3xl font-bold mb-4 text-pink-700">Agente de Noticias Médicas</h1>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Tema de interés (ej. IA médica)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700" type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Analizar"}
        </button>
      </form>
      <div className="w-full max-w-2xl space-y-4">
        {results.map((article, idx) => (
          <div key={idx} className="bg-white rounded shadow p-4 border-l-4 border-pink-400">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-700 hover:underline">{article.title}</a>
            <p className="text-gray-600 mt-1">{article.description}</p>
            <div className="text-xs text-gray-400 mt-2">{article.source?.name} | {article.publishedAt?.slice(0,10)}</div>
          </div>
        ))}
        {results.length === 0 && !loading && <div className="text-gray-400 text-center">No hay resultados aún.</div>}
      </div>
    </div>
  );
}
