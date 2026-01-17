'use client';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-base p-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📴</div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    You&apos;re Offline
                </h1>
                <p className="text-text-muted mb-6">
                    It looks like you&apos;ve lost your internet connection.
                    Some features may not be available.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}
