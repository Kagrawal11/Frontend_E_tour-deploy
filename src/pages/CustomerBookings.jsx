import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import Table from '../components/UI/Table';
import { customerAPI, bookingAPI } from '../api';
import { toast } from 'react-toastify';

const CustomerBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState({}); // Tracking loading state per booking ID
  const [loadingEmail, setLoadingEmail] = useState({});
  const [cancelling, setCancelling] = useState({});

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // 1. Get Customer Profile first to get the ID
      const profileRes = await customerAPI.getProfileId();
      const customerId = profileRes.data.customerId;

      if (!customerId) {
        toast.error("Could not verify customer identity.");
        return;
      }

      // 2. Fetch Bookings for this customer
      const response = await bookingAPI.getBookingsByCustomer(customerId);
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (bookingId) => {
    try {
      setLoadingDetails(true);
      setIsModalOpen(true);
      console.log(bookingId);
      // Fetch booking details and passengers in parallel
      const [bookingRes, passengerRes] = await Promise.all([
        bookingAPI.getBooking(bookingId),
        bookingAPI.getPassengersByBooking(bookingId).catch(() => ({ data: [] }))
      ]);

      const bookingData = bookingRes.data;
      bookingData.passengers = passengerRes.data;

      setSelectedBooking(bookingData);
    } catch (err) {
      toast.error("Failed to fetch booking details");
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      setLoadingInvoice(prev => ({ ...prev, [bookingId]: true }));
      const response = await bookingAPI.downloadInvoice(bookingId);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-Booking-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice");
    } finally {
      setLoadingInvoice(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleSendEmail = async (bookingId, paymentId) => {
    try {
      setLoadingEmail(prev => ({ ...prev, [bookingId]: true }));
      // Use paymentId if available, fallback to bookingId
      const idToSend = paymentId || bookingId;
      await bookingAPI.sendInvoiceEmail(idToSend);
      toast.success("Invoice email sent successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email. Check if payment is successful.");
    } finally {
      setLoadingEmail(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  const handlePrintInvoice = async (bookingId) => {
    try {
      setLoadingInvoice(prev => ({ ...prev, [bookingId]: true }));
      const response = await bookingAPI.downloadInvoice(bookingId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => printWindow.print();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to open invoice for printing");
    } finally {
      setLoadingInvoice(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleCopyBookingId = (bookingId) => {
    navigator.clipboard.writeText(String(bookingId));
    toast.success('Booking ID copied');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? If already paid, a refund will be initiated automatically.')) {
      return;
    }
    try {
      setCancelling(prev => ({ ...prev, [bookingId]: true }));
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const getDaysUntilDeparture = (departDate) => {
    if (!departDate) return null;
    const diff = Math.ceil((new Date(departDate) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/20';
      case 'PENDING':
        return 'bg-amber-400/15 text-amber-300 border border-amber-400/20';
      case 'CANCELLED':
        return 'bg-rose-400/15 text-rose-300 border border-rose-400/20';
      case 'COMPLETED':
        return 'bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/20';
      default:
        return 'bg-white/10 text-slate-300 border border-white/10';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-56 rounded mb-4" style={{ background: 'var(--color-surface-2)' }}></div>
        <div className="h-4 w-80 rounded mb-8" style={{ background: 'var(--color-surface-2)' }}></div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-48" style={{ background: 'var(--color-surface-2)' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-rose-400 text-lg">{error}</p>
          <button onClick={fetchBookings} className="mt-4 btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 mb-4">My Bookings</h1>
        <p className="text-slate-400">View and manage your tour bookings</p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-100 mb-2">No bookings yet</h3>
            <p className="text-slate-400 mb-6">
              You haven't made any bookings yet. Start exploring our amazing tours!
            </p>
            <Link to="/tours" className="btn-primary">
              Browse Tours
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.bookingId}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-100 mb-2 flex items-center gap-2">
                      Booking #{booking.bookingId}
                      <button
                        onClick={() => handleCopyBookingId(booking.bookingId)}
                        title="Copy Booking ID"
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span>Ref: {booking.bookingId}</span>
                      <span>•</span>
                      <span>Date: {formatDate(booking.bookingDate)}</span>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 flex items-center gap-3">
                    {(() => {
                      const days = getDaysUntilDeparture(booking.departDate);
                      if (days !== null && days >= 0 && booking.statusName !== 'CANCELLED') {
                        return (
                          <span className="badge">
                            {days === 0 ? 'Departs today' : `${days} day${days === 1 ? '' : 's'} to go`}
                          </span>
                        );
                      }
                      return null;
                    })()}
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(booking.statusName)}`}>
                      {booking.statusName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Number of Passengers</h4>
                    <p className="text-slate-100">{booking.noOfPax} Passengers</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Total Amount</h4>
                    <p className="text-xl font-bold gradient-text">₹{booking.totalAmount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  {booking.statusName !== 'CANCELLED' ? (
                    <button
                      onClick={() => handleCancelBooking(booking.bookingId)}
                      disabled={cancelling[booking.bookingId]}
                      className="inline-flex items-center px-4 py-2 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    >
                      {cancelling[booking.bookingId] ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  ) : <span />}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handlePrintInvoice(booking.bookingId)}
                      disabled={loadingInvoice[booking.bookingId]}
                      title="Print Invoice"
                      className="inline-flex items-center px-4 py-2 bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4H8v4a1 1 0 001 1zm0-16h6v4H8V5z" />
                      </svg>
                      Print
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(booking.bookingId)}
                      disabled={loadingInvoice[booking.bookingId]}
                      className="inline-flex items-center px-4 py-2 bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    >
                      {loadingInvoice[booking.bookingId] ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      Invoice
                    </button>
                    <button
                      onClick={() => handleSendEmail(booking.bookingId, booking.paymentId)}
                      disabled={loadingEmail[booking.bookingId]}
                      className="inline-flex items-center px-4 py-2 bg-[#22d3ee]/15 text-[#22d3ee] hover:bg-[#22d3ee]/25 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                    >
                      {loadingEmail[booking.bookingId] ? (
                        <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      Send Mail
                    </button>
                    <button
                      onClick={() => handleViewDetails(booking.bookingId)}
                      className="inline-flex items-center px-4 py-2 btn-primary font-bold text-xs rounded-xl transition-all shadow-md active:scale-95"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card shadow-2xl w-full max-w-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">
                {loadingDetails ? 'Loading Details...' : `Booking #${selectedBooking?.bookingId}`}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-400 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" style={{ borderColor: "#7c5cff", borderTopColor: "transparent" }}></div>
                  <p className="text-slate-500 font-medium">Fetching booking data...</p>
                </div>
              ) : selectedBooking ? (
                <div className="space-y-8">
                  {/* Summary Section */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#7c5cff]/10 p-3 rounded-xl text-center col-span-2 border border-[#7c5cff]/20">
                      <p className="text-xs text-[#7c5cff] font-bold uppercase mb-1">Status</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.statusName)}`}>
                        {selectedBooking.statusName}
                      </span>
                    </div>
                    <div className="bg-white/[0.03] p-3 rounded-xl text-center border border-white/10">
                      <p className="text-xs text-slate-500 font-bold uppercase mb-1">Date</p>
                      <p className="text-sm font-bold text-slate-100">{formatDate(selectedBooking.bookingDate)}</p>
                    </div>

                    <div className="bg-emerald-400/10 p-3 rounded-xl text-center border border-emerald-400/20">
                      <p className="text-xs text-emerald-300 font-bold uppercase mb-1">Total</p>
                      <p className="text-sm font-bold text-emerald-300">₹{selectedBooking.totalAmount}</p>
                    </div>
                  </div>

                  {/* Passenger Information */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#7c5cff]/15 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#7c5cff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      Passenger Information
                    </h3>
                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-sm">
                      <table className="w-full text-left">
                        <thead className="bg-white/[0.03] text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4">Passenger Name</th>
                            <th className="px-6 py-4">Category</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedBooking.passengers && selectedBooking.passengers.length > 0 ? (
                            selectedBooking.passengers.map((p, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.04] transition-colors group">
                                <td className="px-6 py-4 text-sm font-bold text-slate-300 group-hover:text-[#22d3ee]">{p.paxName}</td>
                                <td className="px-6 py-4">
                                  <span className="inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#22d3ee]/15 text-[#22d3ee] uppercase tracking-tighter">
                                    {p.paxType || 'Adult'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="px-6 py-12 text-center">
                                <p className="text-slate-500 italic text-sm">No individual passenger details found.</p>
                                <p className="text-xs text-slate-500 mt-1">Total count: {selectedBooking.noOfPax}</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tour Guide Information */}
                  {selectedBooking.guides && selectedBooking.guides.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-400/15 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        Tour Guide Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedBooking.guides.map((guide, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-white/10 shadow-sm hover:border-amber-400/40 transition-all group flex items-center gap-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                            <div className="w-12 h-12 bg-amber-400/15 rounded-full flex items-center justify-center text-amber-300 font-black text-lg border-2 border-white/10 shadow-sm ring-1 ring-amber-400/20 group-hover:bg-amber-400/25 transition-colors">
                              {guide.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-black text-slate-100 truncate group-hover:text-amber-300 transition-colors">{guide.name}</p>
                              <div className="flex flex-col mt-0.5">
                                <span className="text-[10px] font-bold text-slate-500 truncate">{guide.email}</span>
                                <span className="text-[10px] font-bold text-slate-500">{guide.phone}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="p-4 bg-amber-400/10 rounded-xl border border-amber-400/20">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-amber-200 mb-1">Payment Status</p>
                        <p className="text-xs text-amber-300/80 leading-relaxed">
                          Your payment for this booking is {selectedBooking.statusName?.toLowerCase() === 'confirmed' ? 'fully processed' : 'being processed'}.
                          Please keep your booking ID <span className="font-mono font-bold bg-amber-400/20 px-1 rounded">#{selectedBooking.bookingId}</span> for future reference.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">No booking details available.</div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadInvoice(selectedBooking?.bookingId)}
                disabled={loadingInvoice[selectedBooking?.bookingId]}
                className="px-6 py-2 bg-[#7c5cff]/15 text-[#a78bfa] font-bold rounded-xl hover:bg-[#7c5cff]/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              >
                {loadingInvoice[selectedBooking?.bookingId] ? (
                  <div className="w-4 h-4 border-2 border-[#7c5cff] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Download Invoice
              </button>
              <button
                onClick={() => handleSendEmail(selectedBooking?.bookingId, selectedBooking?.paymentId)}
                disabled={loadingEmail[selectedBooking?.bookingId]}
                className="px-6 py-2 bg-[#22d3ee]/15 text-[#22d3ee] font-bold rounded-xl hover:bg-[#22d3ee]/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              >
                {loadingEmail[selectedBooking?.bookingId] ? (
                  <div className="w-4 h-4 border-2 border-[#22d3ee] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                Send Mail
              </button>
              <button
                onClick={closeModal}
                className="btn-secondary px-6 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
