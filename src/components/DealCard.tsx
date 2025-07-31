// src/components/DealCard.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { useDeals, Deal } from '../context/DealContext';

const KeyMetric = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-semibold text-lg text-slate-900 dark:text-white">{value || 'N/A'}</p>
    </div>
);

export default function DealCard({ deal, index }: { deal: Deal, index: number }) {
    const { deleteDeal } = useDeals();
    const [showMetrics, setShowMetrics] = useState(false);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
            deleteDeal(deal.id);
        }
    };

    const getStatusInfo = () => {
        if (deal.status === 'Complete') {
            const feedbackCount = deal.feedback?.length || 0;
            const totalTeamMembers = 5;
            if (feedbackCount >= totalTeamMembers) return { text: 'Review Complete', color: 'green' };
            if (feedbackCount > 0) return { text: 'In Progress', color: 'sky' };
            return { text: 'Feedback Needed', color: 'amber' };
        }
        if (deal.status === 'Analyzing') return { text: 'Analyzing...', color: 'sky' };
        if (deal.status === 'Failed') return { text: 'Analysis Failed', color: 'red' };
        return { text: 'Pending', color: 'slate' };
    };

    const statusInfo = getStatusInfo();
    const statusClasses: { [key: string]: string } = {
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
        green: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
        sky: 'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
        slate: 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200',
    };

    const analysis = deal.analysis || {};
    const financials = analysis.financials || {};

    return (
        <div className="deal-card p-5 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex items-start justify-between">
                <div>
                    <Link href={`/deals/${deal.id}`} className="font-semibold text-slate-900 dark:text-white text-xl hover:underline">
                        {deal.title}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Uploaded by <span className="font-medium text-slate-600 dark:text-slate-300">{deal.user_name}</span></p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClasses[statusInfo.color]}`}>
                    {statusInfo.text}
                </span>
            </div>

            <div className="mt-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2"><span className="font-semibold text-slate-700 dark:text-slate-200">AI Summary:</span> {analysis.summary || 'Analysis is processing...'}</p>
            </div>
            
            <div className="mt-4">
                <button 
                    onClick={() => setShowMetrics(!showMetrics)} 
                    className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center"
                >
                    <span>{showMetrics ? 'Hide Key Metrics' : 'Show Key Metrics'}</span>
                    <svg className={`h-4 w-4 ml-1 transition-transform ${showMetrics ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className={`metrics-section grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 ${showMetrics ? 'open' : ''}`}>
                    <KeyMetric label="Revenue (Actual)" value={financials.actuals?.revenue} />
                    <KeyMetric label="EBITDA (Actual)" value={financials.actuals?.ebitda} />
                    <KeyMetric label="Revenue (Est.)" value={financials.estimates?.revenue} />
                    <KeyMetric label="EBITDA (Est.)" value={financials.estimates?.ebitda} />
                </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <div className="flex items-center -space-x-2">
                        {deal.feedback?.slice(0, 4).map(fb => (
                             <div key={fb.id} className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-800 bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold" title={fb.user_name}>
                                {fb.user_name.charAt(0)}
                             </div>
                        ))}
                        {deal.feedback?.length > 4 && (
                            <div className="h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-800 bg-gray-300 dark:bg-slate-500 flex items-center justify-center text-xs font-bold">
                                +{deal.feedback.length - 4}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                         <Link href={`/deals/${deal.id}`} className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                            View Deal
                         </Link>
                         <button onClick={handleDelete} className="text-slate-400 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                         </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
