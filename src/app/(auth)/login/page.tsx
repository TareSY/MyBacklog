'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login, loginWithGoogle } from '@/lib/actions/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { Library, Mail, Lock, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            await login(formData);
        } catch (err: any) {
            setError('Invalid email or password');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 starfield" />
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-glow" />

            <Card variant="glass" className="w-full max-w-md relative z-10 animate-scale-in border-border-default/50">
                <CardHeader className="text-center pb-2">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
                        <div className="w-10 h-10 rounded-2xl gradient-magic flex items-center justify-center shadow-lg group-hover:animate-wiggle transition-transform">
                            <Library className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold gradient-text-rainbow">
                            MyBacklog
                        </span>
                    </Link>
                    <CardTitle className="text-2xl font-bold">Welcome Back!</CardTitle>
                    <CardDescription>
                        Enter your credentials to continue your adventure
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 flex items-center gap-2 text-sm text-error">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        <Input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            label="Email"
                            required
                            leftIcon={<Mail className="w-4 h-4" />}
                        />
                        <div className="space-y-1">
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                label="Password"
                                required
                                leftIcon={<Lock className="w-4 h-4" />}
                            />
                            <div className="flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary-light hover:text-primary transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={loading}
                        >
                            Log in
                            {!loading && <Sparkles className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border-subtle" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-surface px-2 text-text-muted">Or continue with</span>
                        </div>
                    </div>

                    <form action={loginWithGoogle}>
                        <Button
                            variant="secondary"
                            className="w-full"
                            type="submit"
                            leftIcon={
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            }
                        >
                            Google
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center text-sm text-text-muted">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-primary-light hover:text-primary font-medium ml-1 transition-colors">
                        Sign up
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
