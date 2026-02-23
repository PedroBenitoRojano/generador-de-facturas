import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Download,
    Save,
    X,
    Info,
    FileText,
    User,
    CreditCard,
    Calculator
} from 'lucide-react';
import { generateInvoiceHTML } from '../utils/pdfTemplate';
import html2pdf from 'html2pdf.js';

export function InvoiceEditor({ initialData, data, onSave, onCancel, onDownloadComplete }) {
    const [showIrpf, setShowIrpf] = useState(true);
    const [invoice, setInvoice] = useState(() => {
        if (initialData) return initialData;
        return {
            number: data.issuer.nextInvoiceNumber?.toString() || `INV-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString().split('T')[0],
            recipientId: data.recipients[0]?.id || '',
            accountId: data.issuer.accounts[0]?.id || '',
            items: [{ concept: '', quantity: 1, price: 0, tax: 21 }]
        };
    });

    // Re-aligning currentRecipient and updateItem to match original structure
    const currentRecipient = data.recipients.find(r => r.id === invoice.recipientId);

    const updateItem = (index, field, value) => {
        const newItems = [...invoice.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setInvoice({ ...invoice, items: newItems });
    };

    const addItem = () => {
        setInvoice({
            ...invoice,
            items: [...invoice.items, { concept: '', quantity: 1, price: 0, tax: 21 }]
        });
    };

    const removeItem = (index) => {
        if (invoice.items.length === 1) return;
        setInvoice({
            ...invoice,
            items: invoice.items.filter((_, i) => i !== index)
        });
    };

    const calculateTotals = () => {
        const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
        const iva = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price * (item.tax / 100)), 0);
        const irpfRate = data.issuer.irpf || 15; // Using 15 as a fallback if data.issuer.irpf is undefined
        const irpf = showIrpf ? subtotal * (irpfRate / 100) : 0;
        return { subtotal, iva, irpf, total: subtotal + iva - irpf };
    };

    const totals = calculateTotals();

    const handleDownload = () => {
        const element = document.createElement('div');
        // Ensure the PDF template knows if IRPF is enabled
        const pdfData = { ...data, issuer: { ...data.issuer, irpf: showIrpf ? data.issuer.irpf : 0 } };
        element.innerHTML = generateInvoiceHTML(invoice, pdfData);
        const opt = {
            margin: 0,
            filename: `Invoice_${invoice.number}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
        if (onDownloadComplete) onDownloadComplete(invoice.number);
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onCancel} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-3xl font-bold font-outfit text-gray-900 tracking-tight">Invoice Editor</h2>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="btn-secondary">Cancel</button>
                    <button onClick={handleDownload} className="btn-primary">
                        <Download size={18} />
                        <span>Download PDF</span>
                    </button>
                    <button onClick={() => onSave(invoice)} className="btn-primary bg-gray-900 hover:bg-black">
                        <Save size={18} />
                        <span>Save Template</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                    {/* Basic Info Card */}
                    <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><FileText size={20} /></div>
                            <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Invoice Number</label>
                                <input
                                    type="text" // Changed to text to allow INV- prefix
                                    value={invoice.number}
                                    onChange={(e) => setInvoice({ ...invoice, number: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Issue Date</label>
                                <input
                                    type="date"
                                    value={invoice.date}
                                    onChange={(e) => setInvoice({ ...invoice, date: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Recipient</label>
                            <select
                                value={invoice.recipientId} // Reverted to recipientId
                                onChange={(e) => setInvoice({ ...invoice, recipientId: e.target.value })} // Reverted to recipientId
                                className="input-field appearance-none"
                            >
                                {data.recipients.map(r => (
                                    <option key={r.id} value={r.id}>{r.name} ({r.taxId || r.cif})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><PlusCircle size={20} /></div>
                                <h3 className="text-lg font-bold text-gray-900">Invoice Items</h3>
                            </div>
                            <button
                                onClick={addItem} // Reverted to addItem function
                                className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {invoice.items.map((item, idx) => (
                                <div key={idx} className="bg-white border border-gray-100 p-6 rounded-2xl flex gap-6 items-end group hover:border-red-200 transition-all">
                                    <div className="flex-[3] space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Concept</label> {/* Reverted to Concept */}
                                        <input
                                            value={item.concept} // Reverted to concept
                                            onChange={(e) => updateItem(idx, 'concept', e.target.value)} // Reverted to updateItem
                                            placeholder="Service or product name..."
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Qty</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value))} // Reverted to updateItem
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Price</label>
                                        <input
                                            type="number"
                                            value={item.price}
                                            onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value))} // Reverted to updateItem
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2"> {/* Added back IVA % field */}
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">IVA %</label>
                                        <select
                                            className="input-field h-10 py-0 text-sm text-center cursor-pointer"
                                            value={item.tax}
                                            onChange={e => updateItem(idx, 'tax', parseInt(e.target.value))}
                                        >
                                            <option value={21}>21%</option>
                                            <option value={10}>10%</option>
                                            <option value={4}>4%</option>
                                            <option value={0}>0%</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => removeItem(idx)} // Reverted to removeItem function
                                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl mb-[2px] transition-all"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Payment Settings */}
                    <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white text-gray-400 rounded-lg border border-gray-200"><CreditCard size={18} /></div>
                            <h4 className="text-sm font-bold text-gray-900 tracking-tight">Payment Details</h4>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div
                                    onClick={() => setShowIrpf(!showIrpf)}
                                    className={`w-10 h-5 rounded-full transition-all relative ${showIrpf ? 'bg-red-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showIrpf ? 'left-6' : 'left-1'}`} />
                                </div>
                                <span className="text-xs font-bold text-gray-500 group-hover:text-gray-900 transition-colors">Apply IRPF (15%)</span>
                            </label>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Bank Account</label>
                            <select
                                value={invoice.accountId}
                                onChange={(e) => setInvoice({ ...invoice, accountId: e.target.value })}
                                className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-100"
                            >
                                {data.issuer.accounts.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre} - {a.iban.slice(-4)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-red-600 p-8 rounded-3xl text-white shadow-2xl shadow-red-500/30 space-y-6 relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between text-white/70 font-medium">
                                <span>Subtotal</span>
                                <span>{totals.subtotal.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-white/70 font-medium">
                                <span>IVA (21%)</span>
                                <span>{totals.iva.toFixed(2)}€</span>
                            </div>
                            {showIrpf && (
                                <div className="flex justify-between text-white/70 font-medium italic">
                                    <span>IRPF Retention</span>
                                    <span>-{totals.irpf.toFixed(2)}€</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-red-500 flex justify-between items-end">
                                <span className="text-sm font-bold uppercase tracking-widest text-red-100">Total Amount</span>
                                <span className="text-4xl font-bold font-outfit">{totals.total.toFixed(2)}€</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
