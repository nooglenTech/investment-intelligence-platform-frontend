// src/pages/deal-room.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { useDeals } from '../context/DealContext';

// Define the type for a single deal object to ensure type safety
type Deal = {
  id: number;
  title: string;
  user_name: string;
  status: string;
  s3_url?: string;
};

// A reusable confirmation modal component
const ConfirmationModal = ({ deal, onConfirm, onCancel }: { deal: Deal, onConfirm: () => void, onCancel: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
        <div className="glass-panel rounded-xl p-6 max-w-sm mx-auto transform transition-all duration-300 scale-100">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Confirm Deletion</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Are you sure you want to delete &quot;{deal.title}&quot;? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-4">
                <button onClick={onCancel} className="bg-gray-200 dark:bg-slate-700/50 text-slate-800 dark:text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600/50 transition-colors">
                    Cancel
                </button>
                <button onClick={onConfirm} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                    Delete Deal
                </button>
            </div>
        </div>
    </div>
);


export default function DealRoomPage() {
  const { deals, isLoading, error, deleteDeal } = useDeals();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // State to manage which deal is pending deletion to show the modal
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  // When delete is clicked, set the deal to be deleted to open the modal
  const handleDeleteClick = (e: React.MouseEvent, deal: Deal) => {
    e.stopPropagation();
    e.preventDefault();
    setDealToDelete(deal);
  };

  // When deletion is confirmed in the modal
  const handleConfirmDelete = () => {
    if (dealToDelete) {
        deleteDeal(dealToDelete.id);
        setDealToDelete(null); // Close the modal
    }
  };

  // When deletion is cancelled in the modal
  const handleCancelDelete = () => {
    setDealToDelete(null); // Close the modal
  };

  if (isLoading) return <div className="text-center text-slate-500 dark:text-slate-400 py-10">Loading Deals...</div>;
  if (error) return <div className="text-center py-10 text-red-500 dark:text-red-400">Error: {error}</div>;

  return (
    <div className="fade-in">
        {/* Render the modal conditionally */}
        {dealToDelete && (
            <ConfirmationModal 
                deal={dealToDelete}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        )}

        <div className="glass-panel rounded-xl p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Deal Room</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">A centralized list of all uploaded documents.</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-slate-700">
                            <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold">Deal Name</th>
                            <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold">Uploaded By</th>
                            <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold">Status</th>
                            <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold">Document</th>
                            <th className="p-4 text-slate-500 dark:text-slate-400 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deals.map((deal: Deal) => (
                            <tr key={deal.id} className="border-b border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800/50">
                                <td className="p-4 text-slate-800 dark:text-slate-200 font-medium">
                                    <Link href={`/deals/${deal.id}`} className="hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                                        {deal.title}
                                    </Link>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{deal.user_name}</td>
                                <td className="p-4 text-slate-600 dark:text-slate-300">{deal.status}</td>
                                <td className="p-4">
                                    {deal.s3_url ? (
                                        <a href={`${apiUrl}/api/deals/${deal.id}/view-pdf`} target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold">
                                            View PDF
                                        </a>
                                    ) : (
                                        <span className="text-slate-400 dark:text-slate-500">Processing...</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <button onClick={(e) => handleDeleteClick(e, deal)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
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
