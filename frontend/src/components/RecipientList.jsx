import React, { useState } from 'react';
import { User, Search, Star, Trash2, Plus, ExternalLink, Mail, Shield } from 'lucide-react';

export function RecipientList({ recipients, onToggleFavorite, onDelete }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = recipients.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.taxId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        className="input-field pl-12"
                        placeholder="Filter recipients by name or tax ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Add functionality would go here */}
                <button className="btn-secondary whitespace-nowrap hidden md:flex">
                    <Plus size={18} /> Add New Recipient
                </button>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((recipient) => (
                    <div key={recipient.id} className="glass-effect group p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 relative">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                {recipient.name?.charAt(0)}
                            </div>
                            <button
                                onClick={() => onToggleFavorite(recipient.id)}
                                className={`p-2 rounded-lg transition-colors ${recipient.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-600 hover:text-amber-400 hover:bg-zinc-800'}`}
                            >
                                <Star size={18} fill={recipient.isFavorite ? 'currentColor' : 'none'} />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{recipient.name}</h4>
                            <p className="text-xs text-zinc-500 font-mono tracking-tight">{recipient.taxId}</p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <Mail size={14} className="text-zinc-600" />
                                <span className="truncate">{recipient.address || 'No address provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <Shield size={14} className="text-zinc-600" />
                                <span>Verified Client</span>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                            <button className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                <ExternalLink size={12} /> Edit Details
                            </button>
                            <button className="text-zinc-700 hover:text-rose-400 transition-colors">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/20 border border-white/5 border-dashed rounded-3xl">
                    <User className="mx-auto text-zinc-700 mb-4" size={48} />
                    <p className="text-zinc-500 italic">No recipients found matching your search.</p>
                </div>
            )}
        </div>
    );
}
