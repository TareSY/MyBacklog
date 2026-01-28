'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
    error?: Error | null;
    onReset?: () => void;
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
                Something went wrong
            </h2>
            <p className="text-text-secondary mb-6 max-w-md">
                We encountered an unexpected error. Please try again or refresh the page.
            </p>
            {onReset && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors focus-ring"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
            {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 text-left w-full max-w-md">
                    <summary className="cursor-pointer text-sm text-text-muted hover:text-text-secondary">
                        Error details (dev only)
                    </summary>
                    <pre className="mt-2 p-4 bg-bg-elevated rounded-lg text-xs text-red-400 overflow-auto">
                        {error.message}
                    </pre>
                </details>
            )}
        </div>
    );
}
