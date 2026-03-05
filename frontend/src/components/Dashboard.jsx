import React from 'react';
import { Play, Star, Clock, Zap, Activity, Shield, Terminal as TerminalIcon, ArrowUpRight, Plus } from 'lucide-react';

const StatusCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-all group overflow-hidden relative">
        <div className="flex items-center justify-between relative z-10">
            <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{label}</p>
                <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
        <div className="absolute -bottom-2 -right-2 opacity-5 pointer-events-none">
            <Icon size={80} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

export function Dashboard({ data, onGenerateFromTemplate }) {
    const { templates = [], recipients = [], invoices = [] } = data;
    const favorites = recipients.filter(r => r.isFavorite);

    return (
        <div className="space-y-10 animate-fade-in">
            {/* System Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatusCard label="Active Clients" value={recipients.length} icon={Users} color="bg-blue-500" />
                <StatusCard label="Saved Invoices" value={invoices.length} icon={Shield} color="bg-green-500" />
                <StatusCard label="Templates" value={templates.length} icon={Zap} color="bg-amber-500" />
                <StatusCard label="System Status" value="Online" icon={Activity} color="bg-red-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Action Area: Recurring Tasks */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-6 bg-red-500 rounded-full" />
                            <h3 className="text-xl font-bold text-white tracking-tight">Recurring Procedures</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates.map((template, idx) => (
                            <div
                                key={idx}
                                onClick={() => onGenerateFromTemplate(template)}
                                className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl group hover:bg-zinc-800/50 hover:border-red-500/50 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:text-red-500 group-hover:bg-red-500/10 transition-colors">
                                        <TerminalIcon size={18} />
                                    </div>
                                    <ArrowUpRight size={16} className="text-zinc-700 group-hover:text-red-500 transition-colors" />
                                </div>
                                <h4 className="text-sm font-bold text-zinc-100 mb-1 uppercase tracking-wider">{template.name}</h4>
                                <p className="text-[11px] text-zinc-500 font-mono truncate">{template.concept}</p>
                                <div className="mt-6 flex items-center gap-2">
                                    <div className="px-2 py-0.5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-400 uppercase border border-zinc-700">Ready</div>
                                    <div className="flex-1 h-[1px] bg-zinc-800" />
                                    <span className="text-[10px] font-mono text-zinc-600">v1.0</span>
                                </div>
                            </div>
                        ))}
                        <button
                            className="bg-zinc-950 border border-zinc-800 border-dashed p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-zinc-600 hover:text-red-500 hover:border-red-500/50 hover:bg-zinc-900/50 transition-all"
                        >
                            <Plus size={20} />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Add New Routine</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar Info Area: Trusted Entities */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Trusted Entities</h3>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 divide-y divide-zinc-800/50">
                        {favorites.map((recipient) => (
                            <div key={recipient.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    {recipient.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-zinc-300 truncate">{recipient.name}</p>
                                    <p className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase">{recipient.taxId || recipient.cif}</p>
                                </div>
                                <Star size={14} fill="#3b82f6" className="text-blue-500 opacity-40" />
                            </div>
                        ))}
                    </div>

                    {/* Quick System Log */}
                    <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">System Log</p>
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 text-[10px] font-mono text-zinc-600">
                                <span className="text-green-500/50">[OK]</span>
                                <span>Session verified as administrator.</span>
                            </div>
                            <div className="flex items-start gap-2 text-[10px] font-mono text-zinc-600">
                                <span className="text-blue-500/50">[INFO]</span>
                                <span>Vault synced with SQLite module.</span>
                            </div>
                            <div className="flex items-start gap-2 text-[10px] font-mono text-zinc-600">
                                <span className="text-amber-500/50">[MSG]</span>
                                <span>New template 'impact_hub' detected.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Users = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
