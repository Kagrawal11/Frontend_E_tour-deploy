import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../api';
import Card from '../components/UI/Card';
import TextInput from '../components/Forms/TextInput';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await customerAPI.forgotPassword(email);
            setStatus({
                type: 'success',
                message: 'Password reset link has been sent to your email.'
            });
            setEmail('');
        } catch (error) {
            setStatus({
                type: 'error',
                message: error.response?.data || 'Failed to send reset link. Please try again.'
            });
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
                        Forgot your password?
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <Card>
                    <form className="p-6 space-y-6" onSubmit={handleSubmit}>
                        {status.message && (
                            <div className={`p-4 rounded-xl border ${status.type === 'success' ? 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20' : 'bg-rose-400/10 text-rose-300 border-rose-400/20'
                                }`}>
                                {status.message}
                            </div>
                        )}

                        <TextInput
                            label="Email address"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary group relative w-full"
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </div>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="font-medium gradient-text hover:opacity-80">
                                Back to Sign in
                            </Link>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;