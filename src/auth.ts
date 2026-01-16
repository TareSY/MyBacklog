import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, isDatabaseConfigured } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: isDatabaseConfigured() ? DrizzleAdapter(db) : undefined,
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
        newUser: '/dashboard',
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                if (!isDatabaseConfigured()) {
                    // Mock user for development
                    console.warn('Database not configured. Using mock authentication.');
                    return {
                        id: 'mock-user-id',
                        email: credentials.email as string,
                        name: 'Guest User',
                        image: null,
                    };
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (!user.length || !user[0].password) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(password, user[0].password);

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: user[0].id,
                    email: user[0].email,
                    name: user[0].name,
                    image: user[0].image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});
