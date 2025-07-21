import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const DealContext = createContext(undefined);

// Helper function to map API data to our UI's data structure
const mapDealFromApi = (dealFromApi) => ({
  ...dealFromApi,
  title: dealFromApi.analysis_data?.company?.name || dealFromApi.file_name,
  analysis: dealFromApi.analysis_data,
  tags: [dealFromApi.analysis_data?.industry || "N/A"],
  feedback: dealFromApi.feedbacks || [],
  currentUserHasSubmitted: false, // This would be based on a logged-in user in a real app
});


export function DealProvider({ children }) {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false); // Ref to prevent duplicate fetches

  // Fetch all deals from the backend when the app first loads
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:8000/api/deals');
        if (!res.ok) throw new Error('Failed to fetch deals.');
        const data = await res.json();
        const dealsWithUIState = data.map(mapDealFromApi);
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
  }, []);

  const addDeal = (newDealFromApi) => {
    const dealWithUIState = mapDealFromApi(newDealFromApi);
    setDeals(prevDeals => [dealWithUIState, ...prevDeals]);
  };

  const deleteDeal = async (dealId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/deals/${dealId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete deal on the server.');
      setDeals(prevDeals => prevDeals.filter(deal => deal.id !== dealId));
    } catch (err) {
      console.error("Delete deal error:", err);
      // Optionally show an error to the user
    }
  };

  const deleteFeedback = async (dealId, feedbackId) => {
      try {
          const res = await fetch(`http://localhost:8000/api/feedback/${feedbackId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete feedback on the server.');
          setDeals(prevDeals => prevDeals.map(deal => {
              if (deal.id === dealId) {
                  const updatedFeedback = deal.feedback.filter(fb => fb.id !== feedbackId);
                  return { ...deal, feedback: updatedFeedback };
              }
              return deal;
          }));
      } catch (err) {
          console.error("Delete feedback error:", err);
      }
  };

  const submitFeedback = async (dealId, feedbackData) => {
    try {
      const res = await fetch(`http://localhost:8000/api/deals/${dealId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const value = { deals, isLoading, error, addDeal, deleteDeal, deleteFeedback, submitFeedback };

  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}

export function useDeals() {
  const context = useContext(DealContext);
  if (context === undefined) throw new Error('useDeals must be used within a DealProvider');
  return context;
}
