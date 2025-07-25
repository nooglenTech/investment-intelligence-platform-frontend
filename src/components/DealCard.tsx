import React from 'react';
import Link from 'next/link';
import { useDeals } from '../context/DealContext';

export default function DealCard({ deal }) {
  const { deleteDeal } = useDeals();
  
  // The old statusColors variable is no longer needed.
  const industry = deal.analysis?.industry || 'N/A';
  const revenue = deal.analysis?.financials?.actuals?.revenue || 'N/A';
  const ebitda = deal.analysis?.financials?.actuals?.ebitda || 'N/A';

  const handleDelete = (e) => {
    // Stop the click from navigating to the deal page
    e.stopPropagation();
    e.preventDefault(); 
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      deleteDeal(deal.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-900 pr-4">{deal.title}</h2>
          
          {/* --- UPDATED SECTION --- */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* This span replaces the old status pill */}
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {deal.user_name || 'Auto-Import'}
            </span>
            
            {/* This is the existing delete button */}
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
          {/* --- END UPDATED SECTION --- */}

        </div>
        <div className="flex items-center space-x-6 mt-3 mb-4 border-t border-b border-gray-100 py-2">
            <div>
                <p className="text-xs text-gray-500">Industry</p>
                <p className="text-sm font-semibold text-gray-800">{industry}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500">Revenue (Actual)</p>
                <p className="text-sm font-semibold text-gray-800">{revenue}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500">EBITDA (Actual)</p>
                <p className="text-sm font-semibold text-gray-800">{ebitda}</p>
            </div>
        </div>
        <Link href={`/deals/${deal.id}`} className="w-full sm:w-auto inline-block text-center bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-50 transition">
          View Analysis & Feedback
        </Link>
      </div>
    </div>
  );
}
