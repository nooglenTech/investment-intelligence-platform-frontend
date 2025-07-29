// src/pages/deals/[id].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useDeals } from '../../context/DealContext';
import StarRating from '../../components/StarRating';
import Accordion from '../../components/Accordion';

export default function DealPage() {
  const router = useRouter();
  const { id } = router.query;
  const { deals, isLoading, submitFeedback, deleteDeal, deleteFeedback } = useDeals();
  const { user, getToken } = useAuth();

  const [deal, setDeal] = useState(null);
  const [comment, setComment] = useState('');
  const [ratings, setRatings] = useState({ risk: 0, return: 0, team: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const [showDeleteDealConfirm, setShowDeleteDealConfirm] = useState(false);
  const [showDeleteFeedbackConfirm, setShowDeleteFeedbackConfirm] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const currentUserFeedback = deal?.feedback.find(fb => fb.user_id === user?.id);
  const teamFeedback = deal?.feedback.filter(fb => fb.user_id !== user?.id) || [];

  useEffect(() => {
    if (!isLoading && deals.length > 0 && id) {
      const foundDeal = deals.find(d => d.id === Number(id));
      setDeal(foundDeal);
    }
  }, [id, deals, isLoading]);

  // Pre-fill form if user has feedback, otherwise clear it
  useEffect(() => {
    if (currentUserFeedback) {
      setComment(currentUserFeedback.comment || '');
      setRatings(currentUserFeedback.ratings || { risk: 0, return: 0, team: 0 });
    } else {
      // This will clear the form after feedback is deleted
      setComment('');
      setRatings({ risk: 0, return: 0, team: 0 });
    }
  }, [currentUserFeedback]);


  const handleRatingChange = (metric, value) => setRatings(prev => ({ ...prev, [metric]: value }));

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!deal) return;
    setIsSubmitting(true);
    const feedbackData = { comment, ratings };
    await submitFeedback(deal.id, feedbackData);
    setIsSubmitting(false);
    // No need to clear the form, as it will be re-populated with the latest feedback
  };
  
  const handleViewCim = async () => {
    if (!deal) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
        const token = await getToken();
        const res = await fetch(`${apiUrl}/api/deals/${deal.id}/view-pdf`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Could not fetch PDF.');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsPdfModalOpen(true);
    } catch (error) {
        console.error("Failed to load PDF:", error);
    }
  };

  const handleDeleteDeal = () => {
    setShowDeleteDealConfirm(true);
  }

  const confirmDeleteDeal = () => {
    deleteDeal(deal.id);
    router.push('/');
    setShowDeleteDealConfirm(false);
  }
  
  const handleDeleteFeedback = (feedbackId) => {
      setFeedbackToDelete(feedbackId);
      setShowDeleteFeedbackConfirm(true);
  }

  const confirmDeleteFeedback = () => {
      if (feedbackToDelete) {
          deleteFeedback(deal.id, feedbackToDelete);
      }
      setShowDeleteFeedbackConfirm(false);
      setFeedbackToDelete(null);
  }

  if (isLoading || !deal) {
    return (
      <div className="text-center py-10 text-slate-400">Loading Deal...</div>
    );
  }
  
  const closePdfModal = () => {
      if(pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
      }
      setIsPdfModalOpen(false);
      setPdfUrl('');
  }

  const analysis = deal.analysis || {};
  const company = analysis.company || {};
  const financials = analysis.financials || {};

  const renderRedFlags = () => {
    const redFlagsData = analysis.red_flags;
    if (!redFlagsData) {
        return <li>No red flags identified.</li>;
    }
    if (Array.isArray(redFlagsData)) {
        return redFlagsData.map((flag, i) => flag && <li key={i}>{flag}</li>);
    }
    if (typeof redFlagsData === 'string') {
        return redFlagsData.split('\n').map((flag, i) => flag.trim() && <li key={i}>{flag.trim()}</li>);
    }
    return <li>Could not parse red flags.</li>;
  };

  const renderStars = (score) => '★'.repeat(score || 0) + '☆'.repeat(5 - (score || 0));

  return (
    <div className="fade-in">
       {/* PDF Viewer Modal */}
       {isPdfModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg w-11/12 h-5/6 flex flex-col glass-panel">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-slate-200">{deal.title}</h3>
              <button onClick={closePdfModal} className="text-slate-500 hover:text-slate-200 text-3xl transition-colors">&times;</button>
            </div>
            <iframe src={pdfUrl} className="w-full h-full" title="CIM Document Viewer"></iframe>
          </div>
        </div>
      )}

      {/* Delete Deal Confirmation Modal */}
      {showDeleteDealConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="glass-panel rounded-lg p-6 max-w-sm mx-auto">
                <h3 className="text-lg font-semibold text-slate-100">Confirm Deletion</h3>
                <p className="text-slate-400 mt-2">Are you sure you want to delete "{deal.title}"? This action cannot be undone.</p>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => setShowDeleteDealConfirm(false)} className="bg-slate-700/50 text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-600/50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={confirmDeleteDeal} className="bg-red-500/80 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                        Delete Deal
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Feedback Confirmation Modal */}
      {showDeleteFeedbackConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="glass-panel rounded-lg p-6 max-w-sm mx-auto">
                <h3 className="text-lg font-semibold text-slate-100">Confirm Deletion</h3>
                <p className="text-slate-400 mt-2">Are you sure you want to delete this feedback?</p>
                <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => setShowDeleteFeedbackConfirm(false)} className="bg-slate-700/50 text-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-600/50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={confirmDeleteFeedback} className="bg-red-500/80 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                        Delete Feedback
                    </button>
                </div>
            </div>
        </div>
      )}

      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors mb-2">
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold text-slate-100">{deal.title}</h2>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <button 
              onClick={handleViewCim} 
              className="bg-slate-700/50 text-slate-300 font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-slate-600/50 transition-all duration-300 border border-slate-600"
            >
              <i className="fas fa-file-pdf mr-2"></i>
              View CIM
            </button>
            <button 
              onClick={handleDeleteDeal} 
              className="bg-red-500/20 text-red-400 font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-red-500/30 transition-all duration-300 border border-red-500/30"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Accordion title="Executive Summary" defaultOpen>
                <p className="text-slate-300 leading-relaxed">{analysis.summary || 'No summary available.'}</p>
            </Accordion>
            <Accordion title="Company Overview">
                 <div className="text-slate-300 leading-relaxed space-y-2">
                    <p><strong>Description:</strong> {company.description || 'N/A'}</p>
                    <p><strong>Business Model:</strong> {company.business_model || 'N/A'}</p>
                    <p><strong>Products/Services:</strong> {company.products_services || 'N/A'}</p>
                 </div>
            </Accordion>
            <Accordion title="Financial Overview">
              <div className="text-slate-300 leading-relaxed space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Actuals ({financials.actuals?.year || 'N/A'})</h4>
                  <p><strong>Revenue:</strong> {financials.actuals?.revenue || 'N/A'}</p>
                  <p><strong>EBITDA:</strong> {financials.actuals?.ebitda || 'N/A'}</p>
                  <p><strong>FCF:</strong> {financials.actuals?.fcf || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200 mb-2">Estimates ({financials.estimates?.year || 'N/A'})</h4>
                  <p><strong>Revenue:</strong> {financials.estimates?.revenue || 'N/A'}</p>
                  <p><strong>EBITDA:</strong> {financials.estimates?.ebitda || 'N/A'}</p>
                  <p><strong>FCF:</strong> {financials.estimates?.fcf || 'N/A'}</p>
                </div>
              </div>
            </Accordion>
            <Accordion title="Red Flags & Risks">
                 <ul className="list-disc list-inside space-y-2 text-slate-300">
                    {renderRedFlags()}
                 </ul>
            </Accordion>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-panel rounded-xl p-6 sticky top-8 space-y-8">
            {/* Team Analysis Section */}
            {(deal.feedback && deal.feedback.length > 0) && (
              <div>
                <h3 className="text-xl font-semibold text-slate-100 mb-4">Team Analysis</h3>
                <div className="space-y-4">
                  {currentUserFeedback && (
                    <div className="bg-sky-500/10 border border-sky-500/30 p-3 rounded-lg group">
                      <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-sky-300">Your Feedback</span>
                          <button onClick={() => handleDeleteFeedback(currentUserFeedback.id)} className="text-slate-500 hover:text-red-400 opacity-50 hover:opacity-100 transition-opacity">
                              <i className="fas fa-trash-alt fa-sm"></i>
                          </button>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">"{currentUserFeedback.comment}"</p>
                      <div className="flex justify-between text-sm mt-3 text-slate-400">
                          <span>Risk: <span className="text-amber-400">{renderStars(currentUserFeedback.ratings.risk)}</span></span>
                          <span>Return: <span className="text-amber-400">{renderStars(currentUserFeedback.ratings.return)}</span></span>
                          <span>Team: <span className="text-amber-400">{renderStars(currentUserFeedback.ratings.team)}</span></span>
                      </div>
                    </div>
                  )}
                  {teamFeedback.map(fb => (
                    <div key={fb.id} className="bg-slate-700/50 p-3 rounded-lg group">
                      <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-slate-400">{fb.user_name}</span>
                          {/* --- UPDATED DELETE BUTTON --- */}
                          <button 
                            onClick={() => handleDeleteFeedback(fb.id)} 
                            className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <i className="fas fa-trash-alt fa-sm"></i>
                          </button>
                      </div>
                      <p className="text-sm text-slate-300 mt-2">"{fb.comment}"</p>
                       <div className="flex justify-between text-sm mt-3 text-slate-400">
                           <span>Risk: <span className="text-amber-400">{renderStars(fb.ratings.risk)}</span></span>
                           <span>Return: <span className="text-amber-400">{renderStars(fb.ratings.return)}</span></span>
                           <span>Team: <span className="text-amber-400">{renderStars(fb.ratings.team)}</span></span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit/Update Feedback Section */}
            <div>
              <h3 className="text-xl font-semibold text-slate-100 mb-4">{currentUserFeedback ? 'Update Your Analysis' : 'Submit Your Analysis'}</h3>
              {!currentUserFeedback && <p className="text-sm text-slate-400 mb-6">Your feedback is blind until submitted to reduce bias.</p>}
              <form onSubmit={handleSubmitFeedback}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Qualitative Thesis</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full bg-slate-900/70 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors" rows={4} placeholder="Your investment thesis, key questions..."></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Quantitative Assessment</label>
                      <div className="p-2 bg-slate-900/70 rounded-lg space-y-3">
                          <StarRating label="Overall Risk" metric="risk" value={ratings.risk} onChange={handleRatingChange} />
                          <StarRating label="Return Potential" metric="return" value={ratings.return} onChange={handleRatingChange} />
                          <StarRating label="Team Strength" metric="team" value={ratings.team} onChange={handleRatingChange} />
                      </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full bg-sky-500 text-white font-semibold py-3 rounded-lg hover:bg-sky-600 transition-all duration-300 glow-on-hover disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Submitting...' : (currentUserFeedback ? 'Update Feedback' : 'Submit & View Team Feedback')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
