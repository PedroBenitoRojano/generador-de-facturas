import React, { useState } from 'react'
import { CreditCard, Plus, Trash2 } from 'lucide-react'

export function AccountList({ accounts, onAdd, onDelete }) {
    const [isAdding, setIsAdding] = useState(false)
    const [newAccount, setNewAccount] = useState({ name: '', iban: '' })

    const handleAdd = () => {
        if (newAccount.name && newAccount.iban) {
            onAdd({ ...newAccount, id: crypto.randomUUID() })
            setNewAccount({ name: '', iban: '' })
            setIsAdding(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bank Accounts</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                    <Plus size={16} />
                    Add Account
                </button>
            </div>

            {isAdding && (
                <div className="glass-card p-6 border-indigo-500/30 animate-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            placeholder="Account Name (e.g. Business Main)"
                            className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                            value={newAccount.name}
                            onChange={e => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <input
                            placeholder="IBAN / Account Number"
                            className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                            value={newAccount.iban}
                            onChange={e => setNewAccount(prev => ({ ...prev, iban: e.target.value }))}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="btn-primary" onClick={handleAdd}>Save Account</button>
                        <button className="px-4 py-2 border border-slate-700 rounded-lg hover:bg-slate-800" onClick={() => setIsAdding(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map(account => (
                    <div key={account.id} className="glass-card p-6 flex justify-between items-center group">
                        <div className="flex gap-4 items-center">
                            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold">{account.name}</h4>
                                <p className="text-sm text-slate-400 font-mono tracking-tight">{account.iban}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onDelete(account.id)}
                            className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
