import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerAPI } from '../api';

const OAuth2Success = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithOAuth2 } = useAuth();
    const [error, setError] = useState(null);
    const hasProcessed = useRef(false); // Prevent multiple executions

    useEffect(() => {
        // If already processed, don't run again
        if (hasProcessed.current) {
            console.log('Already processed, skipping...');
            return;
        }

        console.log('OAuth2Success component mounted');
        console.log('Full URL:', window.location.href);

        const token = searchParams.get('token');
        console.log('Extracted token:', token);

        if (!token) {
            console.error('No token found in URL');
            setError('No authentication token received');
            setTimeout(() => navigate('/login', { replace: true }), 3000);
            return;
        }

        // Mark as processed
        hasProcessed.current = true;

        // Authenticate with the received token
        const authenticateUser = async () => {
            try {
                console.log('Calling loginWithOAuth2...');
                const result = await loginWithOAuth2(token);
                console.log('loginWithOAuth2 result:', result);

                if (result.success) {
                    console.log('Authentication successful, checking profile...');

                    // Fetch user profile to check if it's complete
                    try {
                        const profileResponse = await customerAPI.getProfile();
                        const profile = profileResponse.data;

                        console.log('Profile data:', profile);

                        // If profile is incomplete, redirect to profile page
                        if (!profile.profileCompleted) {
                            console.log('Profile incomplete, redirecting to profile page');
                            navigate('/customer/profile', { replace: true });
                        } else if (profile.customerRole === 'ADMIN') {
                            console.log('Admin user, redirecting to admin dashboard');
                            navigate('/admin', { replace: true });
                        } else {
                            console.log('Profile complete, redirecting to tours');
                            navigate('/tours', { replace: true });
                        }
                    } catch (profileError) {
                        console.error('Error fetching profile:', profileError);
                        // If profile fetch fails, still redirect to tours
                        navigate('/tours', { replace: true });
                    }
                } else {
                    console.error('Authentication failed:', result.error);
                    setError('Authentication failed. Redirecting to login...');
                    setTimeout(() => navigate('/login', { replace: true }), 3000);
                }
            } catch (err) {
                console.error('Error during authentication:', err);
                setError('An error occurred. Redirecting to login...');
                setTimeout(() => navigate('/login', { replace: true }), 3000);
            }
        };

        authenticateUser();
    }, []); // Empty dependency array - only run once on mount

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(60% 50% at 50% 50%, rgba(124,92,255,0.12) 0%, transparent 70%)' }}></div>
            <div className="max-w-md w-full text-center p-8">
                {error ? (
                    <div className="space-y-4">
                        <div className="text-rose-400 text-xl font-semibold">
                            {error}
                        </div>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto" style={{ borderColor: '#fb7185', borderTopColor: 'transparent' }}></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-100">
                            Completing Sign In...
                        </h2>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }}></div>
                        <p className="text-slate-400">
                            Please wait while we complete your authentication
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OAuth2Success;