import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerAPI } from '../api';
import Card from '../components/UI/Card';
import TextInput from '../components/Forms/TextInput';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if no token is present
    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-rose-400">Invalid Request</h2>
                    <p className="mt-2 text-slate-400">Missing password reset token.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="mt-4 gradient-text hover:opacity-80"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await customerAPI.resetPassword({
                token,
                newPassword: formData.password
            });
            setSuccess('Password has been reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(60% 50% at 50% 0%, rgba(124,92,255,0.12) 0%, transparent 70%)' }}></div>
            <div className="max-w-md w-full space-y-8 animate-fade-in">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-100">
                        Reset Password
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your new password below
                    </p>
                </div>

                <Card>
                    <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-rose-400/10 text-rose-300 border border-rose-400/20 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-4 bg-emerald-400/10 text-emerald-300 border border-emerald-400/20 rounded-xl text-sm">
                                {success}
                            </div>
                        )}

                        <TextInput
                            label="New Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            required
                        />

                        <TextInput
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="btn-primary group relative w-full"
                            >
                                {loading ? 'Processing...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;