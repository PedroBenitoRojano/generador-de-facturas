import React from 'react';
import { FileText, Download, ExternalLink, Calendar, Hash, DollarSign } from 'lucide-react';

export function InvoiceList({ invoices = [], recipients = [] }) {
    const getRecipientName = (id) => recipients.find(r => r.id === id)?.name || 'Unknown Client';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shadow-sm">
                    <FileText size={22} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold font-outfit text-gray-900 tracking-tight">Invoice History</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">All generated documents</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Date</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Number</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Recipient</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Concept</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {invoices.length > 0 ? invoices.slice().reverse().map((inv) => (
                            <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                        <Calendar size={14} className="text-gray-400" />
                                        {inv.date}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-900 font-bold">
                                        <Hash size={14} className="text-red-500/50" />
                                        {inv.number}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-700 font-semibold">{getRecipientName(inv.recipientId)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-500 break-words line-clamp-1">{inv.items?.[0]?.concept}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-sm text-gray-900 font-bold">
                                        {(inv.items?.reduce((acc, item) => acc + (item.price * (1 + (item.tax || 0) / 100)), 0))?.toFixed(2)}€
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                            <Download size={18} />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <FileText size={40} strokeWidth={1} />
                                        <p className="font-medium">No invoices found. Generate your first one via CLI or Dashboard.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
