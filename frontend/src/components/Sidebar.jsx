import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Terminal,
    Hash,
    Activity
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${active
            ? 'bg-zinc-800 text-white shadow-lg'
            : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
    >
        <Icon size={18} className={`${active ? 'text-red-500' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`} />
        <span className={`font-medium text-sm tracking-tight ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
        {active && (
            <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        )}
    </button>
);

export function Sidebar({ user, activeTab, setActiveTab, logout, isMobileOpen, setIsMobileOpen }) {
    const navItems = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'terminal', label: 'Terminal OS', icon: Terminal },
        { id: 'invoices', label: 'Logs / History', icon: FileText },
        { id: 'recipients', label: 'Entities', icon: Users },
        { id: 'accounts', label: 'Vault', icon: CreditCard },
    ];

    return (
        <>
            {isMobileOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Brand Header */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-md flex items-center justify-center">
                        <Activity className="text-red-500" size={16} />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-[0.2em] uppercase leading-none">InvoiceFlow</h1>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Terminal Interface</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-1.5 flex-1 pr-2 -mr-2 overflow-y-auto">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-700 font-bold mb-4 px-4 italic">Core Modules</p>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsMobileOpen(false);
                            }}
                        />
                    ))}
                </nav>

                {/* User Persistence Area */}
                <div className="mt-8 pt-8 border-t border-zinc-800">
                    <div className="flex items-center gap-3 px-3 mb-6 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                        <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                            {user.display_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-zinc-200 truncate uppercase tracking-wider">{user.display_name}</p>
                            <p className="text-[9px] text-zinc-500 truncate font-mono">STATUS: ONLINE</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group"
                        >
                            <LogOut size={16} />
                            <span className="font-bold text-[11px] tracking-widest uppercase">Terminate</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
