// src/pages/index.tsx

import React, { useState, useMemo } from 'react';
import DealCard from '../components/DealCard';
import { useDeals } from '../context/DealContext';

export default function DashboardPage() {
    const { deals, isLoading, error } = useDeals();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const isAnyDealAnalyzing = useMemo(() => deals.some(deal => deal.status === 'Analyzing'), [deals]);

    const filteredDeals = useMemo(() => {
        return deals.filter(deal => {
            const nameMatch = deal.title.toLowerCase().includes(searchTerm.toLowerCase());
            const statusMatch = statusFilter === 'all' || deal.status === statusFilter;
            return nameMatch && statusMatch;
        });
    }, [deals, searchTerm, statusFilter]);

    if (isLoading) return <div className="text-center text-slate-400 py-10">Loading Deals...</div>;
    if (error) return <div className="text-center py-10 text-red-400">Error: {error}</div>;

    return (
        <div>
            {/* Search and Filter Controls */}
            <div id="filter-controls" className="mb-8 p-4 glass-panel rounded-xl flex flex-col sm:flex-row items-center gap-4 fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative w-full sm:w-1/2 lg:w-1/3">
                    <input
                        type="text"
                        id="search-input"
                        placeholder="Search by deal name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/70 border border-slate-600 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute top-1/2 left-3 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex gap-4">
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="custom-select bg-slate-900/70 border border-slate-600 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-slate-300"
                    >
                        <option value="all">All Statuses</option>
                        {isAnyDealAnalyzing && <option value="Analyzing">Analyzing</option>}
                        <option value="Complete">Complete</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Deal Cards Grid */}
            <div id="deal-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDeals.length > 0 ? (
                    filteredDeals.map((deal, index) => (
                        <DealCard key={deal.id} deal={deal} index={index} />
                    ))
                ) : (
                    <p id="no-results" className="text-center text-slate-400 md:col-span-2 xl:col-span-3 mt-8">
                        {deals.length === 0 ? 'No deals yet. Click "Upload CIM" to get started.' : 'No deals match the current filters.'}
                    </p>
                )}
            </div>
        </div>
    );
}
