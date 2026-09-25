import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../api';
import Card from '../components/UI/Card';
import TextInput from '../components/Forms/TextInput';

// Google Client ID - should match backend configuration
const GOOGLE_CLIENT_ID = '974535477600-5al1igl32so6qq7erc94i20571n8v55f.apps.googleusercontent.com';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [googleError, setGoogleError] = useState('');
  const { login, loginWithOAuth2, loading } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'filled_black',
            size: 'large',
            width: googleButtonRef.current.offsetWidth,
            text: 'continue_with',
            shape: 'pill',
          }
        );
      }
    };

    // Check if the script is already loaded
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      // Wait for script to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup after 5 seconds if not loaded
      setTimeout(() => clearInterval(checkGoogleLoaded), 5000);
    }
  }, []);

  // Handle Google Sign-In callback
  const handleGoogleCallback = async (response) => {
    try {
      setGoogleError('');
      console.log('Google sign-in successful, sending token to backend...');
      
      // Send the ID token to your backend
      const backendResponse = await customerAPI.googleLogin(response.credential);
      const { token } = backendResponse.data;
      
      console.log('Backend returned JWT:', token);
      
      // Use the OAuth2 login function from AuthContext
      const result = await loginWithOAuth2(token);
      
      if (result.success) {
        console.log('Login successful, fetching profile...');
        try {
          const profileResponse = await customerAPI.getProfile();
          const profile = profileResponse.data;
          console.log('Profile data:', profile);

          if (profile.customerRole === 'ADMIN') {
            console.log('Admin detected, navigating to /admin');
            navigate('/admin');
          } else {
            console.log('Customer detected, navigating to /tours');
            navigate('/tours');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          navigate('/tours');
        }
      } else {
        setGoogleError(result.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || 'Google login failed. Please try again.';
      setGoogleError(message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    console.log('Attempting login...');
    const result = await login(formData);
    console.log('Login result:', result);

    if (result.success) {
      console.log('Login successful, fetching profile...');
      // Fetch profile to get the customer role for redirection
      try {
        const profileResponse = await customerAPI.getProfile();
        const profile = profileResponse.data;
        console.log('Profile data:', profile);

        if (profile.customerRole === 'ADMIN') {
          console.log('Admin detected, navigating to /admin');
          navigate('/admin');
        } else {
          console.log('Customer detected, navigating to /tours');
          navigate('/tours');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        navigate('/tours');
      }
    } else {
      console.log('Login failed:', result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(124,92,255,0.12) 0%, transparent 70%)' }}></div>
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Or{' '}
            <Link to="/register" className="font-medium gradient-text hover:opacity-80">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <TextInput
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <div className="mb-4">
              <TextInput
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 accent-[#7c5cff] border-white/20 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium gradient-text hover:opacity-80">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary group relative w-full"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-500" style={{ background: 'var(--color-surface)' }}>Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In Button (rendered by Google SDK) */}
            <div
              ref={googleButtonRef}
              className="w-full flex justify-center"
            ></div>

            {/* Google Error Message */}
            {googleError && (
              <div className="text-rose-400 text-sm text-center">
                {googleError}
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;