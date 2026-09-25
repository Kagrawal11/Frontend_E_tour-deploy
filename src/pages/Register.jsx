import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import TextInput from '../components/Forms/TextInput';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // Password validation matching backend
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = [];

      if (formData.password.length < 8) {
        passwordErrors.push('at least 8 characters');
      }
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        passwordErrors.push('one uppercase letter');
      }
      if (!/(?=.*[a-z])/.test(formData.password)) {
        passwordErrors.push('one lowercase letter');
      }
      if (!/(?=.*\d)/.test(formData.password)) {
        passwordErrors.push('one number');
      }
      if (!/(?=.*[@#$%^&+=])/.test(formData.password)) {
        passwordErrors.push('one special character (@#$%^&+=)');
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain ${passwordErrors.join(', ')}`;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Remove confirmPassword before sending to backend
    const { confirmPassword, ...rest } = formData;

    const payload = {
      ...rest,
      customerRole: 'CUSTOMER',
      authProvider: 'LOCAL',
      profileCompleted: true
    };

    const result = await register(payload);

    if (result?.success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(124,92,255,0.12) 0%, transparent 70%)' }}></div>
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-slate-100">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium gradient-text hover:opacity-80"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="First name"
                required
              />

              <TextInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Last name"
                required
              />
            </div>

            <TextInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <TextInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Mobile Number"
              required
            />

            <TextInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              placeholder="Enter your address"
              required
            />

            <TextInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a password"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Must contain: 8+ characters, uppercase, lowercase, number, and special character (@#$%^&+=)
            </p>

            <TextInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm your password"
              required
            />

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 accent-[#7c5cff] border-white/20 rounded"
              />
              <label
                htmlFor="agree-terms"
                className="ml-2 block text-sm text-slate-300"
              >
                I agree to the{' '}
                <a href="#" className="gradient-text hover:opacity-80">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="gradient-text hover:opacity-80">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-slate-500" style={{ background: 'var(--color-surface)' }}>Or continue with</span>
              </div>
            </div>

            {/* Google Sign Up Button */}
            <div>
              <button
                type="button"
                onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google-login`}
                className="btn-secondary w-full flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
