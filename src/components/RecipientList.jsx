import React from 'react'
import { UserPlus, Star, Edit2, Trash2 } from 'lucide-react'

export function RecipientList({ recipients, onToggleFavorite }) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Saved Recipients</h3>
                <button className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300">
                    <UserPlus size={16} />
                    Add New Recipient
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {recipients.map(recipient => (
                    <div key={recipient.id} className="glass-card p-6 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-xl">
                                {recipient.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold">{recipient.name}</h4>
                                <p className="text-sm text-slate-400">{recipient.address}</p>
                                <p className="text-xs text-slate-500 mt-1">CIF: {recipient.cif}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onToggleFavorite(recipient.id)}
                                className={`p-2 rounded-lg transition-colors ${recipient.isFavorite ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 bg-slate-800'}`}
                            >
                                <Star size={18} fill={recipient.isFavorite ? "currentColor" : "none"} />
                            </button>
                            <button className="p-2 text-slate-400 bg-slate-800 rounded-lg hover:text-indigo-400">
                                <Edit2 size={18} />
                            </button>
                            <button className="p-2 text-slate-400 bg-slate-800 rounded-lg hover:text-red-400">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
