'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register } from '@/lib/actions/auth';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui';
import { Library, Mail, Lock, User, Sparkles, AlertCircle } from 'lucide-react';

export default function SignupPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const result = await register(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
            // If no error, signIn will redirect automatically
        } catch (err: any) {
            // Fallback for unexpected errors
            setError(err.message || 'Registration failed. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 starfield" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-glow" />

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
                    <CardTitle className="text-2xl font-bold">Start Your Journey</CardTitle>
                    <CardDescription>
                        Create an account to track your entertainment world
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
                            name="username"
                            type="text"
                            placeholder="moviebuff2024"
                            label="Username"
                            required
                            autoComplete="username"
                            leftIcon={<User className="w-4 h-4" />}
                            hint="Letters, numbers, and underscores only"
                        />
                        <Input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            label="Email"
                            required
                            autoComplete="email"
                            leftIcon={<Mail className="w-4 h-4" />}
                        />
                        <div className="space-y-1">
                            <Input
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                label="Password"
                                required
                                autoComplete="new-password"
                                leftIcon={<Lock className="w-4 h-4" />}
                                hint="Must be at least 6 characters"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={loading}
                        >
                            Create Account
                            {!loading && <Sparkles className="w-4 h-4 ml-2" />}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="justify-center text-sm text-text-muted">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary-light hover:text-primary font-medium ml-1 transition-colors">
                        Log in
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
