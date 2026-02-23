import React from 'react';
import { Play, Star, Clock, Zap, User, ArrowRight } from 'lucide-react';

export function Dashboard({ data, onGenerateFromTemplate }) {
    const { templates = [], recipients = [] } = data;
    const favorites = recipients.filter(r => r.isFavorite);

    return (
        <div className="space-y-12 pb-20">
            {/* Quick Stats or Overview could go here if data allowed */}

            {/* Recurring Section */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Zap size={20} />
                    </div>
                    <h3 className="text-xl font-bold font-outfit text-white tracking-tight">Recurring Templates</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {templates.length > 0 ? (
                        templates.map((template, idx) => (
                            <div
                                key={idx}
                                className="bg-white border border-gray-200 p-8 rounded-2xl group hover:border-red-500 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden h-full min-h-[160px]"
                                onClick={() => onGenerateFromTemplate(template)}
                            >
                                <div className="relative z-10 w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-2.5 py-1 bg-gray-50 rounded-full text-[10px] uppercase font-bold tracking-[0.1em] text-gray-400 border border-gray-100">
                                            Template
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            <Play size={18} fill="currentColor" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight mb-2 break-words">
                                        {template.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 leading-relaxed break-words">
                                        {template.concept}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-6 relative z-10 pt-4 border-t border-gray-50">
                                    <Clock size={14} className="opacity-50" />
                                    <span>Recent Use</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-400 font-medium">No templates yet. Create your first invoice!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Invoices Section */}
            {data.invoices && data.invoices.length > 0 && (
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-600">
                            <FileText size={20} />
                        </div>
                        <h3 className="text-xl font-bold font-outfit text-gray-900 tracking-tight">Recent Invoices</h3>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-50">
                        {data.invoices.slice(-3).reverse().map((inv) => (
                            <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{inv.number}</p>
                                        <p className="text-[10px] text-gray-500 font-medium">{inv.date} • {recipients.find(r => r.id === inv.recipientId)?.name || 'Client'}</p>
                                    </div>
                                </div>
                                <div className="text-right px-4">
                                    <p className="text-sm font-bold text-gray-900">
                                        {(inv.items?.reduce((acc, item) => acc + (item.price * (1 + (item.tax || 0) / 100)), 0))?.toFixed(2)}€
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recipients Section */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 rounded-xl text-red-600 border border-red-100 shadow-sm">
                            <Star size={22} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold font-outfit text-gray-900 tracking-tight">Recent Recipients</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Frequent clients</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {favorites.length > 0 ? (
                        favorites.map((recipient) => (
                            <div
                                key={recipient.id}
                                className="bg-white border border-gray-200 p-5 rounded-2xl hover:border-red-500 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 group relative overflow-hidden flex items-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg group-hover:bg-red-600 group-hover:text-white transition-all duration-300 flex-shrink-0">
                                    {recipient.name?.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">
                                        {recipient.name}
                                    </h4>
                                    <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">{recipient.taxId || recipient.cif}</p>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 opacity-0 group-hover:opacity-100 group-hover:text-red-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-400 text-sm italic col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">Favorite recipients will appear here.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
