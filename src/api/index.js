import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier spins down on inactivity and can take 50s+ (occasionally
  // minutes on a full cold boot) to wake up and respond to the first request.
  // 10s was firing a client-side timeout while the backend was still processing
  // the request successfully in the background (e.g. payment confirmation).
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const tourAPI = {
  // Relative paths use baseURL
  getTours: () => api.get('/api/tours'),
  getTour: (id) => api.get(`/api/tours/${id}`),
  getTourDetails: (catId) => api.get(`/api/tours/details/${catId}`),
  getToursByCategoryIds: (ids) => api.post('/api/tours/by-category-ids', ids),
};

export const bookingAPI = {
  // Tour & Booking
  getTourId: (categoryId, departureId) => api.get(`/api/tours/tour-id?categoryId=${categoryId}&departureId=${departureId}`),

  // Note: C# Controller is [Route("api/[controller]")] -> api/Booking
  createBooking: (data) => api.post('/api/Booking', data),
  getBooking: (id) => api.get(`/api/Booking/${id}`),
  getBookings: () => api.get('/api/Booking'),
  getBookingsByCustomer: (customerId) => api.get(`/api/Booking/customer/${customerId}`),

  // Invoices (May need implementation in C#)
  getInvoice: (bookingId) => api.get(`/api/Booking/invoice/${bookingId}`), // Warning: Check if exists

  // Passengers
  addPassenger: (data) => api.post('/api/passenger/add', data),
  getPassengersByBooking: (bookingId) => api.get(`/api/passenger/booking/${bookingId}`),

  // Payment Gateway (Razorpay)
  createOrder: (data) => api.post('/payment-gateway/create-order', data),
  verifyPayment: (params) => api.post('/payment-gateway/confirm-payment', null, { params }),

  // Payment Records
  savePayment: (params) => api.post('/api/payment/pay', null, { params }),
  getPaymentStatus: (bookingId) => api.get(`/api/Booking/status/${bookingId}`),

  // Downloads & Emails
  downloadInvoice: (bookingId) => api.get(`/api/invoices/${bookingId}/download`, { responseType: 'blob' }),
  sendInvoiceEmail: (paymentId) => api.post(`/api/email/invoice?paymentId=${paymentId}`),

  // Cancellation
  cancelBooking: (bookingId) => api.post(`/api/Booking/${bookingId}/cancel`),
};

export const reviewAPI = {
  getReviews: (categoryId) => api.get(`/api/reviews/category/${categoryId}`),
  addReview: (data) => api.post('/api/reviews', data),
};

export const adminTourAPI = {
  list: () => api.get('/api/admin/tours'),
  create: (data) => api.post('/api/admin/tours', data),
  update: (categoryId, data) => api.put(`/api/admin/tours/${categoryId}`, data),
  remove: (categoryId) => api.delete(`/api/admin/tours/${categoryId}`),
};

export const adminAPI = {
  uploadItinerary: (formData) => api.post('/api/admin/itineraries/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDashboardStats: () => api.get('/api/admin/stats'),
  getRecentBookings: () => api.get('/api/admin/recent-bookings'),
};

export const emailAPI = {
  sendBookingConfirmation: (paymentId) => api.post(`/api/email/booking-confirmation?paymentId=${paymentId}`),
  sendInvoice: (paymentId) => api.post(`/api/email/invoice?paymentId=${paymentId}`),
};

export const customerAPI = {
  // Auth (Proxied via C# to Java if needed)
  register: (data) => api.post('/api/auth/register', data),
  login: (credentials) => api.post('/api/auth/login', credentials),

  // Customer Profile (Proxied via C# CustomerController)
  getProfile: () => api.get('/api/customer/profile'),
  getProfileId: () => api.get('/api/customer/id'),
  updateProfile: (data) => api.put('/api/customer/profile', data),
  changePassword: (data) => api.post('/api/customer/change-password', data),

  // Password Reset (Ensure these exist in AuthController or Java Proxy)
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),

  // Google OAuth Login
  googleLogin: (idToken) => api.post('/api/auth/google-login', { idToken }),
};

export const searchAPI = {
  // SearchController Mappings

  // Note: C# backend does not currently support duration search
  searchByDuration: (minDays, maxDays) => {
    console.warn("Search by duration not implemented in backend");
    return Promise.resolve({ data: [] });
  },

  searchByCost: (minCost, maxCost) =>
    api.get(`/api/Search/cost/${maxCost}`), // C# takes maxCost only

  searchByLocation: (keyword) =>
    api.get(`/api/Search/name/${keyword}`),

  searchByDate: (fromDate, toDate) =>
    api.get('/api/Search/date', {
      params: { from: fromDate, to: toDate }, // C# expects 'from' and 'to'
    }),
};

export const healthAPI = {
  getHealth: () => api.get('/actuator/health'), // Java actuator, C# might return 404
};

export default api;
