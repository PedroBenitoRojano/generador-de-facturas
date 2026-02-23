import React from 'react'
import { Zap, ArrowRight, Star } from 'lucide-react'

export function Dashboard({ data, onGenerateFromTemplate }) {
    const favorites = data.recipients.filter(r => r.isFavorite)

    return (
        <div className="flex flex-col gap-8">
            {/* Quick Actions / Templates */}
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-400" />
                    Recurring Invoices
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.templates.map(template => (
                        <div key={template.id} className="glass-card p-6 group hover:border-indigo-500/50 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Template</span>
                                <button
                                    onClick={() => onGenerateFromTemplate(template)}
                                    className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-all"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <h4 className="text-lg font-semibold mb-1">{template.name}</h4>
                            <p className="text-sm text-slate-400 line-clamp-1 mb-4">{template.concept}</p>
                            <div className="flex items-center gap-2 text-indigo-300 font-medium">
                                {template.amount}€ {template.taxType === 'IVA' ? '+ IVA' : '(Incl. IVA)'}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Favorite Recipients */}
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star size={18} className="text-amber-400" />
                    Favorite Recipients
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {favorites.map(recipient => (
                        <div key={recipient.id} className="glass-card p-4 min-w-[200px] flex flex-col items-center text-center gap-2">
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-indigo-400">
                                {recipient.name.charAt(0)}
                            </div>
                            <h4 className="font-semibold text-sm line-clamp-1">{recipient.name}</h4>
                            <p className="text-xs text-slate-500">{recipient.cif}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
