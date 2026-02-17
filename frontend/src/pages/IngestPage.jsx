// src/pages/IngestPage.jsx
import { useState } from "react";
import { ingestDocument } from "../api/ingest.api";
import { useTheme } from "../layout/MainLayout"; // adjust path as needed

export default function IngestPage() {
  const { dark } = useTheme();

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState("gcp");
  const [version, setVersion] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // t(darkClass, lightClass)
  const t = (d, l) => (dark ? d : l);

  const handleSubmit = async () => {
    if (!title || !url || !provider) {
      setError("All fields except version are required");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await ingestDocument({ title, url, provider, version });
      setMessage(res.message || "Document ingested successfully");
      setTitle("");
      setUrl("");
      setVersion("");
    } catch (err) {
      console.error(err);
      setError("Failed to ingest document");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared style tokens ──────────────────────────────────────────────────────
  const card = `rounded-2xl border overflow-hidden ${t("bg-gray-900 border-gray-800", "bg-white border-gray-200 shadow-sm")}`;
  const cardHeader = `px-5 py-4 border-b flex items-center gap-2 ${t("border-gray-800 bg-gray-900", "border-gray-100 bg-gray-50")}`;
  const inputBase = `w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 ${t("bg-gray-950 border-gray-700 text-gray-100 placeholder-gray-600 focus:border-indigo-500/50", "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400")}`;
  const labelBase = `block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t("text-gray-500", "text-gray-400")}`;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className={`text-2xl font-black tracking-tight ${t("text-white", "text-gray-900")}`}>
          Document Ingestion
        </h1>
        <p className={`text-sm mt-1 ${t("text-gray-500", "text-gray-400")}`}>
          Add a cloud security document to the knowledge base
        </p>
      </div>

      {/* ── Form Card ── */}
      <div className={card}>
        <div className={cardHeader}>
          <svg className={`w-4 h-4 ${t("text-indigo-400", "text-indigo-500")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span className={`text-xs font-semibold uppercase tracking-wider ${t("text-gray-400", "text-gray-500")}`}>
            Document Details
          </span>
        </div>

        <div className="p-5 space-y-4">

          {/* Title */}
          <div>
            <label className={labelBase}>Document Title <span className="text-red-400">*</span></label>
            <input
              className={inputBase}
              placeholder="e.g. AWS S3 Security Best Practices"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* URL */}
          <div>
            <label className={labelBase}>Document URL <span className="text-red-400">*</span></label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none`}>
                <svg className={`w-4 h-4 ${t("text-gray-600", "text-gray-400")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                </svg>
              </div>
              <input
                className={`${inputBase} pl-10`}
                placeholder="https://docs.example.com/security-guide"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Provider + Version row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>Cloud Provider <span className="text-red-400">*</span></label>
              <select
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer ${t("bg-gray-950 border-gray-700 text-gray-200", "bg-white border-gray-200 text-gray-800")}`}
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                disabled={loading}
              >
                <option value="aws">☁️ AWS</option>
                <option value="gcp">🌐 Google Cloud</option>
                <option value="azure">🔷 Azure</option>
              </select>
            </div>

            <div>
              <label className={labelBase}>Version <span className={`normal-case font-medium ${t("text-gray-600", "text-gray-400")}`}>(optional)</span></label>
              <input
                className={inputBase}
                placeholder="e.g. 2024-01"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Divider */}
          <div className={`border-t ${t("border-gray-800", "border-gray-100")}`} />

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md shadow-indigo-200 dark:shadow-indigo-900/40"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Ingesting Document...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Ingest Document
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {message && (
        <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl border text-sm ${t("bg-emerald-950/50 border-emerald-800/60 text-emerald-300", "bg-emerald-50 border-emerald-200 text-emerald-700")}`}>
          <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t("text-emerald-400", "text-emerald-500")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl border text-sm ${t("bg-red-950/50 border-red-800/60 text-red-300", "bg-red-50 border-red-200 text-red-700")}`}>
          <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t("text-red-400", "text-red-500")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ── Info Footer ── */}
      <div className={`mt-4 flex items-start gap-3 p-4 rounded-xl border text-xs ${t("bg-gray-900 border-gray-800 text-gray-500", "bg-gray-50 border-gray-200 text-gray-400")}`}>
        <svg className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${t("text-gray-600", "text-gray-400")}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="leading-relaxed">
          Documents are chunked and embedded into the vector knowledge base. Once ingested, they become available for retrieval in the RAG Assistant.
        </p>
      </div>

    </div>
  );
}