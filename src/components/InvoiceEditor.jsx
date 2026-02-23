import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Download, Save, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export function InvoiceEditor({
    initialData,
    data,
    onSave,
    onCancel,
    onDownload
}) {
    const [invoice, setInvoice] = useState({
        number: initialData?.number || 'FA-' + format(new Date(), 'yyyyMMddHHmm'),
        date: format(new Date(), 'yyyy-MM-dd'),
        recipientId: initialData?.recipientId || data.recipients[0]?.id || '',
        accountId: initialData?.accountId || data.issuer.accounts[0]?.id || '',
        items: initialData?.items || [
            { id: '1', concept: '', quantity: 1, price: 0, taxType: 'IVA', taxValue: 21 }
        ],
        notes: ''
    })

    const currentRecipient = data.recipients.find(r => r.id === invoice.recipientId)
    const currentAccount = data.issuer.accounts.find(a => a.id === invoice.accountId)

    const addItem = () => {
        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, { id: crypto.randomUUID(), concept: '', quantity: 1, price: 0, taxType: 'IVA', taxValue: 21 }]
        }))
    }

    const removeItem = (id) => {
        if (invoice.items.length === 1) return
        setInvoice(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }))
    }

    const updateItem = (id, updates) => {
        setInvoice(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
        }))
    }

    const calculateTotals = () => {
        const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0)
        const iva = invoice.items.reduce((acc, item) => {
            if (item.taxType === 'IVA') {
                return acc + (item.quantity * item.price * (item.taxValue / 100))
            }
            return acc
        }, 0)
        // Applying generic IRPF (usually 15% for freelancers in Spain)
        const irpf = subtotal * 0.15
        const total = subtotal + iva - irpf

        return { subtotal, iva, irpf, total }
    }

    const { subtotal, iva, irpf, total } = calculateTotals()

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
                <button onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} />
                    Back to list
                </button>
                <div className="flex gap-3">
                    <button onClick={() => onDownload(invoice)} className="btn-primary flex items-center gap-2">
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button onClick={() => onSave(invoice)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-all">
                        <Save size={18} />
                        Save as Template
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <section className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 font-outfit">Recipient & General Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Invoice Number</label>
                                <input
                                    type="text"
                                    value={invoice.number}
                                    onChange={e => setInvoice(prev => ({ ...prev, number: e.target.value }))}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                                <input
                                    type="date"
                                    value={invoice.date}
                                    onChange={e => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Recipient</label>
                                <select
                                    value={invoice.recipientId}
                                    onChange={e => setInvoice(prev => ({ ...prev, recipientId: e.target.value }))}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                                >
                                    {data.recipients.map(r => (
                                        <option key={r.id} value={r.id}>{r.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Account</label>
                                <select
                                    value={invoice.accountId}
                                    onChange={e => setInvoice(prev => ({ ...prev, accountId: e.target.value }))}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                                >
                                    {data.issuer.accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="glass-card p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold font-outfit">Invoice Items</h3>
                            <button
                                onClick={addItem}
                                className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                            >
                                <Plus size={16} />
                                Add Line
                            </button>
                        </div>

                        <div className="space-y-4">
                            {invoice.items.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                                    <div className="flex-1">
                                        <input
                                            placeholder="Concept / Description"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
                                            value={item.concept}
                                            onChange={e => updateItem(item.id, { concept: e.target.value })}
                                        />
                                    </div>
                                    <div className="w-20">
                                        <input
                                            type="number"
                                            placeholder="Qty"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-center"
                                            value={item.quantity}
                                            onChange={e => updateItem(item.id, { quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="w-28">
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 focus:border-indigo-500 outline-none text-right"
                                            value={item.price}
                                            onChange={e => updateItem(item.id, { price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2.5 text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Preview / Summary */}
                <div className="flex flex-col gap-6">
                    <section className="glass-card p-6 bg-slate-900/80 sticky top-8">
                        <h3 className="text-lg font-bold mb-4 font-outfit">Summary</h3>
                        <div className="space-y-3 pb-6 border-b border-slate-800">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Subtotal</span>
                                <span>{subtotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">IVA (21%)</span>
                                <span>{iva.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 text-red-400">IRPF (15%)</span>
                                <span className="text-red-400">-{irpf.toFixed(2)}€</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-4">
                            <span className="text-xl font-bold font-outfit">Total</span>
                            <span className="text-2xl font-bold text-indigo-400 font-outfit">{total.toFixed(2)}€</span>
                        </div>
                    </section>

                    <section className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
                        <h4 className="text-sm font-bold text-indigo-300 uppercase mb-2">Recipient Preview</h4>
                        <div className="text-sm">
                            <p className="font-bold text-white">{currentRecipient?.name}</p>
                            <p className="text-slate-400">{currentRecipient?.address}</p>
                            <p className="text-slate-500 mt-2">Account: {currentAccount?.iban}</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
