import React, { useState, useMemo } from 'react';
import DealCard from '../components/DealCard';
import { useDeals, Deal } from '../context/DealContext';
import IndustryFilter from '../components/IndustryFilter';

export default function DashboardPage() {
    const { deals, isLoading, error } = useDeals();
    const [searchTerm, setSearchTerm] = useState('');
    const [industryFilter, setIndustryFilter] = useState('');
    const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('all');

    const filteredDeals = useMemo(() => {
        if (!Array.isArray(deals)) return [];
        return deals.filter((deal: Deal) => {
            const nameMatch = deal.title.toLowerCase().includes(searchTerm.toLowerCase());
            const industryMatch = !industryFilter || (deal.tags && deal.tags.some(tag => tag.toLowerCase().includes(industryFilter.toLowerCase())));
            const feedbackStatusMatch = feedbackStatusFilter === 'all' || deal.feedbackStatus === feedbackStatusFilter;
            return nameMatch && industryMatch && feedbackStatusMatch;
        });
    }, [deals, searchTerm, industryFilter, feedbackStatusFilter]);

    if (isLoading) return <div className="text-center text-slate-500 py-10">Loading Deals...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    return (
        <div>
            {/* Filter controls remain the same */}
            <div id="filter-controls" className="relative z-10 mb-8 p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row items-center gap-4 flex-wrap">
                <div className="relative w-full sm:w-1/2 lg:w-1/3">
                    <input
                        type="text"
                        id="search-input"
                        placeholder="Search by deal name..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <IndustryFilter value={industryFilter} onChange={setIndustryFilter} />
                <div className="w-full sm:w-auto">
                    <select
                        id="status-filter"
                        value={feedbackStatusFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFeedbackStatusFilter(e.target.value)}
                        className="custom-select w-full bg-gray-100 dark:bg-slate-700 border-gray-300 dark:border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-slate-800 dark:text-slate-300"
                    >
                        <option value="all">All Feedback Stages</option>
                        <option value="Feedback Needed">Feedback Needed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review Complete">Review Complete</option>
                    </select>
                </div>
            </div>

            {/* FIX: Updated grid layout to be max 2 columns */}
            <div id="deal-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDeals.length > 0 ? (
                    filteredDeals.map((deal, index) => (
                        <DealCard key={deal.id} deal={deal} index={index} />
                    ))
                ) : (
                    <div className="lg:col-span-2 mt-8 text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-10 rounded-xl">
                        <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                            {deals.length === 0 ? 'No Deals Found' : 'No Deals Match Your Filters'}
                        </h3>
                        <p id="no-results" className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
                            {deals.length === 0 ? 'Click the "Upload CIM" button to add your first deal.' : 'Try adjusting your search or filter criteria.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
