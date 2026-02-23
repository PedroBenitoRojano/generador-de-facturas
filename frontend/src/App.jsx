import React, { useState } from 'react'
import {
    FileText,
    Users,
    Settings,
    CreditCard,
    LayoutDashboard,
    LogOut,
    PlusCircle,
    Menu
} from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './components/LoginPage'
import { useInvoiceData } from './hooks/useInvoiceData'
import { Dashboard } from './components/Dashboard'
import { RecipientList } from './components/RecipientList'
import { AccountList } from './components/AccountList'
import { InvoiceEditor } from './components/InvoiceEditor'
import { Sidebar } from './components/Sidebar'
import { WebTerminal } from './components/Terminal/WebTerminal'
import { InvoiceList } from './components/InvoiceList'

function App() {
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const {
        data,
        loading,
        toggleRecipientFavorite,
        addTemplate,
        addAccount,
        deleteAccount,
        updateNextInvoiceNumber // Ensure this exists or fallback
    } = useInvoiceData()
    const [selectedTemplate, setSelectedTemplate] = useState(null)

    if (!user) {
        return <LoginPage />
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-indigo-400 animate-pulse font-outfit text-xl tracking-tight">Syncing your business...</div>
            </div>
        )
    }

    const handleGenerateFromTemplate = (template) => {
        setSelectedTemplate(template)
        setActiveTab('editor')
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard data={data} onGenerateFromTemplate={handleGenerateFromTemplate} />
            case 'invoices':
                return <InvoiceList invoices={data.invoices || []} recipients={data.recipients} />
            case 'recipients':
                return <RecipientList recipients={data.recipients} onToggleFavorite={toggleRecipientFavorite} />
            case 'accounts':
                return <AccountList accounts={data.issuer.accounts} onAdd={addAccount} onDelete={deleteAccount} />
            case 'terminal':
                return (
                    <div className="h-[calc(100vh-280px)] min-h-[500px]">
                        <WebTerminal data={data} onClose={() => setActiveTab('dashboard')} />
                    </div>
                )
            case 'editor':
                return (
                    <InvoiceEditor
                        initialData={selectedTemplate}
                        data={data}
                        onSave={(invoice) => {
                            addTemplate(invoice);
                            setActiveTab('dashboard');
                            setSelectedTemplate(null);
                        }}
                        onCancel={() => { setActiveTab('dashboard'); setSelectedTemplate(null); }}
                        onDownloadComplete={(num) => updateNextInvoiceNumber && updateNextInvoiceNumber(num)}
                    />
                )
            default:
                return (
                    <div className="glass-effect p-12 text-center rounded-2xl border-dashed">
                        <p className="text-zinc-500 italic">This section is being polished.</p>
                    </div>
                )
        }
    }

    return (
        <div className="main-layout">
            <Sidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                logout={logout}
                isMobileOpen={isMobileMenuOpen}
                setIsMobileOpen={setIsMobileMenuOpen}
            />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                            <FileText className="text-white" size={18} />
                        </div>
                        <span className="font-bold text-gray-900 tracking-tight">InvoiceFlow</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto bg-white">
                    <div className="content-area">
                        {/* Dynamic Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-12 border-b border-gray-50">
                            <div>
                                <h2 className="text-4xl font-bold font-outfit text-gray-900 tracking-tight capitalize">
                                    {activeTab === 'editor' ? 'New Invoice' : activeTab.replace('-', ' ')}
                                </h2>
                                <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_8px_rgba(225,29,72,0.3)]"></span>
                                    {activeTab === 'dashboard' && 'Your billing overview.'}
                                    {activeTab === 'invoices' && 'Complete invoice history.'}
                                    {activeTab === 'recipients' && 'Managed client directory.'}
                                    {activeTab === 'accounts' && 'Receiving bank details.'}
                                    {activeTab === 'terminal' && 'Retro console access.'}
                                </p>
                            </div>

                            {activeTab !== 'editor' && (
                                <button
                                    onClick={() => { setSelectedTemplate(null); setActiveTab('editor'); }}
                                    className="btn-primary"
                                >
                                    <PlusCircle size={20} />
                                    <span>Create Invoice</span>
                                </button>
                            )}
                        </div>

                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default App
