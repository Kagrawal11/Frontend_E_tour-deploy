import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { tourAPI, reviewAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/UI/StarRating';
import WishlistButton from '../components/UI/WishlistButton';
import { trackRecentlyViewed } from '../utils/recentlyViewed';
import { ShareIcon, StarIcon } from '@heroicons/react/24/solid';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (path) => {
  if (!path) return null;
  const sanitizedPath = path.replace(/^"+|"+$/g, '');
  if (sanitizedPath.startsWith('http')) return sanitizedPath;
  const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;
  // Ensure we point to the /images/ folder in wwwroot
  const finalPath = cleanPath.startsWith('/images') ? cleanPath : `/images${cleanPath}`;
  return `${BACKEND_URL}${finalPath}`;
};

const TourDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  // Carried forward from Home's search widget (via Tours), for BookingStart's
  // passenger prefill. Falls back to defaults on direct navigation.
  const travelerCounts = {
    adults: Number(location.state?.travelerCounts?.adults) || 1,
    children: Number(location.state?.travelerCounts?.children) || 0,
  };
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, reviewCount: 0, reviews: [] });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchTourDetails();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tourAPI.getTourDetails(id);
      const data = Array.isArray(response.data) ? response.data : [];
      setTours(data);
      if (data[0]) {
        trackRecentlyViewed({
          categoryId: data[0].categoryId,
          categoryName: data[0].categoryName,
          imagePath: getImageUrl(data[0].imagePath),
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tour details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getReviews(id);
      setReviewSummary(res.data);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await reviewAPI.addReview({ categoryId: Number(id), rating: reviewForm.rating, comment: reviewForm.comment });
      toast.success('Thanks for your review!');
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: document.title,
      text: `Check out this tour on Virtugo!`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7c5cff]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-rose-400 text-xl font-semibold mb-4">{error}</p>
        <Link to="/tours" className="btn-primary">
          Back to Tours
        </Link>
      </div>
    );
  }

  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-slate-500 text-xl">No tour details available.</p>
        <Link to="/tours" className="btn-primary mt-4">
          Browse Tours
        </Link>
      </div>
    );
  }

  const tour = tours[0];

  return (
    <div className="min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Navigation */}
        <Link to="/tours" className="flex items-center text-[#22d3ee] hover:text-[#22d3ee] mb-8 transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Tours</span>
        </Link>

        {/* Header Section */}
        {/* Immersive Hero Section */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-10 h-[400px] flex items-center justify-center animate-fade-in">
          <img
            src={getImageUrl(tour.imagePath) || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80"}
            alt={tour.categoryName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            <WishlistButton
              tour={{ categoryId: tour.categoryId, categoryName: tour.categoryName, imagePath: getImageUrl(tour.imagePath) }}
            />
            <button
              onClick={handleShare}
              aria-label="Share tour"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full backdrop-blur-md border border-white/10 text-white hover:scale-110 transition-all"
              style={{ background: 'rgba(8,9,15,0.55)' }}
            >
              <ShareIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 drop-shadow-lg">
              {tour.categoryName}
            </h1>
            <p className="text-xl md:text-2xl font-light text-slate-300 drop-shadow-md mb-4">
              Explore the details of this amazing journey
            </p>
            <div className="flex items-center justify-center gap-2">
              <StarRating rating={reviewSummary.averageRating} count={reviewSummary.reviewCount} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Itinerary */}
          <div className="lg:col-span-2 space-y-8">
            <div className="card overflow-hidden">
              <div className="p-6 md:p-8 bg-gradient-to-r from-[#7c5cff]/10 to-transparent border-b border-white/10">
                <h2 className="text-2xl font-bold text-slate-200 flex items-center">
                  <span className="bg-[#7c5cff]/15 text-[#7c5cff] p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.447-.894L15 7m0 13V7" />
                    </svg>
                  </span>
                  Itinerary Schedule
                </h2>
              </div>
              <div className="p-6 md:p-8 space-y-8">
                {tour.itineraries?.length > 0 ? (
                  tour.itineraries.map((day, index) => (
                    <div key={day.id} className="relative pl-8 md:pl-0">
                      {/* Timeline line for mobile visual (optional css enhancement) */}
                      <div className="flex flex-col md:flex-row gap-6 group">
                        {/* Day Number Badge */}
                        <div className="flex-shrink-0 md:w-24 flex flex-col items-center">
                          <span className="text-4xl font-black text-slate-700 group-hover:text-sky-200 transition-colors">
                            {String(day.dayNo).padStart(2, '0')}
                          </span>
                          <span className="text-xs font-bold text-[#22d3ee] uppercase tracking-wider">Day</span>
                        </div>

                        {/* Content */}
                        <div className="flex-grow bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:shadow-md transition-shadow duration-300">
                          <div className="flex flex-col sm:flex-row gap-6">
                            {day.dayWiseImage && (
                              <div className="flex-shrink-0">
                                <div className="w-full mm:w-35 h-32 rounded-lg overflow-hidden">
                                  <img
                                    src={getImageUrl(day.dayWiseImage)}
                                    alt={`Day ${day.dayNo}`}
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                                  />
                                </div>
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-bold text-slate-100 mb-2">Day {day.dayNo} Highlights</h3>
                              <p className="text-slate-400 leading-relaxed text-mm">{day.itineraryDetail}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    <p>Itinerary details are coming soon.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tour Guide Section */}
            {tour.guides?.length > 0 && (
              <div className="card overflow-hidden mt-8 animate-fade-in-up">
                <div className="p-6 md:p-8 bg-gradient-to-r from-amber-400/10 to-transparent border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-200 flex items-center">
                    <div className="bg-amber-400/15 text-amber-300 p-2.5 rounded-xl mr-4 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Meet Your Guides
                  </h2>
                  <span className="bg-amber-400/15 text-amber-300 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    Expert Team
                  </span>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tour.guides.map((guide) => (
                      <div key={guide.id} className="flex items-center p-5 rounded-2xl border border-white/10 hover:border-amber-400/40 hover:shadow-lg transition-all group">
                        <div className="w-16 h-16 bg-amber-400/15 rounded-full flex items-center justify-center mr-5 text-amber-300 font-black text-2xl border-4 border-white/10 shadow-sm ring-1 ring-amber-400/20 group-hover:bg-amber-400/25 transition-colors">
                          {guide.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors truncate">{guide.name}</h3>
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {guide.email}
                            </span>
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-slate-400 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {guide.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Departures Section (Moved here from bottom to keep consistent flow or can go bottom full width) */}
            {/* Let's keep Departures full width below the grid or inside left col if requested "other things down". 
                 User said "other things down", usually implies below the main split. 
                 But let's put it as a separate full-width card BELOW the split grid as per plan.
             */}
          </div>

          {/* RIGHT COLUMN: Pricing & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">

              {/* Pricing Card */}
              <div className="card overflow-hidden">
                <div className="p-6 bg-black/30 text-white">
                  <h2 className="text-xl font-bold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    Pricing Packages
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {tour.costs?.length > 0 ? (
                    tour.costs.map((cost) => (
                      <div key={cost.id} className="pb-4 last:pb-0 last:border-0 border-b border-white/10">
                        <div className="mb-3">
                          <span className="inline-block px-2 py-1 text-xs font-semibold bg-emerald-400/15 text-emerald-300 rounded">
                            Valid: {new Date(cost.validFrom).toLocaleDateString()} - {new Date(cost.validTo).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Adult (Single)</span>
                            <span className="font-bold text-slate-100 text-lg">₹{cost.singlePersonCost}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Extra Person</span>
                            <span className="font-semibold text-slate-100">₹{cost.extraPersonCost}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Child (w/ Bed)</span>
                            <span className="font-semibold text-slate-100">₹{cost.childWithBedCost}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Child (No Bed)</span>
                            <span className="font-semibold text-slate-100">₹{cost.childWithoutBedCost}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 italic text-center">Contact us for pricing details.</p>
                  )}
                </div>

                {/* Book Action Area */}
                <div className="p-6 bg-white/[0.03] border-t border-white/10">
                  <Link
                    to={`/booking/start/${tour.categoryId}`}
                    state={{ tour, departures: tour.departures, travelerCounts }}
                    className="block w-full btn-primary w-full text-center py-4 text-lg font-bold"
                  >
                    Book Now
                  </Link>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Instant Confirmation
                  </div>
                </div>
              </div>

              {/* Secure Badge */}
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Best Price Guarantee</span>
              </div>


            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Fare Calendar */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-100 mb-1 pl-2 border-l-4 border-[#7c5cff]">Fare Calendar</h2>
          <p className="text-sm text-slate-500 mb-6 pl-2">Compare prices across available departure dates</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tour.departures?.length > 0 ? (
              (() => {
                const prices = tour.departures.map((d) => tour.costs?.[0]?.singlePersonCost).filter(Boolean);
                const cheapest = prices.length ? Math.min(...prices) : null;
                return tour.departures.map((dep) => {
                  const price = tour.costs?.[0]?.singlePersonCost;
                  const isCheapest = cheapest !== null && price === cheapest;
                  return (
                    <div key={dep.id || dep.departureId} className={`card card-hover p-6 transition-shadow group relative ${isCheapest ? 'border-emerald-400/40' : ''}`}>
                      {isCheapest && (
                        <span className="absolute -top-2.5 right-4 bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 uppercase tracking-wide">
                          Best Price
                        </span>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-[#22d3ee]/15 text-[#22d3ee] text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                          Confirmed
                        </div>
                        <span className="text-slate-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-slate-200 mb-1">
                        {new Date(dep.departDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-slate-500 text-sm mb-4">{new Date(dep.departDate).getFullYear()}</p>

                      {price && (
                        <p className="gradient-text text-xl font-bold mb-4">₹{price.toLocaleString()} <span className="text-xs text-slate-500 font-normal">/ person</span></p>
                      )}

                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <div className="text-sm">
                          <p className="text-slate-500">Duration</p>
                          <p className="font-semibold text-slate-200">{dep.noOfDays} Days</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="text-slate-500">Return</p>
                          <p className="font-semibold text-slate-200">
                            {new Date(dep.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="col-span-full text-center py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/15">
                <p className="text-slate-500">No scheduled departures at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* REVIEWS */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6 pl-2">
            <h2 className="text-2xl font-bold text-slate-100 border-l-4 border-[#7c5cff] pl-2 -ml-2">
              Reviews & Ratings
            </h2>
            <StarRating rating={reviewSummary.averageRating} count={reviewSummary.reviewCount} size="w-5 h-5" />
          </div>

          {isAuthenticated && (
            <div className="card p-6 mb-6">
              <h3 className="font-semibold text-slate-100 mb-3">Write a review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                    >
                      <StarIcon className={`w-7 h-7 transition-colors ${star <= reviewForm.rating ? 'text-amber-400' : 'text-white/15'}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Share your experience..."
                  rows={3}
                  className="input-field w-full resize-none"
                  required
                />
                <button type="submit" disabled={submittingReview} className="btn-primary">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          {reviewSummary.reviews?.length > 0 ? (
            <div className="space-y-4">
              {reviewSummary.reviews.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-100">{r.customerName}</span>
                    <StarRating rating={r.rating} showValue={false} />
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{r.comment}</p>
                  <p className="text-xs text-slate-600 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/[0.02] rounded-xl border border-dashed border-white/15">
              <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TourDetail;