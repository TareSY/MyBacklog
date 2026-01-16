'use client';

import { Header, Sidebar } from '@/components/layout';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // Check active session
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            // For development without credentials, we don't block
            // In production, we would redirect to /login
            setUser(user || { username: 'Guest Guide', avatarUrl: null, email: 'guest@example.com' });
        };

        checkUser();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-bg-base">
            <Header user={user} onLogout={handleLogout} />
            <Sidebar />
            <main className="lg:pl-64 pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
