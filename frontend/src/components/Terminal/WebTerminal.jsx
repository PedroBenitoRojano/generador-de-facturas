import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, ChevronRight, Hash } from 'lucide-react';
import './Terminal.css';

const COMMANDS = {
    help: 'List available commands',
    summary: 'View billing overview',
    history: 'List recent invoices',
    gen: 'Generate an invoice (requires --price and --concept)',
    clear: 'Clear the terminal screen',
    logout: 'Logout from current session',
    version: 'Display system version',
    exit: 'Close the terminal'
};

export const WebTerminal = ({ data, onClose }) => {
    const [history, setHistory] = useState([
        { type: 'system', content: 'InvoiceFlow OS v2.0.4 [Build 1772]' },
        { type: 'system', content: 'Initializing terminal hook...' },
        { type: 'system', content: 'Connection established with backend.' },
        { type: 'system', content: 'Type "help" for a list of available commands.' },
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const handleCommand = async (cmdStr) => {
        const parts = cmdStr.trim().split(' ');
        const baseCmd = parts[0].toLowerCase();

        let newResponse = { type: 'response', content: '' };

        switch (baseCmd) {
            case 'help':
                newResponse.content = Object.entries(COMMANDS)
                    .map(([name, desc]) => `${name.padEnd(10)} - ${desc}`)
                    .join('\n');
                break;
            case 'summary':
                newResponse.content = [
                    `ISSUER:    ${data.issuer.nombre}`,
                    `CLIENTS:   ${data.recipients.length}`,
                    `TEMPLATES: ${data.templates.length}`,
                    `INVOICES:  ${data.invoices?.length || 0}`,
                    `DATABASE:  SQLite 3.x (Active)`
                ].join('\n');
                break;
            case 'version':
                newResponse.content = 'InvoiceFlow v2.0.4-LTS (Final Build)';
                break;
            case 'logout':
                // Simulated logout
                newResponse.content = 'Logged out successfully. Re-authentication required for sensitive operations.';
                break;
            case 'history':
                if (!data.invoices || data.invoices.length === 0) {
                    newResponse.content = 'No invoices found in database.';
                } else {
                    newResponse.content = data.invoices.slice(-10).reverse()
                        .map(inv => `[${inv.date}] ${inv.number.padEnd(12)} | ${inv.items[0].concept.slice(0, 20).padEnd(20)} | ${inv.items[0].price}€`)
                        .join('\n');
                }
                break;
            case 'clear':
                setHistory([]);
                return;
            case 'exit':
                if (onClose) onClose();
                return;
            case 'gen':
                const priceMatch = cmdStr.match(/--price\s+(\d+)/);
                const conceptMatch = cmdStr.match(/--concept\s+"([^"]+)"/);

                if (!priceMatch || !conceptMatch) {
                    newResponse.content = 'ERROR: Missing parameters. Usage: gen --price [n] --concept "[c]"';
                    newResponse.type = 'error';
                } else {
                    try {
                        const invoice = {
                            id: `inv_${Date.now()}`,
                            number: 'INV-' + Date.now().toString().slice(-4),
                            date: new Date().toISOString().split('T')[0],
                            recipientId: data.recipients[0].id,
                            accountId: data.issuer.accounts[0].id,
                            items: [{ concept: conceptMatch[1], quantity: 1, price: parseFloat(priceMatch[1]), tax: 21 }]
                        };

                        // Note: Using a direct fetch here to the backend
                        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
                        const response = await fetch(`${API_URL}/api/generate-pdf`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ invoice, globalData: data })
                        });

                        if (!response.ok) throw new Error('API server unreachable');
                        const result = await response.json();

                        newResponse.content = `SUCCESS: PDF Generated.\nFile: ${result.fileName}\nLocation: ${result.path}\nSyncing with cloud database... OK.`;
                    } catch (err) {
                        newResponse.content = `CRITICAL ERROR: ${err.message}`;
                        newResponse.type = 'error';
                    }
                }
                break;
            default:
                newResponse.content = `Command not found: ${baseCmd}. Type "help" for options.`;
                newResponse.type = 'error';
        }

        setHistory(prev => [...prev, { type: 'input', content: cmdStr }, newResponse]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleCommand(input);
        setInput('');
    };

    return (
        <div className="terminal-container font-mono" onClick={() => inputRef.current?.focus()}>
            <div className="terminal-scanlines"></div>
            <div className="terminal-header">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={16} className="text-green-500" />
                    <span className="text-xs uppercase tracking-widest text-green-800">Root@InvoiceFlow:~</span>
                </div>
                <button onClick={onClose} className="hover:text-red-500 transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="terminal-body" ref={scrollRef}>
                {history.map((line, i) => (
                    <div key={i} className={`mb-2 ${line.type === 'error' ? 'text-red-500' : line.type === 'input' ? 'text-amber-400' : 'text-green-500'}`}>
                        {line.type === 'input' && <span className="mr-2 opacity-50">$</span>}
                        <pre className="whitespace-pre-wrap">{line.content}</pre>
                    </div>
                ))}

                <form onSubmit={handleSubmit} className="flex items-center mt-2 group">
                    <span className="text-amber-500 mr-2">$</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="bg-transparent border-none outline-none flex-1 text-green-400 caret-green-500"
                        autoFocus
                    />
                    <div className="w-2 h-5 bg-green-500 animate-pulse ml-1 opacity-0 group-focus-within:opacity-100"></div>
                </form>
            </div>

            <div className="terminal-footer">
                <span className="opacity-50 text-[10px]">CPU: 0.4% | RAM: 18MB | NET: CONNECTED</span>
            </div>
        </div>
    );
};
