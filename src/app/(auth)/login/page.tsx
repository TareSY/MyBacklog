'use client';

import { useState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/actions/auth';
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
