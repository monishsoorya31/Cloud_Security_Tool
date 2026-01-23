// src/pages/RagPage.jsx
import { useState } from "react";
import { askRag, downloadRagReport } from "../api/rag.api";

export default function RagPage() {
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState("aws");
  const [topK, setTopK] = useState(5);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Ask AI (only once)
  const handleAsk = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await askRag({
        query,
        provider,
        top_k: topK,
        generate_report: false, // ✅ IMPORTANT
      });
      setResult(data);

    } catch (err) {
      setError("Failed to fetch response from AI");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Download Report (NO LLM call again)
  const handleDownload = async () => {
  if (!result?.answer) {
    setError("First click Ask AI, then download the report.");
    return;
  }

  setDownloading(true);
  setError("");

  try {
    await downloadRagReport({
      title: "Cloud Security RAG Report",
      url: window.location.href,
      provider: provider,

      // ✅ REQUIRED
      query: query,              // from textarea state
      answer: result.answer,     // from result
      sources: result.sources || []
    });
  } catch (err) {
    console.log("Download error:", err);
    console.log("Backend response:", err?.response);
    setError("Failed to download report");
  } finally {
    setDownloading(false);
  }
};

  const uniqueSources = result?.sources
    ? Array.from(new Map(result.sources.map((s) => [s.source, s])).values())
    : [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Cloud Security Assistant</h1>

      <textarea
        className="w-full p-3 border rounded"
        rows={4}
        placeholder="Ask a cloud security question..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex gap-4 flex-wrap items-center">
        <select
          className="border p-2 rounded"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="aws">AWS</option>
          <option value="azure">Azure</option>
          <option value="gcp">GCP</option>
        </select>

        <select
          className="border p-2 rounded"
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
        >
          {[3, 5, 7, 10].map((k) => (
            <option key={k} value={k}>
              Top {k}
            </option>
          ))}
        </select>

        {/* ✅ Ask AI */}
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>

        {/* ✅ Download Report */}
        <button
          onClick={handleDownload}
          disabled={!result || downloading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {downloading ? "Downloading..." : "Download Report"}
        </button>
      </div>

      <p>
        Note: Higher <code className="text-blue-500">Top_K</code> means more
        diverse and creative (slower response). <br />
        <span className="pl-11">
          Lower <code className="text-blue-500">Top_K</code> means deterministic,
          and less creative (fast response).
        </span>
      </p>

      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <>
          <div className="p-4 border rounded bg-gray-50">
            <h2 className="font-semibold mb-2">Answer</h2>
            <p className="whitespace-pre-wrap">{result.answer}</p>
          </div>

          <div className="p-4 border rounded">
            <h2 className="font-semibold mb-2">Sources</h2>
            <ul className="list-disc ml-6">
              {uniqueSources.map((src, idx) => (
                <li key={idx}>
                  <a
                    href={src.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
