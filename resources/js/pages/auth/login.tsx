import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, LogIn, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');

    const demoUsers = [
        { label: 'Admin', role: 'Administrator', email: 'admin@kantor.id', icon: '👑' },
        { label: 'Pimpinan', role: 'Direktur Utama', email: 'pimpinan@kantor.id', icon: '👔' },
        { label: 'Sekretaris', role: 'Sekretaris Eksekutif', email: 'sekretaris@kantor.id', icon: '📝' },
        { label: 'Peserta', role: 'Staff TI', email: 'ti.andi@kantor.id', icon: '💼' },
    ];

    const handleQuickFill = (email: string) => {
        setEmailValue(email);
        setPasswordValue('password');
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
            <Head title="Masuk ke Portal SmartOffice SIMRAD" />

            <div className="w-full max-w-md space-y-6">
                {/* Back to Home & Logo Header */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-1">
                        <ArrowLeft className="size-3.5" />
                        Kembali ke Halaman Beranda
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-xl font-bold tracking-tight">Portal Masuk Pegawai</h1>
                        <p className="text-xs text-muted-foreground">
                            Silakan masukkan kredensial akun kantor Anda untuk melanjutkan
                        </p>
                    </div>
                </div>

                <Card className="border-border/80 shadow-sm bg-card">
                    <CardContent className="pt-6">
                        {status && (
                            <div className="mb-4 text-center text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                {status}
                            </div>
                        )}

                        {/* Quick Demo Switcher Widget */}
                        <div className="mb-6 p-3.5 rounded-lg border border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                                <Sparkles className="size-3.5" />
                                1-Klik Akun Demo (Untuk Pengujian)
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {demoUsers.map((user, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleQuickFill(user.email)}
                                        className="flex items-center gap-2 p-2 text-left rounded-md bg-background hover:bg-accent border border-border/60 transition-colors text-xs cursor-pointer shadow-2xs group"
                                    >
                                        <span className="text-base">{user.icon}</span>
                                        <div className="truncate">
                                            <div className="font-semibold text-foreground leading-tight group-hover:text-primary">
                                                {user.label}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                                {user.email}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs font-semibold">
                                            Alamat Email Pegawai
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={emailValue}
                                            onChange={(e) => setEmailValue(e.target.value)}
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="nama@kantor.id"
                                            className="h-9 text-sm"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-semibold">
                                                Kata Sandi (Password)
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs text-muted-foreground hover:text-foreground"
                                                    tabIndex={5}
                                                >
                                                    Lupa password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            value={passwordValue}
                                            onChange={(e) => setPasswordValue(e.target.value)}
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            className="h-9 text-sm"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                                                Ingat saya di perangkat ini
                                            </Label>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-2 gap-2 h-9 text-sm shadow-xs font-semibold"
                                        tabIndex={4}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner className="size-4" />
                                        ) : (
                                            <>
                                                <LogIn className="size-4" />
                                                Masuk ke Sistem
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>

                        {/* Internal notice */}
                        <div className="mt-5 pt-4 border-t border-border/60 text-center">
                            <p className="text-[11px] text-muted-foreground text-balance">
                                Belum memiliki akun atau lupa akses? Hubungi <span className="font-semibold text-foreground">Administrator Sistem</span> di Divisi TI.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer copyright */}
                <div className="text-center text-[11px] text-muted-foreground">
                    © {new Date().getFullYear()} SmartOffice SIMRAD. All rights reserved.
                </div>
            </div>
        </div>
    );
}
