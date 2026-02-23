import React from 'react';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, ShieldCheck, Zap, Globe } from 'lucide-react';

export function LoginPage() {
    const { loginWithGoogle } = useAuth();

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gray-500/5 blur-[120px] rounded-full" />

            {/* Login Card */}
            <div className="w-full max-w-sm z-10">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl shadow-xl shadow-red-500/20 mb-8 rotate-3">
                        <FileSpreadsheet className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold font-outfit text-gray-900 tracking-tight mb-3">InvoiceFlow</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Simple. Minimal. Fast.</p>
                </div>

                <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-2xl shadow-gray-200/50 space-y-10">
                    <div className="space-y-2 text-center">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sign In</h2>
                        <p className="text-sm text-gray-400 font-medium">Use your Google account to continue.</p>
                    </div>

                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-4 bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold hover:bg-red-600 transition-all duration-300 active:scale-[0.98] shadow-xl shadow-gray-900/10"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 1.16-4.53z"
                            />
                        </svg>
                        Google Account
                    </button>

                    {/* Features List */}
                    <div className="pt-10 border-t border-gray-50 flex justify-between gap-4">
                        <div className="flex flex-col items-center gap-2 flex-1">
                            <ShieldCheck className="text-red-500 opacity-60" size={20} />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">Secure</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 flex-1">
                            <Zap className="text-red-500 opacity-60" size={20} />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">Fast</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 flex-1">
                            <Globe className="text-red-500 opacity-60" size={20} />
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center leading-tight">Sync</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        © 2026 InvoiceFlow Premium
                    </p>
                </div>
            </div>
        </div>
    );
}
