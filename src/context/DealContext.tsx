import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs'; // Import the useAuth hook from Clerk

const DealContext = createContext(undefined);

// Helper function to map API data to our UI's data structure
const mapDealFromApi = (dealFromApi, currentUserId) => ({
  ...dealFromApi,
  title: dealFromApi.analysis_data?.company?.name || dealFromApi.file_name,
  analysis: dealFromApi.analysis_data,
  tags: [dealFromApi.analysis_data?.industry || "N/A"],
  feedback: (dealFromApi.feedbacks || []).map(fb => ({...fb, user: fb.user_id === currentUserId ? 'currentUser' : 'anonymous'})),
  // Determine if the current user has submitted feedback for this deal
  currentUserHasSubmitted: (dealFromApi.feedbacks || []).some(fb => fb.user_id === currentUserId),
});


export function DealProvider({ children }) {
  const { getToken, userId } = useAuth(); // Get the getToken function and userId from Clerk
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // --- NEW: API Fetcher with Authentication ---
  const authedFetch = async (url, options = {}) => {
    const token = await getToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    // For FormData, we don't set Content-Type, the browser does it.
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  };


  useEffect(() => {
    // Don't fetch deals if the user is not logged in yet
    if (!userId) {
        setIsLoading(false);
        return;
    };

    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await authedFetch('http://localhost:8000/api/deals');
        if (!res.ok) throw new Error('Failed to fetch deals.');
        const data = await res.json();
        const dealsWithUIState = data.map(deal => mapDealFromApi(deal, userId));
        setDeals(dealsWithUIState);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!hasFetched.current) {
        hasFetched.current = true;
        fetchDeals();
    }
  }, [userId]); // Re-run this effect when the userId becomes available

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
            const newFeedbackWithUser = { ...savedFeedback, user: 'currentUser' };
            const updatedFeedback = [...deal.feedback, newFeedbackWithUser];
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
  
  // deleteFeedback doesn't need to be changed as it will use authedFetch internally via other functions
  // but for completeness, let's imagine it's called directly
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
