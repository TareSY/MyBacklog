import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // Return a dummy client that warns but doesn't crash immediate render
        // This allows UI development without credentials
        console.warn('Supabase credentials missing. Auth features will not work.');
        return {
            auth: {
                getUser: async () => ({ data: { user: null }, error: null }),
                getSession: async () => ({ data: { session: null }, error: null }),
                signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase credentials missing' } }),
                signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase credentials missing' } }),
                signInWithOAuth: async () => ({ data: { url: null }, error: { message: 'Supabase credentials missing' } }),
                signOut: async () => ({ error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            },
            from: () => ({
                select: () => ({
                    eq: () => ({
                        single: async () => ({ data: null, error: null }),
                        maybeSingle: async () => ({ data: null, error: null }),
                    }),
                }),
            }),
        } as any;
    }

    return createBrowserClient(supabaseUrl, supabaseKey);
}
