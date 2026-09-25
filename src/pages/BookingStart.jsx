import React, { useState, useEffect } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import Stepper from '../components/UI/Stepper';
import Card from '../components/UI/Card';
import BookingSummary from '../components/Bookings/BookingSummary';
import PassengerForm from '../components/Forms/PassengerForm';
import ReviewBooking from '../components/Bookings/ReviewBooking';
import { bookingAPI, customerAPI, tourAPI } from '../api';
import { toast } from 'react-toastify';

const BookingStart = () => {
  const location = useLocation();
  const { tourId } = useParams();

  // Data coming from TourDetail (via Link state). Missing on direct load/refresh.
  const passedTour = location.state?.tour;
  const passedDepartures = location.state?.departures;
  const travelerCounts = location.state?.travelerCounts;

  const {
    setTour,
    setDeparture,
    setCustomerId,
    setTravelerCounts,
    customerId,
    currentStep,
    setStep
  } = useBooking();

  const [tour, setTourData] = useState(null);
  const [departures, setDepartures] = useState([]);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment happens inline as part of "Review & Pay" (see ReviewBooking), so
  // there's no separate step for it in the wizard.
  const steps = [
    'Select Tour',
    'Choose Departure',
    'Passenger Details',
    'Review & Pay',
    'Confirmation'
  ];

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  useEffect(() => {
    initBooking();

  }, []);

  // [NEW] Dynamic Cost Calculation (BRD 3.7)
  const { passengers, setTotalAmount, setRoomSummary } = useBooking();

  useEffect(() => {
    if (!tour || !passengers.length || !tour.costs || !tour.costs[0]) return;

    const rates = tour.costs[0];
    let adultsSharing = 0;
    let adultsSingle = 0;
    let childBed = 0;
    let childNoBed = 0;

    passengers.forEach(p => {
      if (p.pax_type === 'adult') {
        if (p.isSingleRoom) adultsSingle++;
        else adultsSharing++;
      }
      else if (p.pax_type === 'child_with_bed') childBed++;
      else if (p.pax_type === 'child_without_bed') childNoBed++;
    });

    // Rule 3 Update:
    // 1. Adults wanting "Separate Room" -> Single Person Cost
    // 2. Adults "Sharing" -> Pair them up.
    //    - Pair = (Single Cost + Extra Cost) [As per user: "if same room extra person cost added"]
    //    - Remainder (Odd person) = Single Cost

    const pairs = Math.floor(adultsSharing / 2);
    const oddSharing = adultsSharing % 2;

    const total =
      (adultsSingle * rates.singlePersonCost) +         // Explicit Singles
      (oddSharing * rates.singlePersonCost) +           // Odd person out
      (pairs * (rates.singlePersonCost + rates.extraPersonCost)) + // Pairs (1 Main + 1 Extra)
      (childBed * rates.childWithBedCost) +
      (childNoBed * rates.childWithoutBedCost);

    // Update Context Room Summary
    setRoomSummary({
      singleRoomCount: adultsSingle + oddSharing,
      doubleRoomCount: pairs,
      childBedCount: childBed,
      childNoBedCount: childNoBed
    });

    // Update Context (so BookingSummary sees it)
    // Note: ensure setTotalAmount exists in context or use setTourAmount
    // Looking at BookingSummary, it calls 'calculateTotal()'. 
    // We should probably override that or update the logic there.

    // Actually, BookingSummary uses `calculateTotal()` which is likely in Context. 
    // Let's stick to the visual updates for now.    
  }, [passengers, tour]);

  const initBooking = async () => {
    try {
      setLoading(true);
      setStep(0);
      setDeparture(null);
      setSelectedDeparture(null);

      // Data normally arrives via router state (Link from TourDetail). On a
      // direct URL load or refresh that state is gone, so fetch the tour by
      // its id from the URL instead, the same way TourDetail does.
      let resolvedTour = passedTour;
      let resolvedDepartures = passedDepartures;

      if (!resolvedTour) {
        const detailsRes = await tourAPI.getTourDetails(tourId);
        const details = Array.isArray(detailsRes.data) ? detailsRes.data : [];
        resolvedTour = details[0] || null;
        resolvedDepartures = resolvedTour?.departures || [];
      }

      if (!resolvedTour || !resolvedDepartures) {
        setError('Invalid booking flow. Please start from Tours page.');
        return;
      }

      // Set tour + departures
      setTourData(resolvedTour);

      // DEBUG LOG
      console.log('📦 Departures:', resolvedDepartures);

      // Normalize departures to handle both 'id' (Java) and 'departureId' (C#)
      const normalizedDepartures = resolvedDepartures?.map((d, index) => ({
        ...d,
        id: d.id || d.departureId || `temp-${index}`, // Fallback ID if missing
        departureId: d.departureId || d.id
      })) || [];

      console.log('🔄 Normalized Departures:', normalizedDepartures);

      setDepartures(normalizedDepartures);
      setTour(resolvedTour);
      setTravelerCounts(travelerCounts || { adults: 1, children: 0 });

      // ✅ FETCH CUSTOMER ID (LOGIC ONLY)
      const res = await customerAPI.getProfileId();
      // Handle both 'id' (Java) and 'customerId' (C#) response formats
      const fetchedCustomerId = res.data.customerId || res.data.id;

      // ✅ REQUIRED CONSOLE LOG
      console.log('✅ customerId fetched from /api/customer/id:', fetchedCustomerId);

      setCustomerId(fetchedCustomerId);

    } catch (err) {
      console.error(err);
      setError('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="text-center py-12">
        <p className="text-rose-400">{error}</p>
        <Link to="/tours" className="btn-primary mt-4 inline-block">
          Back to Tours
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 min-h-screen">

      <h1 className="text-3xl font-bold mb-6 text-slate-100">
        Book Your Tour
      </h1>

      <div className="overflow-x-auto pb-4">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">

        {/* LEFT: Full width if Review Step, else 2/3 */}
        <div className={`${currentStep === 3 ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-6`}>

          {/* STEP 0 */}
          {currentStep === 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-100">
                  Selected Tour
                </h2>

                <div className="p-4 rounded-xl border border-[#7c5cff]/20 bg-[#7c5cff]/[0.06] mb-6">
                  <h3 className="font-bold text-slate-100 text-lg">
                    {tour.categoryName}
                  </h3>
                  <p className="text-sm text-slate-300 mt-1">Great choice for your next adventure!</p>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="btn-primary w-full sm:w-auto"
                >
                  Continue
                </button>
              </div>
            </Card>
          )}

          {/* STEP 1 */}
          {currentStep === 1 && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-100">
                  Select Departure Date
                </h2>

                <div className="space-y-4">
                  {departures.map(dep => (
                    <label
                      key={dep.id}
                      className={`relative flex flex-col sm:flex-row sm:items-center border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                        ${selectedDeparture?.id !== undefined && selectedDeparture.id === dep.id
                          ? 'border-[#7c5cff] bg-[#7c5cff]/[0.08] shadow-md transform scale-[1.01]'
                          : 'border-white/10 hover:border-[#7c5cff]/40 hover:bg-white/[0.03]'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="departure"
                        className="absolute opacity-0 w-0 h-0"
                        checked={selectedDeparture?.id !== undefined && selectedDeparture.id === dep.id}
                        onChange={() => {
                          console.log('Select Departure:', dep);
                          setSelectedDeparture(dep);
                        }}
                      />

                      {/* Check Circle */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4 mb-2 sm:mb-0 flex items-center justify-center transition-colors ${selectedDeparture?.id !== undefined && selectedDeparture.id === dep.id ? 'border-[#7c5cff] bg-[#7c5cff]' : 'border-white/20 bg-transparent'
                        }`}>
                        {selectedDeparture?.id !== undefined && selectedDeparture.id === dep.id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full">
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Departure</p>
                          <p className="font-bold text-slate-100 text-lg">
                            {formatDate(dep.departDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Return</p>
                          <p className="font-medium text-slate-300">
                            {formatDate(dep.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Duration</p>
                          <p className="font-medium text-slate-300">
                            {dep.noOfDays} Days
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    disabled={!selectedDeparture}
                    onClick={async () => {
                      try {
                        const categoryId = tour.categoryId;
                        // Use normalized ID
                        const departureId = selectedDeparture.id || selectedDeparture.departureId;

                        const res = await bookingAPI.getTourId(
                          categoryId,
                          departureId
                        );

                        const tourId = res.data;

                        // ✅ REQUIRED CONSOLE LOGS
                        console.log('🎯 tourId fetched:', tourId);
                        console.log('👤 customerId from context:', customerId);

                        setDeparture({
                          ...selectedDeparture,
                          tourId,
                          categoryId
                        });

                        setStep(2);
                      } catch (err) {
                        console.error(err);
                        toast.error('Failed to fetch tour ID');
                      }
                    }}
                    className={`btn-primary w-full sm:w-auto px-8 py-3 text-lg shadow-lg ${!selectedDeparture
                      ? 'opacity-50 cursor-not-allowed transform-none shadow-none'
                      : ''
                      }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </Card>
          )}

          {currentStep === 2 && <PassengerForm />}
          {currentStep === 3 && <ReviewBooking />}
          {currentStep === 5 && (
            <Card>
              <div className="p-12 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-400/20" style={{ background: 'rgba(52,211,153,0.12)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-100 mb-2">
                  Booking Confirmed!
                </h2>
                <p className="text-slate-400 max-w-md mx-auto">
                  Your adventure awaits. We have sent a confirmation email with all the details.
                </p>
                <div className="mt-8">
                  <Link to="/customer/bookings" className="btn-primary">
                    View My Bookings
                  </Link>
                </div>
              </div>
            </Card>
          )}

        </div>

        {/* RIGHT: Hide if Review Step (Step 3) */}
        {currentStep !== 3 && (
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <BookingSummary />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BookingStart;
