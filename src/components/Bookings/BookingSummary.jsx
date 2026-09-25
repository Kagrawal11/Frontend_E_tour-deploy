import React from 'react';
import { useBooking } from '../../context/BookingContext';
import Card from '../UI/Card';

const BookingSummary = () => {
  const {
    selectedTour,
    selectedDeparture,
    passengers,
    calculateTotal,
    roomSummary // [NEW]
  } = useBooking();

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!selectedTour) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">
            Booking Summary
          </h3>
          <p className="text-slate-500 text-sm">
            No tour selected yet
          </p>
        </div>
      </Card>
    );
  }

  const subtotal = calculateTotal();
  const taxes = subtotal * 0.1;
  const total = subtotal + taxes;

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          Booking Summary
        </h3>

        <div className="space-y-4">

          {/* TOUR DETAILS */}
          <div>
            <h4 className="font-medium text-slate-100 mb-2">
              Tour Details
            </h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>{selectedTour.categoryName}</p>

              {selectedDeparture ? (
                <p>{selectedDeparture.noOfDays} days</p>
              ) : (
                <p className="text-slate-600">Select departure</p>
              )}
            </div>
          </div>

          {/* DEPARTURE */}
          {selectedDeparture && (
            <div>
              <h4 className="font-medium text-slate-100 mb-2">
                Departure
              </h4>
              <div className="text-sm text-slate-400 space-y-1">
                <p>{formatDate(selectedDeparture.departDate)}</p>
                <p>
                  Return: {formatDate(selectedDeparture.endDate)}
                </p>
              </div>
            </div>
          )}

          {/* PASSENGERS */}
          {passengers.length > 0 && (
            <div>
              <h4 className="font-medium text-slate-100 mb-2">
                Passengers ({passengers.length})
              </h4>
              <div className="text-sm text-slate-400 space-y-1">
                {passengers.map((passenger, index) => (
                  <p key={index}>
                    {passenger.pax_name || `Passenger ${index + 1}`} – {passenger.pax_type.replace(/_/g, ' ')}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ROOM REQUIREMENTS */}
          {roomSummary && (
            <div>
               <h4 className="font-medium text-slate-100 mb-2">
                Room Requirements
              </h4>
              <div className="text-sm text-slate-300 space-y-1 p-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.06]">
                 {roomSummary.doubleRoomCount > 0 && (
                   <div className="flex justify-between">
                     <span>Twin Sharing Rooms:</span>
                     <span className="font-bold">{roomSummary.doubleRoomCount}</span>
                   </div>
                 )}
                 {roomSummary.singleRoomCount > 0 && (
                   <div className="flex justify-between">
                     <span>Single Rooms:</span>
                     <span className="font-bold">{roomSummary.singleRoomCount}</span>
                   </div>
                 )}
                 {roomSummary.childBedCount > 0 && (
                   <div className="flex justify-between">
                     <span>Extra Beds (Child):</span>
                     <span className="font-bold">{roomSummary.childBedCount}</span>
                   </div>
                 )}
                 <p className="text-xs text-slate-500 mt-1 italic">
                   *Max 2 adults per room
                 </p>
              </div>
            </div>
          )}

          {/* PRICE */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--color-border)' }}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-slate-200">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Taxes (10%)</span>
                <span className="font-medium text-slate-200">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-slate-100">Total</span>
                <span className="gradient-text">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>• Free cancellation up to 24 hours before departure</p>
            <p>• Instant confirmation</p>
            <p>• 24/7 customer support</p>
          </div>

        </div>
      </div>
    </Card>
  );
};

export default BookingSummary;
