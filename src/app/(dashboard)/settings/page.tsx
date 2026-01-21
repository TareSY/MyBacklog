'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent, useToast } from '@/components/ui';
import { User, Mail, Key, Trash2, Save, Loader2 } from 'lucide-react';

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/notionists/svg?seed=Maya',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Kenji',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Amara',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Diego',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Priya',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Marcus',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Yuki',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Fatima',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Chen',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Aaliya',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Kofi',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Sofia',
];

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const { toast } = useToast();

    const [name, setName] = useState(session?.user?.name || '');
    const [image, setImage] = useState(session?.user?.image || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/user', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, image: image || null }),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            await update({ name, image });
            toast('Profile updated successfully!', 'success');
        } catch (error) {
            toast('Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch('/api/user', { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete account');

            window.location.href = '/';
        } catch (error) {
            toast('Failed to delete account', 'error');
            setDeleting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                    <span>Settings</span>
                    <span className="text-2xl">⚙️</span>
                </h1>
                <p className="text-text-muted mt-2">
                    Manage your account and preferences
                </p>
            </div>

            {/* Profile Settings */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Profile
                    </CardTitle>
                    <CardDescription>
                        Update your personal information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Profile Image Selection */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-text-secondary">Profile Image</label>
                            <div className="flex flex-col sm:flex-row items-start gap-6">
                                <div className="flex-shrink-0">
                                    {image ? (
                                        <div className="relative group">
                                            <img
                                                src={image}
                                                alt="Profile"
                                                className="w-24 h-24 rounded-full object-cover border-4 border-bg-elevated shadow-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setImage('')}
                                                className="absolute -top-2 -right-2 p-1.5 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/90"
                                                title="Remove photo"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-bg-elevated flex items-center justify-center border-2 border-dashed border-border-default">
                                            <User className="w-8 h-8 text-text-muted" />
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <p className="text-xs text-text-muted mb-3">Choose a preset avatar:</p>
                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                            {PRESET_AVATARS.map((avatar) => (
                                                <button
                                                    key={avatar}
                                                    type="button"
                                                    onClick={() => setImage(avatar)}
                                                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${image === avatar ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                                                >
                                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <Input
                                        placeholder="Or paste a custom image URL..."
                                        value={image.startsWith('http') && !PRESET_AVATARS.includes(image) ? image : ''}
                                        onChange={(e) => setImage(e.target.value)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border-subtle">
                            <Input
                                label="Email"
                                type="email"
                                value={session?.user?.email || ''}
                                disabled
                                leftIcon={<Mail className="w-4 h-4" />}
                            />
                            <p className="text-xs text-text-muted -mt-3 mb-2">Email cannot be changed</p>
                            <Input
                                label="Display Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                leftIcon={<User className="w-4 h-4" />}
                                placeholder="Your name"
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={saving}
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Account Security */}
            <Card variant="default">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-warning" />
                        Security
                    </CardTitle>
                    <CardDescription>
                        Manage your password and security settings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-text-muted mb-4">
                        Password management is handled through your authentication provider.
                        {session?.user?.email?.includes('@') && !session?.user?.image && (
                            <span> You signed up with email/password.</span>
                        )}
                    </p>
                    <Button variant="secondary" disabled>
                        Change Password (Coming Soon)
                    </Button>
                </CardContent>
            </Card>

            {/* Moving On */}
            <Card variant="default" className="border-warning/30">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning">
                        <Trash2 className="w-5 h-5" />
                        Time to Say Goodbye?
                    </CardTitle>
                    <CardDescription>
                        We'll miss you, but we understand! 🌟
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-text-muted mb-4">
                        If you delete your account, all your lists and saved items will be cleared.
                        No hard feelings—maybe we'll see you again someday!
                    </p>
                    <Button
                        variant="ghost"
                        className="text-error hover:bg-error/10"
                        onClick={handleDelete}
                        isLoading={deleting}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                    >
                        Delete Account
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
