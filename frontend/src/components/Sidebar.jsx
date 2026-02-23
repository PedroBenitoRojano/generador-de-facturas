import React from 'react';
import {
    LayoutDashboard,
    FileText,
    Users,
    CreditCard,
    Settings,
    LogOut,
    Menu,
    X,
    FileSpreadsheet,
    Terminal
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-red-50 text-red-600 border border-red-100 shadow-sm'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            }`}
    >
        <Icon size={18} className={`${active ? 'text-red-600' : 'text-gray-400 group-hover:text-gray-600'} transition-colors`} />
        <span className="font-semibold text-sm tracking-tight">{label}</span>
        {active && <div className="ml-auto w-1 h-4 bg-red-600 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.4)]" />}
    </button>
);

export function Sidebar({ user, activeTab, setActiveTab, logout, isMobileOpen, setIsMobileOpen }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'invoices', label: 'Invoices', icon: FileText },
        { id: 'recipients', label: 'Recipients', icon: Users },
        { id: 'accounts', label: 'Bank Accounts', icon: CreditCard },
        { id: 'terminal', label: 'Web Terminal', icon: Terminal },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#f9fafb] border-r border-gray-200 p-6 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Brand */}
                <div className="flex items-center gap-3 mb-10 px-1">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 rotate-3 flex-shrink-0">
                        <FileSpreadsheet className="text-white" size={22} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold font-outfit text-gray-900 tracking-tight leading-none truncate">InvoiceFlow</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1.5 opacity-60">Minimalist Billing</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2 -mr-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 px-4 opacity-50">Main Menu</p>
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

                {/* Footer / User Area */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-2 mb-6">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden ring-4 ring-gray-50 flex-shrink-0">
                            {user.avatar_url ? (
                                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                    {user.display_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.display_name}</p>
                            <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <SidebarItem
                            icon={Settings}
                            label="Settings"
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        />
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
                        >
                            <LogOut size={18} className="group-hover:text-red-600" />
                            <span className="font-semibold text-sm tracking-tight">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
