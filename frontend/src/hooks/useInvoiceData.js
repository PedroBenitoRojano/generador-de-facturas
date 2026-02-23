import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { INITIAL_DATA } from '../data/initialData'

export function useInvoiceData() {
    const { user } = useAuth()
    const [data, setData] = useState(INITIAL_DATA)
    const [loading, setLoading] = useState(true)

    // Sync with Local Backend
    useEffect(() => {
        if (!user) {
            setData(INITIAL_DATA)
            setLoading(false)
            return
        }

        const fetchData = async () => {
            const remoteData = await api.get('/api/data');
            if (remoteData) {
                setData(remoteData);
            } else {
                // If new user, seed with initial data (only for owner)
                const isOwner = user.email === 'pedroantoniobenito@gmail.com'
                const seedData = isOwner ? INITIAL_DATA : {
                    ...INITIAL_DATA,
                    recipients: [],
                    templates: [],
                    issuer: { ...INITIAL_DATA.issuer, accounts: [], name: user.display_name || 'New User', email: user.email }
                }
                await api.post('/api/data', seedData);
                setData(seedData);
            }
            setLoading(false);
        };

        fetchData();
    }, [user])

    const persist = async (newData) => {
        if (!user) return
        await api.post('/api/data', newData);
    }

    const updateIssuer = (issuer) => {
        const newData = { ...data, issuer }
        setData(newData)
        persist(newData)
    }

    const addRecipient = (recipient) => {
        const newData = {
            ...data,
            recipients: [...data.recipients, { ...recipient, id: crypto.randomUUID() }]
        }
        setData(newData)
        persist(newData)
    }

    const toggleRecipientFavorite = (id) => {
        const newData = {
            ...data,
            recipients: data.recipients.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r)
        }
        setData(newData)
        persist(newData)
    }

    const addTemplate = (template) => {
        const newData = {
            ...data,
            templates: [...data.templates, { ...template, id: crypto.randomUUID() }]
        }
        setData(newData)
        persist(newData)
    }

    const addAccount = (account) => {
        const newData = {
            ...data,
            issuer: {
                ...data.issuer,
                accounts: [...data.issuer.accounts, account]
            }
        }
        setData(newData)
        persist(newData)
    }

    const deleteAccount = (id) => {
        const newData = {
            ...data,
            issuer: {
                ...data.issuer,
                accounts: data.issuer.accounts.filter(a => a.id !== id)
            }
        }
        setData(newData)
        persist(newData)
    }

    const updateNextInvoiceNumber = (num) => {
        const newData = {
            ...data,
            issuer: {
                ...data.issuer,
                nextInvoiceNumber: parseInt(num) + 1
            }
        }
        setData(newData)
        persist(newData)
    }

    const addInvoice = (invoice) => {
        const newData = {
            ...data,
            invoices: [...(data.invoices || []), { ...invoice, id: invoice.id || crypto.randomUUID() }]
        }
        setData(newData)
        persist(newData)
    }

    return {
        data,
        loading,
        updateIssuer,
        addRecipient,
        toggleRecipientFavorite,
        addTemplate,
        addAccount,
        addInvoice,
        deleteAccount,
        updateNextInvoiceNumber
    }
}
