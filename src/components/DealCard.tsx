// src/components/DealCard.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDeals } from '../context/DealContext';

export default function DealCard({ deal, index }) {
    const { deleteDeal } = useDeals();
    // This state determines whether to show the "Analysis Progress" or "Feedback Progress" UI.
    const [isAnalysisComplete, setIsAnalysisComplete] = useState(deal.status === 'Complete');

    // This effect can be used to trigger animations when the status changes.
    useEffect(() => {
        if (deal.status === 'Complete') {
            // A timer can allow an animation to finish before the UI switches to the feedback view.
            const timer = setTimeout(() => setIsAnalysisComplete(true), 700); // Delay matches animation
            return () => clearTimeout(timer);
        } else {
            setIsAnalysisComplete(false);
        }
    }, [deal.status]);

    const handleDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
            deleteDeal(deal.id);
        }
    };

    /**
     * Determines the status text, color, and behavior based on the deal's state.
     * When analysis is complete, status is driven by feedback count.
     */
    const getStatusInfo = () => {
        const totalTeamMembers = 5; // Placeholder for total expected feedback

        // If analysis is done, the status badge reflects the feedback stage.
        if (deal.status === 'Complete') {
            const feedbackCount = deal.feedback?.length || 0;

            if (feedbackCount === totalTeamMembers) {
                return { text: 'Review Complete', color: 'green', pulsing: false };
            }
            if (feedbackCount > 0) {
                return { text: 'In Progress', color: 'sky', pulsing: false };
            }
            return { text: 'Feedback Needed', color: 'amber', pulsing: true };
        }

        // Otherwise, show the analysis status.
        switch (deal.status) {
            case 'Analyzing':
                return { text: 'Analyzing...', color: 'sky', progress: 0, pulsing: true, isAnimating: true };
            case 'Failed':
                 return { text: 'Analysis Failed', color: 'red', progress: 100, pulsing: false, isAnimating: false };
            default:
                // Fallback for any other status
                return { text: 'Feedback Required', color: 'amber', progress: 80, pulsing: true, isAnimating: false };
        }
    };

    const statusInfo = getStatusInfo();
    const totalTeamMembers = 5; // Used for the feedback progress display

    const statusClasses = {
        amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        green: 'bg-green-500/20 text-green-400 border-green-500/30',
        sky: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        red: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    const progressClasses = {
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
                                <span>{deal.feedback.length} / {totalTeamMembers}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(deal.feedback.length / totalTeamMembers) * 100}%` }}></div>
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
