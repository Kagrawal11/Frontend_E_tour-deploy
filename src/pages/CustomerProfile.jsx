import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/UI/Card';
import TextInput from '../components/Forms/TextInput';
import { customerAPI } from '../api';

const CustomerProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  // Fetch profile data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await customerAPI.getProfile();
      const profileData = response.data;

      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || ''
      });

      // Check if profile is incomplete
      // Only force edit on FIRST load, logic handled by initial state or manual click to avoid loops
      // if (!profileData.profileCompleted) {
      //   setIsEditing(true);
      // }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setSuccessMessage('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 3) {
      newErrors.firstName = 'First name must be at least 3 characters';
    } else if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = 'First name must contain only letters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[A-Za-z]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Last name must contain only letters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // For Google OAuth2 users with incomplete profiles, phone and address are REQUIRED
    const isGoogleUserWithIncompleteProfile =
      profile?.authProvider === 'GOOGLE' && !profile?.profileCompleted;

    if (isGoogleUserWithIncompleteProfile) {
      // Phone is required for Google users
      if (!formData.phone || !formData.phone.trim()) {
        newErrors.phone = 'Phone number is required for Google login users';
      } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)';
      }

      // Address is required for Google users
      if (!formData.address || !formData.address.trim()) {
        newErrors.address = 'Address is required for Google login users';
      }
    } else {
      // For non-Google users or completed profiles, phone is optional but must be valid if provided
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)';
      }
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

    setUpdating(true);
    try {
      await customerAPI.updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setErrors({ submit: errorMessage });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || ''
    });
    setErrors({});
    setSuccessMessage('');

    // Don't allow cancel if profile is incomplete
    if (profile?.profileCompleted) {
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }}></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-slate-400">Unable to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary text-sm"
            >
              {profile.profileCompleted ? 'Edit Profile' : 'Complete Profile'}
            </button>
          )}
        </div>

        {!profile.profileCompleted && (
          <div className="mb-6 bg-amber-400/10 border border-amber-400/20 text-amber-300 px-4 py-3 rounded-xl">
            <p className="font-semibold">⚠️ Complete Your Profile</p>
            <p className="text-sm">Please complete your profile information to continue using the platform.</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 px-4 py-3 rounded-xl">
            {successMessage}
          </div>
        )}

        {errors.submit && (
          <div className="mb-6 bg-rose-400/10 border border-rose-400/20 text-rose-300 px-4 py-3 rounded-xl">
            {errors.submit}
          </div>
        )}

        <Card>
          {isEditing ? (
            <form className="p-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                disabled
              />

              <TextInput
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="10-digit phone number"
                required={profile?.authProvider === 'GOOGLE' && !profile?.profileCompleted}
              />
              <p className="mt-1 text-xs text-slate-500">
                Must be 10 digits starting with 6, 7, 8, or 9
                {profile?.authProvider === 'GOOGLE' && !profile?.profileCompleted && ' (Required for Google login)'}
              </p>

              <TextInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="Enter your address"
                required={profile?.authProvider === 'GOOGLE' && !profile?.profileCompleted}
              />
              {profile?.authProvider === 'GOOGLE' && !profile?.profileCompleted && (
                <p className="mt-1 text-xs text-slate-500">
                  Address is required for Google login users
                </p>
              )}

              <div className="flex justify-end space-x-4">
                {profile.profileCompleted && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={updating}
                  className="btn-primary"
                >
                  {updating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                  <p className="text-slate-100">{profile.firstName || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                  <p className="text-slate-100">{profile.lastName || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <p className="text-slate-100">{profile.email || '-'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                <p className="text-slate-100">{profile.phone || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                <p className="text-slate-100">{profile.address || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Auth Provider</label>
                <p className="text-slate-100 capitalize">{profile.authProvider?.toLowerCase() || '-'}</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
