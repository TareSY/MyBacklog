import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Header, Sidebar } from '@/components/layout';
import { logout } from '@/lib/actions/auth';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Redirect unauthenticated users to login
    if (!session?.user) {
        redirect('/login');
    }

    const user = session.user;

    return (
        <div className="min-h-screen bg-bg-base">
            {/* Skip link for keyboard navigation */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none"
            >
                Skip to main content
            </a>
            <Header
                user={{
                    email: user.email || '',
                    username: user.name || undefined,
                    avatarUrl: user.image || undefined,
                }}
                onLogout={async () => {
                    'use server';
                    await logout();
                }}
            />
            <Sidebar />
            <main
                id="main-content"
                className="lg:pl-64 pt-16 min-h-screen"
                role="main"
                aria-label="Main content"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-safe">
                    {children}
                </div>
            </main>
        </div>
    );
}
