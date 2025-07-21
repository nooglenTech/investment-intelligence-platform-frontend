import React from 'react';
import DealCard from '../components/DealCard';
import { useDeals } from '../context/DealContext';

export default function DashboardPage() {
  const { deals, isLoading, error } = useDeals();
  if (isLoading) return <div className="text-center py-10">Loading Deals...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Deal Flow</h1>
      {deals.length > 0 ? (
        <div className="space-y-5">
          {deals.map(deal => <DealCard key={deal.id} deal={deal} />)}
        </div>
      ) : (
        <div className="text-center py-10 px-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">No Deals Yet</h3>
            <p className="text-sm text-gray-500 mt-1">Click "Upload CIM" to get started.</p>
        </div>
      )}
    </div>
  );
}
