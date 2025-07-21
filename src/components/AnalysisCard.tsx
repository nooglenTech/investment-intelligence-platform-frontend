import React from "react";

type AnalysisData = {
  company?: {
    name?: string;
    description?: string;
  };
  industry?: string;
  financials?: {
    actuals?: {
      revenue?: string;
      year?: string;
      ebitda?: string;
      margin?: string;
      gross_margin?: string;
      capex?: string;
      capex_pct_revenue?: string;
      fcf?: string;
    };
    estimates?: {
      revenue?: string;
      year?: string;
      ebitda?: string;
      capex?: string;
      capex_pct_revenue?: string;
      fcf?: string;
    };
  };
  thesis?: string;
  red_flags?: string;
  summary?: string;
  confidence_score?: number;
  flagged_fields?: string[];
  low_confidence_flags?: string[];
};

type Props = {
  data: AnalysisData;
};

export default function AnalysisCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="whitespace-pre-wrap text-sm font-mono text-gray-800 space-y-4 mt-6">
      {data.company?.name && (
        <>
          📌 Company: {data.company.name}
          {"\n"}🔍 Description: {data.company.description || "N/A"}
        </>
      )}

      {data.industry && (
        <>
          {"\n\n"}🏭 Industry: {data.industry}
        </>
      )}

      {(data.financials?.actuals || data.financials?.estimates) && (
        <>
          {"\n\n"}📊 Financials (Actuals):
          {`\n- Revenue (Actual): ${data.financials?.actuals?.revenue || "N/A"} (${data.financials?.actuals?.year || "N/A"})`}
          {`\n- EBITDA (Actual): ${data.financials?.actuals?.ebitda || "N/A"} (${data.financials?.actuals?.year || "N/A"})`}
          {`\n- Margin: ${data.financials?.actuals?.margin || "N/A"}`}
          {`\n- Gross Margin: ${data.financials?.actuals?.gross_margin || "N/A"}`}
          {`\n- Capex: ${data.financials?.actuals?.capex || "N/A"} (${data.financials?.actuals?.capex_pct_revenue || "N/A"} of revenue)`}
          {`\n- FCF: ${data.financials?.actuals?.fcf || "N/A"}`}

          {"\n\n"}📊 Financials (Estimates):
          {`\n- Revenue (Est.): ${data.financials?.estimates?.revenue || "N/A"} (${data.financials?.estimates?.year || "N/A"})`}
          {`\n- EBITDA (Est.): ${data.financials?.estimates?.ebitda || "N/A"} (${data.financials?.estimates?.year || "N/A"})`}
          {`\n- Capex (Est.): ${data.financials?.estimates?.capex || "N/A"} (${data.financials?.estimates?.capex_pct_revenue || "N/A"} of revenue)`}
          {`\n- FCF (Est.): ${data.financials?.estimates?.fcf || "N/A"}`}
        </>
      )}

      {data.thesis && (
        <>
          {"\n\n"}💡 Investment Thesis:
          {"\n"}{data.thesis}
        </>
      )}

      {data.red_flags && (
        <>
          {"\n\n"}⚠️ Red Flags:
          {"\n"}{data.red_flags}
        </>
      )}

      {data.summary && (
        <>
          {"\n\n"}📝 Summary:
          {"\n"}{data.summary}
        </>
      )}

      {typeof data.confidence_score === "number" && (
        <>
          {"\n\n"}📈 Confidence Score: {data.confidence_score}
        </>
      )}

      {data.flagged_fields?.length > 0 && (
        <>
          {"\n\n"}⚠️ Flagged Fields:
          {"\n"}{data.flagged_fields.join(", ")}
        </>
      )}

      {data.low_confidence_flags?.length > 0 && (
        <>
          {"\n\n"}🔍 Low Confidence Flags:
          {"\n"}{data.low_confidence_flags.map(flag => `- ${flag}`).join("\n")}
        </>
      )}
    </div>
  );
}