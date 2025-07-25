import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

const DealContext = createContext(undefined);

// Helper function to map API data to our UI's data structure
const mapDealFromApi = (dealFromApi, currentUserId) => ({
  ...dealFromApi,
  title: dealFromApi.analysis_data?.company?.name || dealFromApi.file_name,
  analysis: dealFromApi.analysis_data,
  tags: [dealFromApi.analysis_data?.industry || "N/A"],
  feedback: dealFromApi.feedbacks || [],
  currentUserHasSubmitted: (dealFromApi.feedbacks || []).some(fb => fb.user_id === currentUserId),
});


export function DealProvider({ children }) {
  const { getToken, userId } = useAuth();
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

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

  // Use useCallback to memoize fetchDeals, preventing unnecessary re-renders
  const fetchDeals = useCallback(async () => {
    // No need to set loading to true for background polls
    // setIsLoading(true); 
    try {
      setError(null);
      const res = await authedFetch('http://localhost:8000/api/deals');
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
      // Only set loading to false on the initial fetch
      if (isLoading) setIsLoading(false);
    }
  }, [userId, getToken, isLoading]); // Add dependencies


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

  // --- NEW: Polling logic for auto-refresh ---
  useEffect(() => {
    // Check if there are any deals with the status "Analyzing"
    const isAnalyzing = deals.some(deal => deal.status === 'Analyzing');

    if (isAnalyzing) {
      // If a deal is analyzing, set up an interval to re-fetch the deals list
      const pollInterval = setInterval(() => {
        console.log("Polling for deal status updates...");
        fetchDeals();
      }, 5000); // Check every 5 seconds

      // This is a cleanup function that React runs when the component unmounts
      // or when the `deals` array changes. It stops the polling.
      return () => clearInterval(pollInterval);
    }
  }, [deals, fetchDeals]); // This effect runs whenever the list of deals changes

  const addDeal = (newDealFromApi) => {
    const dealWithUIState = mapDealFromApi(newDealFromApi, userId);
    setDeals(prevDeals => [dealWithUIState, ...prevDeals]);
  };

  const deleteDeal = async (dealId) => {
    const originalDeals = [...deals];
    setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
    try {
      const res = await authedFetch(`http://localhost:8000/api/deals/${dealId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deal on the server.');
    } catch (err) {
      setDeals(originalDeals);
      setError("Could not delete deal. Please try again.");
    }
  };

  const submitFeedback = async (dealId, feedbackData) => {
    try {
      const res = await authedFetch(`http://localhost:8000/api/deals/${dealId}/feedback`, {
        method: 'POST',
        body: JSON.stringify(feedbackData),
      });
      if (!res.ok) throw new Error('Failed to submit feedback.');
      const savedFeedback = await res.json();
      
      setDeals(prevDeals =>
        prevDeals.map(deal => {
          if (deal.id === dealId) {
            const updatedFeedback = [...deal.feedback, savedFeedback];
            return { ...deal, feedback: updatedFeedback, currentUserHasSubmitted: true };
          }
          return deal;
        })
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };
  
   const deleteFeedback = async (dealId, feedbackId) => {
      const originalDeals = [...deals];
      setDeals(prevDeals => prevDeals.map(d => d.id === dealId ? {...d, feedback: d.feedback.filter(fb => fb.id !== feedbackId)} : d));
      try {
          const res = await authedFetch(`http://localhost:8000/api/feedback/${feedbackId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete feedback.');
      } catch (err) {
          setDeals(originalDeals);
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
