import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

import VirtugoLogo from '../../assets/images/VirtugoLogo.png';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const navLinkClass =
    'text-sm font-medium text-slate-300 hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gradient-to-r after:from-[#7c5cff] after:to-[#22d3ee] after:transition-all after:duration-300 hover:after:w-full';

  return (
    <nav className="sticky top-0 z-40 glass">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={VirtugoLogo}
                alt="Virtugo Logo"
                className="h-12 w-auto transform transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_12px_rgba(124,92,255,0.35)]"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={navLinkClass}>
              Home
            </Link>
            <Link to="/tours" className={navLinkClass}>
              Tours
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/customer/bookings" className={navLinkClass}>
                  My Bookings
                </Link>
                <Link to="/customer/profile" className={navLinkClass}>
                  Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="text-sm font-semibold gradient-text hover:opacity-80 transition-opacity">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-400">
                  Welcome, <span className="text-slate-200">{user?.email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm py-1.5 px-4"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-slate-300 hover:text-white focus:outline-none transition-colors"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 pb-6 space-y-4 px-4 animate-slide-up" style={{ borderColor: 'var(--color-border)' }}>
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-slate-300 hover:text-white font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/tours"
              onClick={() => setIsMenuOpen(false)}
              className="block text-slate-300 hover:text-white font-medium transition-colors"
            >
              Tours
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/customer/bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-slate-300 hover:text-white font-medium transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-slate-300 hover:text-white font-medium transition-colors"
                >
                  Profile
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block gradient-text font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <p className="text-sm text-slate-500 mb-2">Welcome, {user?.email}</p>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary w-full text-center"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--color-border)' }}>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-slate-200 font-medium text-center py-2"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-primary block text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
