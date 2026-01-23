// src/pages/PolicyPage.jsx
import { useState } from "react";
import { analyzePolicy } from "../api/policy.api";

export default function PolicyPage() {
  const [policyText, setPolicyText] = useState(
    JSON.stringify(
      {
        Version: "2012-10-17",
        Statement: [
          { Effect: "Allow", Action: "*", Resource: "*" }
        ],
      },
      null,
      2
    )
  );

  const [provider, setProvider] = useState("aws");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const parsedPolicy = JSON.parse(policyText);

      const res = await analyzePolicy({
        policy: parsedPolicy,
        provider,
      });

      setResult(res);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON policy");
      } else {
        setError("Policy analysis failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const riskColor = {
    CRITICAL: "bg-red-600",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-yellow-500",
    LOW: "bg-green-600",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Policy Analyzer</h1>

      {/* Input */}
      <textarea
        rows={12}
        className="w-full p-3 border rounded font-mono text-sm"
        value={policyText}
        onChange={(e) => setPolicyText(e.target.value)}
      />

      <div className="flex gap-4 items-center">
        <select
          className="border p-2 rounded"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        >
          <option value="aws">AWS</option>
          <option value="azure">Azure</option>
          <option value="gcp">GCP</option>
        </select>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Policy"}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {/* Results */}
      {result && (
        <>
          {/* Risk Level */}
          <div className="flex items-center gap-3">
            <span className="font-semibold">Risk Level:</span>
            <span
              className={`text-white px-3 py-1 rounded ${riskColor[result.risk_level]}`}
            >
              {result.risk_level}
            </span>
          </div>

          {/* Findings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Findings</h2>

            {result.findings.map((f, idx) => (
              <div key={idx} className="border p-4 rounded">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{f.issue}</h3>
                  <span className="text-red-600 font-semibold">
                    {f.severity}
                  </span>
                </div>

                <p className="mt-2 whitespace-pre-wrap">
                  {f.explanation}
                </p>

                {f.sources?.length > 0 && (
                  <ul className="mt-3 list-disc ml-5">
                    {[...new Map(
                      f.sources.map(s => [s.source, s])
                    ).values()].map((s, i) => (
                      <li key={i}>
                        <a
                          href={s.source}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Suggested Policy */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Suggested Policy
            </h2>
            <pre className="bg-gray-900 text-green-200 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result.suggested_policy, null, 2)}
            </pre>
          </div>

          {/* Policy Diff */}
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Policy Changes
            </h2>

            <pre className="bg-gray-900 text-green-200 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(result.policy_diff, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
}
