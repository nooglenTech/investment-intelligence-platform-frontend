// src/pages/deal-room.tsx

import React from 'react';
import Link from 'next/link';
import { useDeals } from '../context/DealContext';

export default function DealRoomPage() {
  const { deals, isLoading, error, deleteDeal } = useDeals();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleDelete = (e, deal) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
        deleteDeal(deal.id);
    }
  };

  if (isLoading) return <div className="text-center text-slate-400 py-10">Loading Deals...</div>;
  if (error) return <div className="text-center py-10 text-red-400">Error: {error}</div>;

  return (
    <div className="fade-in">
        <div className="glass-panel rounded-xl p-6">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Deal Room</h2>
            <p className="text-slate-400 mb-6">A centralized list of all uploaded documents.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-700">
                            <th className="p-4 text-slate-400 font-semibold">Deal Name</th>
                            <th className="p-4 text-slate-400 font-semibold">Uploaded By</th>
                            <th className="p-4 text-slate-400 font-semibold">Status</th>
                            <th className="p-4 text-slate-400 font-semibold">Document</th>
                            <th className="p-4 text-slate-400 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map(deal => (
                            <tr key={deal.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="p-4 text-slate-200 font-medium">
                                    <Link href={`/deals/${deal.id}`} className="hover:text-sky-400 transition-colors">
                                        {deal.title}
                                    </Link>
                                </td>
                                <td className="p-4 text-slate-300">{deal.user_name}</td>
                                <td className="p-4 text-slate-300">{deal.status}</td>
                                <td className="p-4">
                                    {deal.s3_url ? (
                                        <a href={`${apiUrl}/api/deals/${deal.id}/view-pdf`} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 font-semibold">
                                            View PDF
                                        </a>
                                    ) : (
                                        <span className="text-slate-500">Processing...</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <button onClick={(e) => handleDelete(e, deal)} className="text-slate-500 hover:text-red-400 transition-colors">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
