type AnalysisData = {
  file_name: string;
  analysis: {
    company: {
      name: string;
      description: string;
    };
    industry: string;
    financials: any;
    thesis: string;
    red_flags: string;
    summary: string;
    confidence_score: number;
  };
};

export default function AnalysisCard({ data }: { data: AnalysisData }) {
  const { file_name, analysis } = data;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-4">
      <h2 className="text-xl font-bold text-blue-700">📄 {file_name}</h2>

      <div>
        <h3 className="text-lg font-semibold">🏢 Company</h3>
        <p className="text-gray-700"><strong>{analysis.company.name}</strong></p>
        <p className="text-sm text-gray-600">{analysis.company.description}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">🏭 Industry</h3>
        <p className="text-gray-700">{analysis.industry}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">💰 Financials (Actuals)</h3>
        <pre className="text-sm bg-gray-100 rounded p-2 overflow-x-auto">
          {JSON.stringify(analysis.financials.actuals, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className="text-lg font-semibold">🧠 Investment Thesis</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{analysis.thesis}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">⚠️ Red Flags</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{analysis.red_flags}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">📌 Summary</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{analysis.summary}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold">🔎 Confidence Score</h3>
        <p className="text-gray-700">{analysis.confidence_score}/100</p>
      </div>
    </div>
  );
}
