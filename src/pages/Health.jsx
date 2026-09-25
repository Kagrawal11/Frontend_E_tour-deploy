'use client';

import { useState, useEffect } from 'react';
import { healthAPI } from '../api';

export default function HealthPage() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchHealth = async () => {
        try {
            const res = await healthAPI.getHealth();
            const data = res.data;
            setHealth(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError('System Unreachable');
            setHealth(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
    };

    if (loading && !health) {
        return <div className="p-10 text-slate-500">Loading system status...</div>;
    }

    if (error) {
        return (
            <div className="p-10 font-mono text-sm">
                <div className="text-rose-400 font-bold mb-2">SYSTEM STATUS: OFFLINE</div>
                <div className="text-slate-500">{error}</div>
                <button onClick={() => { setLoading(true); fetchHealth(); }} className="mt-4 underline hover:text-white">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 font-mono text-sm">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 border-b border-white/10 pb-4 flex justify-between items-end">
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">SYSTEM HEALTH</h1>
                        <p className="text-slate-500 mt-1">Status: <span className={health.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.status}</span></p>
                    </div>
                    {lastUpdated && <div className="text-slate-600 text-xs">Updated: {lastUpdated.toLocaleTimeString()}</div>}
                </header>

                <div className="space-y-8">
                    {/* Database */}
                    {health.components?.db && (
                        <div>
                            <h2 className="font-bold text-slate-100 mb-2 border-b border-white/10 pb-1">DATABASE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-slate-500">Status</span>
                                <span className={health.components.db.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.db.status}</span>
                                <span className="text-slate-500">Engine</span>
                                <span>{health.components.db.details?.database}</span>
                            </div>
                        </div>
                    )}

                    {/* Disk */}
                    {health.components?.diskSpace && (
                        <div>
                            <h2 className="font-bold text-slate-100 mb-2 border-b border-white/10 pb-1">DISK SPACE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-slate-500">Status</span>
                                <span className={health.components.diskSpace.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.diskSpace.status}</span>
                                <span className="text-slate-500">Free / Total</span>
                                <span>{formatSize(health.components.diskSpace.details?.free)} / {formatSize(health.components.diskSpace.details?.total)}</span>
                            </div>
                        </div>
                    )}

                    {/* Mail */}
                    {health.components?.mail && (
                        <div>
                            <h2 className="font-bold text-slate-100 mb-2 border-b border-white/10 pb-1">MAIL SERVICE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-slate-500">Status</span>
                                <span className={health.components.mail.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.mail.status}</span>
                                <span className="text-slate-500">Location</span>
                                <span>{health.components.mail.details?.location}</span>
                            </div>
                        </div>
                    )}

                    {/* SSL */}
                    {health.components?.ssl && (
                        <div>
                            <h2 className="font-bold text-slate-100 mb-2 border-b border-white/10 pb-1">SSL CERTIFICATE</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <span className="text-slate-500">Status</span>
                                <span className={health.components.ssl.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.ssl.status}</span>
                            </div>
                        </div>
                    )}

                    {/* Runtime States */}
                    {(health.components?.livenessState || health.components?.readinessState || health.components?.ping) && (
                        <div>
                            <h2 className="font-bold text-slate-100 mb-2 border-b border-white/10 pb-1">SYSTEM RUNTIME</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {health.components?.livenessState && (
                                    <>
                                        <span className="text-slate-500">Liveness</span>
                                        <span className={health.components.livenessState.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.livenessState.status}</span>
                                    </>
                                )}
                                {health.components?.readinessState && (
                                    <>
                                        <span className="text-slate-500">Readiness</span>
                                        <span className={health.components.readinessState.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.readinessState.status}</span>
                                    </>
                                )}
                                {health.components?.ping && (
                                    <>
                                        <span className="text-slate-500">Ping</span>
                                        <span className={health.components.ping.status === 'UP' ? 'text-emerald-400' : 'text-rose-400'}>{health.components.ping.status}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}