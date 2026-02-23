import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, ShieldCheck, Globe, Building2, Copy, Check } from 'lucide-react';

export function AccountList({ accounts, onAdd, onDelete }) {
    const [isAdding, setIsAdding] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [newAccount, setNewAccount] = useState({ name: '', iban: '', swift: '' });

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(newAccount);
        setNewAccount({ name: '', iban: '', swift: '' });
        setIsAdding(false);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold font-outfit text-white tracking-tight">Bank Accounts</h3>
                    <p className="text-zinc-500 text-sm mt-1">Management of your payout destinations.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn-secondary"
                >
                    {isAdding ? <Trash2 size={18} /> : <Plus size={18} />}
                    <span>{isAdding ? 'Cancel' : 'Add Account'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="glass-effect p-8 rounded-3xl border border-indigo-500/20 max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Account Label (e.g., Professional Operating)</label>
                            <input
                                required
                                className="input-field"
                                value={newAccount.name}
                                onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                placeholder="Bank Name / Purpose"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">IBAN Number</label>
                            <input
                                required
                                className="input-field"
                                value={newAccount.iban}
                                onChange={e => setNewAccount({ ...newAccount, iban: e.target.value })}
                                placeholder="ES00 0000..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">SWIFT / BIC</label>
                            <input
                                className="input-field"
                                value={newAccount.swift}
                                onChange={e => setNewAccount({ ...newAccount, swift: e.target.value })}
                                placeholder="BANKESMM..."
                            />
                        </div>
                        <button type="submit" className="btn-primary col-span-full justify-center py-4 mt-2">
                            <Plus size={20} /> Register Account
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {accounts.map((account) => (
                    <div key={account.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 md:p-8 group relative overflow-hidden transition-all hover:bg-zinc-900/60">
                        {/* Decorative background logo */}
                        <Building2 className="absolute -right-8 -bottom-8 text-white/[0.02] w-48 h-48 -rotate-12 group-hover:text-white/[0.04] transition-colors" />

                        <div className="flex items-start justify-between relative z-10">
                            <div className="space-y-4 flex-1">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <CreditCard size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white tracking-tight">{account.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <ShieldCheck size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Verified Account</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="group/item">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1 flex items-center gap-2">
                                            IBAN <Globe size={10} />
                                        </p>
                                        <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                                            <code className="text-zinc-300 font-mono text-sm tracking-wider">{account.iban}</code>
                                            <button
                                                onClick={() => handleCopy(account.id + '-iban', account.iban)}
                                                className="text-zinc-600 hover:text-white transition-colors p-1"
                                            >
                                                {copiedId === account.id + '-iban' ? <Check size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {account.swift && (
                                        <div className="group/item">
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">SWIFT / BIC</p>
                                            <div className="flex items-center justify-between bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                                                <code className="text-zinc-300 font-mono text-sm tracking-wider">{account.swift}</code>
                                                <button
                                                    onClick={() => handleCopy(account.id + '-swift', account.swift)}
                                                    className="text-zinc-600 hover:text-white transition-colors p-1"
                                                >
                                                    {copiedId === account.id + '-swift' ? <Check size={14} /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => onDelete(account.id)}
                                className="p-2 text-zinc-700 hover:text-rose-400 transition-colors relative z-10"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {accounts.length === 0 && !isAdding && (
                <div className="text-center py-20 glass-effect border-dashed rounded-3xl">
                    <Building2 className="mx-auto text-zinc-700 mb-4" size={40} />
                    <p className="text-zinc-500 italic">No bank accounts registered. Add one to start billing.</p>
                </div>
            )}
        </div>
    );
}
