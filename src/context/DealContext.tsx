// src/context/DealContext.tsx

import React, { createContext, useState, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

// --- FIX: Define a comprehensive type for the context value ---
// This tells TypeScript exactly what properties and functions will be available in the context.
type Deal = any; // Using 'any' for now, but a more specific type is recommended.
type FeedbackData = { comment: string; ratings: { [key: string]: number } };

interface DealContextType {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  addDeal: (newDeal: Deal) => void;
  deleteDeal: (dealId: number) => Promise<void>;
  submitFeedback: (dealId: number, feedbackData: FeedbackData) => Promise<{ success: boolean; error?: string }>;
  deleteFeedback: (dealId: number, feedbackId: number) => Promise<void>;
}

// --- FIX: Provide a default value that matches the context type ---
// This prevents TypeScript from inferring the context as `undefined`, which caused the "not callable" error.
const DealContext = createContext<DealContextType>({
  deals: [],
  isLoading: true,
  error: null,
  addDeal: () => {},
  deleteDeal: async () => {},
  submitFeedback: async () => ({ success: false, error: 'Context not available' }),
  deleteFeedback: async () => {},
});


const getFeedbackStatus = (deal: Deal) => {
    if (deal.status !== 'Complete') {
        return 'N/A';
    }
    const totalTeamMembers = 5;
    const feedbackCount = deal.feedbacks?.length || 0;

    if (feedbackCount === totalTeamMembers) return 'Review Complete';
    if (feedbackCount > 0) return 'In Progress';
    return 'Feedback Needed';
};

const mapDealFromApi = (dealFromApi: any, currentUserId: string | null | undefined) => ({
  ...dealFromApi,
  title: dealFromApi.analysis_data?.company?.name || dealFromApi.file_name,
  analysis: dealFromApi.analysis_data,
  tags: dealFromApi.analysis_data?.ibis_industries || [dealFromApi.analysis_data?.industry || "N/A"],
  feedback: dealFromApi.feedbacks || [],
  currentUserHasSubmitted: (dealFromApi.feedbacks || []).some((fb: any) => fb.user_id === currentUserId),
  feedbackStatus: getFeedbackStatus(dealFromApi),
});


export function DealProvider({ children }: { children: ReactNode }) {
  const { getToken, userId } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const authedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  }, [getToken]);

  const fetchDeals = useCallback(async () => {
    try {
      setError(null);
      const res = await authedFetch(`${apiUrl}/api/deals`);
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to fetch deals.');
      }
      const data = await res.json();
      const dealsWithUIState = data.map((deal: any) => mapDealFromApi(deal, userId));
      setDeals(dealsWithUIState);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }, [userId, isLoading, apiUrl, authedFetch]);


  useEffect(() => {
    if (!userId) {
        setIsLoading(false);
        return;
    };

    if (!hasFetched.current && userId) {
        hasFetched.current = true;
        fetchDeals();
    }
  }, [userId, fetchDeals]);

  useEffect(() => {
    const isAnalyzing = deals.some(deal => deal.status === 'Analyzing');
    if (isAnalyzing) {
      const pollInterval = setInterval(() => {
        fetchDeals();
      }, 5000); 
      return () => clearInterval(pollInterval);
    }
  }, [deals, fetchDeals]);

  const addDeal = (newDealFromApi: any) => {
    const dealWithUIState = mapDealFromApi(newDealFromApi, userId);
    setDeals(prevDeals => [dealWithUIState, ...prevDeals]);
  };

  const deleteDeal = async (dealId: number) => {
    const originalDeals = [...deals];
    setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
    try {
      const res = await authedFetch(`${apiUrl}/api/deals/${dealId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deal on the server.');
    } catch { // --- FIX: Removed unused 'err' variable ---
      setDeals(originalDeals);
      setError("Could not delete deal. Please try again.");
    }
  };

  const submitFeedback = async (dealId: number, feedbackData: FeedbackData) => {
    try {
      const res = await authedFetch(`${apiUrl}/api/deals/${dealId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });
      if (!res.ok) throw new Error('Failed to submit feedback.');
      
      await fetchDeals();

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };
  
   const deleteFeedback = async (dealId: number, feedbackId: number) => {
      try {
          const res = await authedFetch(`${apiUrl}/api/feedback/${feedbackId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete feedback.');
          
          await fetchDeals();

      } catch { // --- FIX: Removed unused 'err' variable ---
          setError("Could not delete feedback.");
      }
  };

  const value = { deals, isLoading, error, addDeal, deleteDeal, submitFeedback, deleteFeedback };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useDeals() {
  const context = useContext(DealContext);
  if (context === undefined) throw new Error('useDeals must be used within a DealProvider');
  return context;
}
