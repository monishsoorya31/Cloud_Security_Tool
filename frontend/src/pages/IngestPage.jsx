// src/pages/IngestPage.jsx
import { useState } from "react";
import { ingestDocument } from "../api/ingest.api";

export default function IngestPage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState("gcp");
  const [version, setVersion] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!title || !url || !provider) {
      setError("All fields except version are required");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await ingestDocument({
        title,
        url,
        provider,
        version,
      });

      setMessage(res.message || "Document ingested successfully");

      // Optional: clear form
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

  return (
    <div className="max-w-xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Document Ingestion</h1>

      <input
        className="w-full p-2 border rounded"
        placeholder="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full p-2 border rounded"
        placeholder="Document URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <select
        className="w-full p-2 border rounded"
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
      >
        <option value="aws">AWS</option>
        <option value="gcp">GCP</option>
        <option value="azure">Azure</option>
      </select>

      <input
        className="w-full p-2 border rounded"
        placeholder="Version (optional)"
        value={version}
        onChange={(e) => setVersion(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Ingesting document..." : "Ingest Document"}
      </button>

      {message && (
        <p className="text-green-600 font-medium">{message}</p>
      )}

      {error && (
        <p className="text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
