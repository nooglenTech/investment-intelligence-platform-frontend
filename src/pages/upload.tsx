import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useDeals } from '../context/DealContext';
import { useAuth } from '@clerk/nextjs'; // Import useAuth here as well

export default function UploadPage() {
  const { addDeal } = useDeals();
  const { getToken } = useAuth(); // Get the getToken function
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const router = useRouter();

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setErrorText("");
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = await getToken(); // Get token for the request
      const res = await fetch("http://localhost:8000/analyze/", {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }, // Add auth header
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      const newDeal = await res.json();
      addDeal(newDeal);
      router.push(`/deals/${newDeal.id}`);
    } catch (err) {
      setErrorText(`❌ An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <Link href="/" className="mb-6 inline-block text-sm font-semibold text-blue-600 hover:underline">
            &larr; Back to Deal Flow
        </Link>
        <div className="max-w-xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">Upload New CIM</h1>
                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-50"
                >
                    {isLoading ? "Analyzing..." : "Analyze & Create Deal"}
                </button>
                {errorText && <div className="bg-red-100 text-red-700 p-4 rounded whitespace-pre-wrap text-sm font-mono">{errorText}</div>}
            </div>
        </div>
    </div>
  );
}