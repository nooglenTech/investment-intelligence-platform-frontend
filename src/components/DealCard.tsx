// src/components/DealCard.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// --- FIX: Import the unified 'Deal' type from the context ---
import { useDeals, Deal } from '../context/DealContext';

// --- FIX: Removed local type definitions to use the single source of truth from the context ---

export default function DealCard({ deal, index }: { deal: Deal, index: number }) {
    const { deleteDeal } = useDeals();
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(deal.status === 'Complete');

    useEffect(() => {
        if (deal.status === 'Complete') {
            const timer = setTimeout(() => setIsAnalysisComplete(true), 700); 
            return () => clearTimeout(timer);
        } else {
            setIsAnalysisComplete(false);
        }
    }, [deal.status]);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
            deleteDeal(deal.id);
        }
    };

    const getStatusInfo = () => {
        const totalTeamMembers = 5; 

        if (deal.status === 'Complete') {
            const feedbackCount = deal.feedback?.length || 0;

            if (feedbackCount >= totalTeamMembers) {
                return { text: 'Review Complete', color: 'green', pulsing: false };
            }
            if (feedbackCount > 0) {
                return { text: 'In Progress', color: 'sky', pulsing: false };
            }
            return { text: 'Feedback Needed', color: 'amber', pulsing: true };
        }

        switch (deal.status) {
            case 'Analyzing':
                return { text: 'Analyzing...', color: 'sky', progress: 0, pulsing: true, isAnimating: true };
            case 'Failed':
                 return { text: 'Analysis Failed', color: 'red', progress: 100, pulsing: false, isAnimating: false };
            default:
                return { text: 'Feedback Required', color: 'amber', progress: 80, pulsing: true, isAnimating: false };
        }
    };

    const statusInfo = getStatusInfo();
    const totalTeamMembers = 5;

    const feedbackCount = deal.feedback?.length || 0;
    const displayCount = Math.min(feedbackCount, totalTeamMembers);
    const progressPercentage = Math.min((feedbackCount / totalTeamMembers) * 100, 100);


    const statusClasses: { [key: string]: string } = {
        amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        sky: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const progressClasses: { [key: string]: string } = {
        amber: 'bg-amber-500',
        green: 'bg-green-500',
        sky: 'bg-sky-500',
        red: 'bg-red-500',
    };
    
    return (
        <Link href={`/deals/${deal.id}`} legacyBehavior>
            <a className="deal-card group glass-panel p-5 rounded-xl flex flex-col gap-4 cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300" style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-slate-100 pr-2">{deal.title}</h3>
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusClasses[statusInfo.color]} ${statusInfo.pulsing ? 'pulse-glow-amber' : ''}`}>
                            {statusInfo.text}
                        </div>
                        <button onClick={handleDelete} className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                            <i className="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <p className="text-slate-400 text-sm flex-grow">
                    {deal.analysis?.summary ? `${deal.analysis.summary.substring(0, 100)}...` : `Uploaded by ${deal.user_name}`}
                </p>
                <div className="flex gap-2 flex-wrap">
                    {deal.tags?.map(tag => (
                       <span key={tag} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                </div>
                <div className="mt-auto pt-4">
                    {isAnalysisComplete ? (
                        <div>
                            <div className="flex justify-between items-center mb-1 text-sm text-slate-400">
                                <span>Feedback Progress</span>
                                <span>{displayCount} / {totalTeamMembers}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    ) : (
                        <div className={deal.status === 'Complete' ? 'fade-out-up-anim' : ''}>
                            <div className="flex justify-between items-center mb-1 text-sm text-slate-400">
                                <span>Analysis Progress</span>
                                {!statusInfo.isAnimating && <span>{statusInfo.progress}%</span>}
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                    className={`${progressClasses[statusInfo.color]} h-2 rounded-full ${statusInfo.isAnimating ? 'progress-bar-indeterminate' : ''}`} 
                                    style={{ width: statusInfo.isAnimating ? undefined : `${statusInfo.progress}%`, transition: 'width 1s ease-in-out' }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </a>
        </Link>
    );
};
