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

    // For development, allow access without login
    const user = session?.user || {
        name: 'Guest Explorer',
        email: 'guest@example.com',
        image: null,
    };

    return (
        <div className="min-h-screen bg-bg-base">
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
            <main className="lg:pl-64 pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
