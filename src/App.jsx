import React, { useState } from 'react'
import {
    FileText,
    Users,
    Settings,
    PlusCircle,
    CreditCard,
    LayoutDashboard,
    LogOut
} from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { LoginPage } from './components/LoginPage'
import { useInvoiceData } from './hooks/useInvoiceData'
import { Dashboard } from './components/Dashboard'
import { RecipientList } from './components/RecipientList'
import { AccountList } from './components/AccountList'
import { InvoiceEditor } from './components/InvoiceEditor'
import { generateInvoiceHTML } from './utils/pdfTemplate'
import html2pdf from 'html2pdf.js'

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
)

function App() {
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('dashboard')
    const {
        data,
        loading,
        toggleRecipientFavorite,
        addTemplate,
        addAccount,
        deleteAccount
    } = useInvoiceData()
    const [selectedTemplate, setSelectedTemplate] = useState(null)

    if (!user) {
        return <LoginPage />
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="text-indigo-400 animate-pulse font-outfit text-xl">Loading your business data...</div>
            </div>
        )
    }

    const handleGenerateFromTemplate = (template) => {
        setSelectedTemplate(template)
        setActiveTab('editor')
    }

    const handleDownload = (invoice) => {
        const element = document.createElement('div')
        element.innerHTML = generateInvoiceHTML(invoice, data)
        const opt = {
            margin: 0,
            filename: `Factura_${invoice.number}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        html2pdf().set(opt).from(element).save()
    }

    const handleSaveTemplate = (invoice) => {
        addTemplate({
            name: `Template ${invoice.number}`,
            recipientId: invoice.recipientId,
            items: invoice.items,
            accountId: invoice.accountId,
            concept: invoice.items[0]?.concept || 'New Invoice'
        })
        alert('Template saved successfully!')
        setActiveTab('dashboard')
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard data={data} onGenerateFromTemplate={handleGenerateFromTemplate} />
            case 'recipients':
                return <RecipientList recipients={data.recipients} onToggleFavorite={toggleRecipientFavorite} />
            case 'accounts':
                return (
                    <AccountList
                        accounts={data.issuer.accounts}
                        onAdd={addAccount}
                        onDelete={deleteAccount}
                    />
                )
            case 'editor':
                return (
                    <InvoiceEditor
                        initialData={selectedTemplate}
                        data={data}
                        onSave={handleSaveTemplate}
                        onCancel={() => { setActiveTab('dashboard'); setSelectedTemplate(null); }}
                        onDownload={handleDownload}
                    />
                )
            default:
                return (
                    <div className="glass-card p-12 text-center border-dashed border-slate-700">
                        <p className="text-slate-500 italic">Feature coming soon: {activeTab} view</p>
                    </div>
                )
        }
    }

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-200">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 p-6 flex flex-col gap-8 bg-[#0f172a]/50 backdrop-blur-xl">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold font-outfit tracking-tight text-white leading-tight">InvoiceFlow</h1>
                        <span className="text-[10px] text-indigo-400 font-medium truncate max-w-[120px]">{user.email}</span>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => { setActiveTab('dashboard'); setSelectedTemplate(null); }}
                    />
                    <SidebarItem
                        icon={FileText}
                        label="Invoices"
                        active={activeTab === 'invoices'}
                        onClick={() => setActiveTab('invoices')}
                    />
                    <SidebarItem
                        icon={Users}
                        label="Recipients"
                        active={activeTab === 'recipients'}
                        onClick={() => setActiveTab('recipients')}
                    />
                    <SidebarItem
                        icon={CreditCard}
                        label="Accounts"
                        active={activeTab === 'accounts'}
                        onClick={() => setActiveTab('accounts')}
                    />
                </nav>

                <div className="mt-auto flex flex-col gap-2">
                    <SidebarItem
                        icon={Settings}
                        label="Settings"
                        active={activeTab === 'settings'}
                        onClick={() => setActiveTab('settings')}
                    />
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-outfit capitalize text-white">{activeTab === 'editor' ? 'Create Invoice' : activeTab}</h2>
                        <p className="text-slate-400">Professional cloud-synced finances.</p>
                    </div>
                    {activeTab !== 'editor' && (
                        <button
                            className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                            onClick={() => { setSelectedTemplate(null); setActiveTab('editor'); }}
                        >
                            <PlusCircle size={18} />
                            New Invoice
                        </button>
                    )}
                </header>

                {renderContent()}
            </main>
        </div>
    )
}

export default App
