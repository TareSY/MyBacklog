'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toast: (message: string, type?: ToastType, duration?: number) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                dismiss(id);
            }, duration);
        }
    }, [dismiss]);

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 p-4 max-w-sm w-full pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up bg-bg-surface backdrop-blur-md',
                        t.type === 'success' && 'border-success/20 text-success',
                        t.type === 'error' && 'border-error/20 text-error',
                        t.type === 'info' && 'border-primary/20 text-primary'
                    )}
                >
                    {t.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                    {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                    {t.type === 'info' && <Info className="w-5 h-5 shrink-0" />}

                    <p className="text-sm font-medium text-text-primary flex-1">{t.message}</p>

                    <button
                        onClick={() => onDismiss(t.id)}
                        className="p-1 hover:bg-bg-elevated rounded-full transition-colors text-text-muted hover:text-text-primary"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>,
        document.body
    );
}
