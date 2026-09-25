import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import OAuth2Success from "../pages/OAuth2Success";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Tours from "../pages/Tours";
import TourDetail from "../pages/TourDetail";
import BookingStart from "../pages/BookingStart";
import CustomerProfile from "../pages/CustomerProfile";
import CustomerBookings from "../pages/CustomerBookings";
import AdminDashboard from "../pages/Admin/Dashboard";
import HealthPage from "../pages/Health";
import Wishlist from "../pages/Wishlist";
import FAQ from "../pages/FAQ";
import ContactUs from "../pages/ContactUs";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/tours" element={<Tours />} />
      <Route path="/tours/:id" element={<Tours />} />
      <Route path="/categories" element={<Tours />} />
      <Route path="/tours/details/:id" element={<TourDetail />} />
      <Route
        path="/booking/start/:tourId"
        element={
          <ProtectedRoute>
            <BookingStart />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/oauth2-success" element={<OAuth2Success />} />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute>
            <CustomerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/bookings"
        element={
          <ProtectedRoute>
            <CustomerBookings />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/*" element={<AdminDashboard />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
    </Routes>
  );
};

export default AppRoutes;
