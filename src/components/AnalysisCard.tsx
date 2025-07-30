import React, { ReactNode } from 'react';

// --- NEW: Define a specific type for financial metrics ---
type FinancialMetric = {
  revenue?: string;
  year?: string;
  ebitda?: string;
  margin?: string;
  gross_margin?: string;
  capex?: string;
  capex_pct_revenue?: string;
  fcf?: string;
};

// Define the shape of the data from the AI, including the new 'growth' object
type AnalysisData = {
  company?: { 
    name?: string; 
    description?: string;
    business_model?: string;
    products_services?: string;
    customer_base?: string;
  };
  industry?: string;
  financials?: { actuals?: FinancialMetric; estimates?: FinancialMetric };
  growth?: {
    historical_revenue_cagr?: string;
    projected_revenue_cagr?: string;
    historical_fcf_cagr?: string;
    projected_fcf_cagr?: string;
    growth_commentary?: string;
  };
  thesis?: string;
  red_flags?: string;
  summary?: string;
  confidence_score?: number;
};

// --- NEW: Define types for the InfoSection props ---
type InfoSectionProps = {
    title: string;
    children: ReactNode;
    icon: string;
}

// A reusable component for displaying a section to keep the code clean
const InfoSection = ({ title, children, icon }: InfoSectionProps) => {
    // Don't render the section if there's no content
    if (!children || (typeof children === 'string' && (children.trim() === 'N/A' || children.trim() === ''))) return null;
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
                <span className="mr-2 text-gray-500">{icon}</span>
                {title}
            </h3>
            <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono pl-7">
                {children}
            </div>
        </div>
    );
};

export default function AnalysisCard({ data }: { data: AnalysisData }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
            <span className="mr-2 text-gray-500">📌</span>
            Company: {data.company?.name || 'N/A'}
        </h3>
        <div className="text-sm text-gray-700 font-mono pl-7 space-y-2">
            <p><span className="font-semibold">Description:</span> {data.company?.description || 'N/A'}</p>
            <p><span className="font-semibold">Business Model:</span> {data.company?.business_model || 'N/A'}</p>
            <p><span className="font-semibold">Products/Services:</span> {data.company?.products_services || 'N/A'}</p>
            <p><span className="font-semibold">Customer Base:</span> {data.company?.customer_base || 'N/A'}</p>
        </div>
      </div>

      <InfoSection title="Industry" icon="🏭">
        {data.industry}
      </InfoSection>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-2 flex items-center">
            <span className="mr-2 text-gray-500">📊</span>
            Financials
        </h3>
        <div className="text-sm text-gray-700 font-mono pl-7 space-y-2">
            <p className="font-semibold underline">Actuals:</p>
            <p>Revenue: {data.financials?.actuals?.revenue || 'N/A'} ({data.financials?.actuals?.year || 'N/A'})</p>
            <p>EBITDA: {data.financials?.actuals?.ebitda || 'N/A'}</p>
            <p>FCF: {data.financials?.actuals?.fcf || 'N/A'}</p>
            <p className="font-semibold underline mt-2">Estimates:</p>
            <p>Revenue: {data.financials?.estimates?.revenue || 'N/A'} ({data.financials?.estimates?.year || 'N/A'})</p>
            <p>EBITDA: {data.financials?.estimates?.ebitda || 'N/A'}</p>
            <p>FCF: {data.financials?.estimates?.fcf || 'N/A'}</p>
        </div>
      </div>

      <InfoSection title="Growth Analysis" icon="�">
        <div className="space-y-1">
            <p><span className="font-semibold">Historical Revenue CAGR:</span> {data.growth?.historical_revenue_cagr || 'N/A'}</p>
            <p><span className="font-semibold">Projected Revenue CAGR:</span> {data.growth?.projected_revenue_cagr || 'N/A'}</p>
            <p><span className="font-semibold">Historical FCF CAGR:</span> {data.growth?.historical_fcf_cagr || 'N/A'}</p>
            <p className="pt-2 italic">{data.growth?.growth_commentary}</p>
        </div>
      </InfoSection>
      
      <InfoSection title="Investment Thesis" icon="💡">
        {data.thesis}
      </InfoSection>

      <InfoSection title="Red Flags" icon="⚠️">
        {data.red_flags}
      </InfoSection>

      <InfoSection title="Summary" icon="�">
        {data.summary}
      </InfoSection>
    </div>
  );
}
