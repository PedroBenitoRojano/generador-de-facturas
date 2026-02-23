import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { INITIAL_DATA } from '../data/initialData'

export function useInvoiceData() {
    const { user } = useAuth()
    const [data, setData] = useState(INITIAL_DATA)
    const [loading, setLoading] = useState(true)

    // Sync with Firestore
    useEffect(() => {
        if (!user) {
            setData(INITIAL_DATA)
            setLoading(false)
            return
        }

        const userDocRef = doc(db, 'users', user.uid)

        // Listen for real-time updates
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setData(docSnap.data())
            } else {
                // Seed strictly for the owner email
                const isOwner = user.email === 'pedroantoniobenito@gmail.com'
                const seedData = isOwner ? INITIAL_DATA : {
                    ...INITIAL_DATA,
                    recipients: [],
                    templates: [],
                    issuer: { ...INITIAL_DATA.issuer, accounts: [], name: user.displayName || 'New User', email: user.email }
                }
                setDoc(userDocRef, seedData)
                setData(seedData)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user])

    // Helper to persist changes to Firestore
    const persist = async (newData) => {
        if (!user) return
        const userDocRef = doc(db, 'users', user.uid)
        await setDoc(userDocRef, newData)
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

    const addTemplate = (template) => {
        const newData = {
            ...data,
            templates: [...data.templates, { ...template, id: crypto.randomUUID() }]
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
        addTemplate
    }
}
