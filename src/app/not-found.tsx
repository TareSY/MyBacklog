import Link from 'next/link';
import { Library, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg-base">
            {/* Background decorations */}
            <div className="absolute inset-0 starfield" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px]" />

            <div className="text-center relative z-10 max-w-md">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-8 group">
                    <div className="w-12 h-12 rounded-2xl gradient-magic flex items-center justify-center shadow-lg group-hover:animate-wiggle transition-transform">
                        <Library className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold gradient-text-rainbow">
                        MyBacklog
                    </span>
                </Link>

                <div className="text-8xl font-bold text-text-muted mb-4">404</div>
                <h1 className="text-2xl font-bold text-text-primary mb-4">Page Not Found</h1>
                <p className="text-text-muted mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go Home
                    </Link>
                    <button
                        onClick={() => typeof window !== 'undefined' && window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-elevated text-text-secondary font-medium hover:bg-bg-surface transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
