import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AnalysisCard from '../../components/AnalysisCard';
import StarRating from '../../components/StarRating';
import { useDeals } from '../../context/DealContext';

export default function DealPage() {
  const router = useRouter();
  const { id } = router.query;
  const { deals, submitFeedback, deleteFeedback } = useDeals();
  const [qualitativeFeedback, setQualitativeFeedback] = useState('');
  const [ratings, setRatings] = useState({ risk: 0, return: 0, team: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (metric, value) => setRatings(prev => ({ ...prev, [metric]: value }));
  const deal = deals.find(d => d.id === Number(id));

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true);
    const feedbackData = { comment: qualitativeFeedback, ratings: ratings };
    await submitFeedback(deal.id, feedbackData);
    setIsSubmitting(false);
    setQualitativeFeedback(''); // Clear form
    setRatings({ risk: 0, return: 0, team: 0 }); // Clear form
  };

  if (!deal) return <div>Loading...</div>;

  const renderStars = (score) => '★'.repeat(score) + '☆'.repeat(5 - score);

  return (
    <div>
      <Link href="/" className="mb-6 inline-block text-sm font-semibold text-blue-600 hover:underline">
        &larr; Back to Deal Flow
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold mb-4">AI-Generated Analysis</h2>
          <AnalysisCard data={deal.analysis} />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            {!deal.currentUserHasSubmitted ? (
              <div id="feedback-state-a">
                  <h2 className="text-2xl font-bold mb-2">Your Initial Analysis</h2>
                  <textarea value={qualitativeFeedback} onChange={(e) => setQualitativeFeedback(e.target.value)} className="w-full h-32 border border-gray-300 rounded-md p-3" placeholder="e.g., 'The valuation seems high...'"/>
                  <h3 className="text-lg font-semibold mt-6 mb-3">Quantitative Assessment</h3>
                  <div className="space-y-3">
                      <StarRating label="Overall Risk" metric="risk" value={ratings.risk} onChange={handleRatingChange} />
                      <StarRating label="Return Potential" metric="return" value={ratings.return} onChange={handleRatingChange} />
                      <StarRating label="Team Strength" metric="team" value={ratings.team} onChange={handleRatingChange} />
                  </div>
                  <button onClick={handleSubmitFeedback} disabled={isSubmitting} className="w-full mt-6 bg-blue-600 text-white font-semibold py-2.5 rounded-md transition disabled:opacity-50">
                    {isSubmitting ? 'Submitting...' : 'Submit & View Team Feedback'}
                  </button>
              </div>
            ) : (
              <div id="feedback-state-b">
                <h2 className="text-2xl font-bold mb-4">Team Feedback</h2>
                <div className="space-y-4">
                  {Array.isArray(deal.feedback) && deal.feedback.map((fb) => (
                    <div key={fb.id} className={`p-4 rounded-lg group ${fb.user === 'currentUser' ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">{fb.user === 'currentUser' ? 'Your Submitted Analysis' : 'Anonymous Feedback'}</h3>
                        <button onClick={() => deleteFeedback(deal.id, fb.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fas fa-trash-alt fa-sm"></i>
                        </button>
                      </div>
                      <div className="flex justify-between text-sm mt-2 text-gray-600">
                          <span>Risk: <span className="text-amber-500">{renderStars(fb.ratings.risk)}</span></span>
                          <span>Return: <span className="text-amber-500">{renderStars(fb.ratings.return)}</span></span>
                          <span>Team: <span className="text-amber-500">{renderStars(fb.ratings.team)}</span></span>
                      </div>
                      <p className="text-gray-700 mt-2 text-sm">"{fb.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
