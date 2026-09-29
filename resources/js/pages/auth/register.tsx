import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '@/components/app-logo';
import { login } from '@/routes';

export default function Register() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 sm:p-6 lg:p-8">
            <Head title="Pendaftaran Pegawai - SmartOffice SIMRAD" />

            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center text-center space-y-3">
                    <AppLogo />
                </div>

                <Card className="border-border shadow-xs bg-card">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                            <ShieldAlert className="size-5" />
                        </div>
                        <CardTitle className="text-lg">Pendaftaran Publik Ditutup</CardTitle>
                        <CardDescription>
                            Sistem Manajemen Rapat & Dokumen bersifat internal dan tertutup.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2 text-center">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Akun pegawai hanya dapat didaftarkan secara resmi oleh <span className="font-semibold text-foreground">Administrator Sistem</span> melalui menu Manajemen Pengguna.
                        </p>
                        <Button asChild className="w-full gap-2 text-xs">
                            <Link href={login()}>
                                <ArrowLeft className="size-3.5" />
                                Menuju Halaman Masuk
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
