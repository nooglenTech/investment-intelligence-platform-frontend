// src/context/DealContext.tsx

import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

const DealContext = createContext(undefined);

// --- NEW: Helper function to determine feedback status ---
const getFeedbackStatus = (deal) => {
    if (deal.status !== 'Complete') {
        return 'N/A'; // Not applicable until analysis is complete
    }
    const totalTeamMembers = 5; // Placeholder
    const feedbackCount = deal.feedbacks?.length || 0;

    if (feedbackCount === totalTeamMembers) return 'Review Complete';
    if (feedbackCount > 0) return 'In Progress';
    return 'Feedback Needed';
};

// Helper function to map API data to our UI's data structure
const mapDealFromApi = (dealFromApi, currentUserId) => ({
  ...dealFromApi,
  title: dealFromApi.analysis_data?.company?.name || dealFromApi.file_name,
  analysis: dealFromApi.analysis_data,
  tags: dealFromApi.analysis_data?.ibis_industries || [dealFromApi.analysis_data?.industry || "N/A"],
  feedback: dealFromApi.feedbacks || [],
  currentUserHasSubmitted: (dealFromApi.feedbacks || []).some(fb => fb.user_id === currentUserId),
  // --- NEW: Add calculated feedbackStatus to each deal object ---
  feedbackStatus: getFeedbackStatus(dealFromApi),
});


export function DealProvider({ children }) {
  const { getToken, userId } = useAuth();
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const authedFetch = async (url, options = {}) => {
    const token = await getToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  };

  const fetchDeals = useCallback(async () => {
    try {
      setError(null);
      const res = await authedFetch(`${apiUrl}/api/deals`);
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Failed to fetch deals.');
      }
      const data = await res.json();
      const dealsWithUIState = data.map(deal => mapDealFromApi(deal, userId));
      setDeals(dealsWithUIState);
    } catch (err) {
      setError(err.message);
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }, [userId, getToken, isLoading, apiUrl]);


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

  const addDeal = (newDealFromApi) => {
    const dealWithUIState = mapDealFromApi(newDealFromApi, userId);
    setDeals(prevDeals => [dealWithUIState, ...prevDeals]);
  };

  const deleteDeal = async (dealId) => {
    const originalDeals = [...deals];
    setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
    try {
      const res = await authedFetch(`${apiUrl}/api/deals/${dealId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deal on the server.');
    } catch (err) {
      setDeals(originalDeals);
      setError("Could not delete deal. Please try again.");
    }
  };

  const submitFeedback = async (dealId, feedbackData) => {
    try {
      const res = await authedFetch(`${apiUrl}/api/deals/${dealId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });
      if (!res.ok) throw new Error('Failed to submit feedback.');
      
      await fetchDeals();

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };
  
   const deleteFeedback = async (dealId, feedbackId) => {
      try {
          const res = await authedFetch(`${apiUrl}/api/feedback/${feedbackId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete feedback.');
          
          await fetchDeals();

      } catch (err) {
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
