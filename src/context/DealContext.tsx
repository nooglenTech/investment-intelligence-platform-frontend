// src/context/DealContext.tsx

import React, { createContext, useState, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

// Defines the structure of a single feedback entry
interface Feedback {
  id: number;
  comment: string;
  ratings: { risk: number; return: number; team: number; };
  user_id: string;
  user_name: string;
}

// Defines the structure of the analysis data returned from the API
// --- FIX: Added the 'summary' property to match the data structure ---
interface AnalysisData {
  summary?: string;
  company?: {
    name?: string;
  };
  ibis_industries?: string[];
  industry?: string;
}

// Defines the structure of a deal object coming from the API
interface ApiDeal {
  id: number;
  status: string;
  feedbacks: Feedback[];
  analysis_data?: AnalysisData;
  file_name: string;
  user_id: string;
  user_name: string;
}

// Export the main Deal interface to be used in other components
export interface Deal extends ApiDeal {
  title: string;
  analysis?: AnalysisData;
  tags: string[];
  feedback: Feedback[];
  currentUserHasSubmitted: boolean;
  feedbackStatus: string;
}

type FeedbackData = { comment: string; ratings: { [key: string]: number } };

// Defines the shape of the context's value
interface DealContextType {
  deals: Deal[];
  isLoading: boolean;
  error: string | null;
  addDeal: (newDeal: ApiDeal) => void;
  deleteDeal: (dealId: number) => Promise<void>;
  submitFeedback: (dealId: number, feedbackData: FeedbackData) => Promise<{ success: boolean; error?: string }>;
  deleteFeedback: (dealId: number, feedbackId: number) => Promise<void>;
}

const DealContext = createContext<DealContextType>({
  deals: [],
  isLoading: true,
  error: null,
  addDeal: () => {},
  deleteDeal: async () => {},
  submitFeedback: async () => ({ success: false, error: 'Context not available' }),
  deleteFeedback: async () => {},
});


const getFeedbackStatus = (deal: ApiDeal) => {
    if (deal.status !== 'Complete') {
        return 'N/A';
    }
    const totalTeamMembers = 5;
    const feedbackCount = deal.feedbacks?.length || 0;

    if (feedbackCount === totalTeamMembers) return 'Review Complete';
    if (feedbackCount > 0) return 'In Progress';
    return 'Feedback Needed';
};

const mapDealFromApi = (dealFromApi: ApiDeal, currentUserId: string | null | undefined): Deal => ({
  ...dealFromApi,
  title: dealFromApi.analysis_data?.company?.name || dealFromApi.file_name,
  analysis: dealFromApi.analysis_data,
  tags: dealFromApi.analysis_data?.ibis_industries || [dealFromApi.analysis_data?.industry || "N/A"],
  feedback: dealFromApi.feedbacks || [],
  currentUserHasSubmitted: (dealFromApi.feedbacks || []).some((fb: Feedback) => fb.user_id === currentUserId),
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
    
    const headers = new Headers(options.headers);
    
    headers.set('Authorization', `Bearer ${token}`);

    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
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
      const data: ApiDeal[] = await res.json();
      const dealsWithUIState = data.map((deal) => mapDealFromApi(deal, userId));
      setDeals(dealsWithUIState);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
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

  const addDeal = (newDealFromApi: ApiDeal) => {
    const dealWithUIState = mapDealFromApi(newDealFromApi, userId);
    setDeals(prevDeals => [dealWithUIState, ...prevDeals]);
  };

  const deleteDeal = async (dealId: number) => {
    const originalDeals = [...deals];
    setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
    try {
      const res = await authedFetch(`${apiUrl}/api/deals/${dealId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deal on the server.');
    } catch {
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
    } catch (err) {
        if (err instanceof Error) {
            return { success: false, error: err.message };
        }
        return { success: false, error: 'An unknown error occurred.' };
    }
  };
  
   const deleteFeedback = async (dealId: number, feedbackId: number) => {
      try {
          const res = await authedFetch(`${apiUrl}/api/feedback/${feedbackId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete feedback.');
          
          await fetchDeals();

      } catch {
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
