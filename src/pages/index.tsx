import { useState } from "react";
import AnalysisCard from "@/components/AnalysisCard";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [errorText, setErrorText] = useState<string>("");

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResponse(null);
    setErrorText("");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:8000/analyze/", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("Raw backend response:", text);

      try {
        const json = JSON.parse(text);
        if (json.analysis) {
          setResponse(json.analysis);
        } else {
          setErrorText("⚠️ No 'analysis' field in backend response.");
        }
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", parseError);
        setErrorText("⚠️ Backend responded but returned invalid JSON:\n\n" + text);
      }
    } catch (networkError) {
      console.error("❌ Network or fetch error:", networkError);
      setErrorText("❌ Error calling backend (fetch failed).");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🧠 Investment Intelligence Platform
        </h1>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload CIM (.pdf)
            </label>
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

          {errorText && (
            <div className="bg-red-100 text-red-700 p-4 rounded whitespace-pre-wrap text-sm font-mono">
              {errorText}
            </div>
          )}

          {response && <AnalysisCard data={response} />}
        </div>
      </div>
    </main>
  );
}
