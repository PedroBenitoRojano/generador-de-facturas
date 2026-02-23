import React from 'react';
import { LogIn, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
    const { loginWithGoogle } = useAuth();

    const handleLogin = async () => {
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error("Login failed", error);
            alert("Failed to sign in with Google. Check Firebase configuration.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.05),transparent)]">
            <div className="glass-card max-w-md w-full p-12 flex flex-col items-center gap-8 text-center border-indigo-500/20">
                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                    <FileText className="text-white" size={32} />
                </div>

                <div>
                    <h1 className="text-3xl font-bold font-outfit text-white mb-2">InvoiceFlow</h1>
                    <p className="text-slate-400">Manage your business like a pro. Sign in to sync your data across devices.</p>
                </div>

                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-4 px-6 rounded-xl hover:bg-slate-100 transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="20" alt="Google" />
                    Sign in with Google
                </button>

                <p className="text-xs text-slate-500 max-w-[200px]">
                    Your invoices and recipient data will be securely stored in your personal cloud.
                </p>
            </div>
        </div>
    );
}
