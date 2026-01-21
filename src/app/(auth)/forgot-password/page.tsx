'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input } from '@/components/ui';
import { Library, ArrowLeft, Mail, Send, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // Simulate API call - in production this would call /api/auth/forgot-password
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSubmitted(true);
        setLoading(false);
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
                    <CardTitle className="text-2xl font-bold">
                        {submitted ? 'Check Your Email' : 'Reset Password'}
                    </CardTitle>
                    <CardDescription>
                        {submitted
                            ? 'If an account exists, you\'ll receive reset instructions'
                            : 'Enter your email to receive a password reset link'
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {submitted ? (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-success" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-text-secondary text-sm">
                                    We've sent instructions to <strong className="text-text-primary">{email}</strong>
                                </p>
                                <p className="text-text-muted text-xs">
                                    Didn't receive an email? Check your spam folder or try again.
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => { setSubmitted(false); setEmail(''); }}
                                className="w-full"
                            >
                                Try Different Email
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                label="Email Address"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                leftIcon={<Mail className="w-4 h-4" />}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={loading}
                            >
                                Send Reset Link
                                {!loading && <Send className="w-4 h-4 ml-2" />}
                            </Button>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="justify-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
