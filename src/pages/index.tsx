import { useState } from "react";
import AnalysisCard from "@/components/AnalysisCard";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError("");
    setResponse(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      const text = await res.text(); // raw text response

      try {
        const json = JSON.parse(text);
        setResponse(json);
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        setError("⚠️ Backend responded but returned invalid JSON.");
      }
    } catch (networkError) {
      console.error("❌ Network error:", networkError);
      setError("❌ Failed to call backend.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🧠 Investment Intelligence Platform</h1>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload CIM (.pdf)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                if (e.target.files) setSelectedFile(e.target.files[0]);
              }}
              className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-50"
          >
            {isLoading ? "Analyzing..." : "Analyze Document"}
          </button>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 rounded p-3 border border-red-200">
              {error}
            </div>
          )}

          {response && (
            <div className="mt-6">
              <AnalysisCard data={response} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
