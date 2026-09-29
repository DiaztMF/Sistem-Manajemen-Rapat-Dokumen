import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck2,
    FileText,
    ListTodo,
    FolderLock,
    ArrowRight,
    LogIn,
    LayoutDashboard,
    Clock,
    Users,
    Download
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    const pillars = [
        {
            icon: CalendarCheck2,
            title: 'Penjadwalan & Presensi',
            description:
                'Susun agenda pembahasan secara terstruktur, undang peserta lintas departemen, kelola perubahan jadwal, dan catat presensi kehadiran beserta riwayatnya secara waktu nyata.',
            badge: 'Manajemen Rapat',
            badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
        {
            icon: FileText,
            title: 'Notulen & Approval Pimpinan',
            description:
                'Catat rangkuman jalannya rapat dan butir keputusan resmi. Alur verifikasi berjenjang hingga pengesahan dan cetak berkas PDF resmi berkop surat.',
            badge: 'Akuntabilitas',
            badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
            icon: ListTodo,
            title: 'Tindak Lanjut & Kanban Board',
            description:
                'Delegasikan komitmen tugas hasil rapat ke PIC yang bertanggung jawab lengkap dengan tenggat waktu, pantau progres via Kanban board interaktif.',
            badge: 'Monitoring Tugas',
            badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
            icon: FolderLock,
            title: 'Repositori Dokumen Aman',
            description:
                'Penyimpanan terenkripsi untuk surat undangan, materi paparan presentasi, notulen PDF resmi, dan berkas bukti penyelesaian tindak lanjut.',
            badge: 'Arsip Terpadu',
            badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        },
    ];

    const demoAccounts = [
        { role: 'Admin Sistem', email: 'admin@kantor.id', dept: 'Teknologi Informasi', icon: '👑' },
        { role: 'Direktur Utama (Pimpinan)', email: 'pimpinan@kantor.id', dept: 'Manajemen Eksekutif', icon: '👔' },
        { role: 'Sekretaris / Notulis', email: 'sekretaris@kantor.id', dept: 'Tata Usaha & Protokoler', icon: '📝' },
        { role: 'Peserta / Ka. Divisi TI', email: 'ti.andi@kantor.id', dept: 'Teknologi Informasi', icon: '💼' },
    ];

    return (
        <>
            <Head title="SmartOffice SIMRAD — Sistem Manajemen Rapat & Dokumen Kantor" />
            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
                {/* Navbar */}
                <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link href="/" className="flex items-center gap-2">
                            <AppLogo />
                        </Link>
                        <nav className="flex items-center gap-3">
                            <ThemeToggle className="size-9" />
                            {auth.user ? (
                                <Button asChild className="gap-2 shadow-xs">
                                    <Link href={dashboard()}>
                                        <LayoutDashboard className="size-4" />
                                        Buka Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild className="gap-2 shadow-xs">
                                    <Link href={login()}>
                                        <LogIn className="size-4" />
                                        Masuk ke Portal
                                    </Link>
                                </Button>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-border/40 bg-gradient-to-b from-muted/30 via-background to-background">
                        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                            <Badge variant="outline" className="mb-4 px-3.5 py-1 text-xs font-semibold gap-1.5 border-primary/30 text-primary bg-primary/5">
                                <Clock className="size-3.5" />
                                Sistem Informasi Internal Perkantoran Terpadu
                            </Badge>
                            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                                Kelola Seluruh Kegiatan Rapat & Arsip Dokumen Kantor Lebih Rapi
                            </h1>
                            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto text-balance">
                                Platform terintegrasi untuk menjadwalkan rapat kerja, menyusun agenda, mencatat kehadiran presensi peserta,
                                menyusun notulen terstandar dengan approval pimpinan, hingga memantau komitmen tindak lanjut hasil keputusan.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                                {auth.user ? (
                                    <Button size="lg" asChild className="gap-2 px-6 shadow-sm">
                                        <Link href={dashboard()}>
                                            Menuju Dashboard
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button size="lg" asChild className="gap-2 px-6 shadow-sm">
                                        <Link href={login()}>
                                            Masuk Sebagai Pegawai
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* 4 Pilar Fitur Utama */}
                    <section className="py-16 md:py-24">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto mb-14">
                                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                    Empat Pilar Tata Kelola Rapat Digital
                                </h2>
                                <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                                    Setiap komponen rapat saling terhubung: dari undangan awal hingga arsip berita acara dan penugasan PIC.
                                </p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {pillars.map((pillar, idx) => (
                                    <Card key={idx} className="flex flex-col justify-between border-border/80 hover:border-primary/50 transition-all hover:shadow-md">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <pillar.icon className="size-5" />
                                                </div>
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pillar.badgeColor}`}>
                                                    {pillar.badge}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg leading-snug">{pillar.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-1">
                                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                                {pillar.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Akun Demo Card */}
                    <section className="py-12 border-t border-border/50 bg-muted/20">
                        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                            <Card className="border-border shadow-xs bg-card">
                                <CardHeader className="text-center pb-4">
                                    <CardTitle className="text-xl flex items-center justify-center gap-2">
                                        <Users className="size-5 text-primary" />
                                        Akses Akun Uji Coba (Demo Accounts)
                                    </CardTitle>
                                    <CardDescription>
                                        Semua akun demo menggunakan password default: <code className="bg-muted px-2 py-0.5 rounded font-mono font-semibold text-foreground">password</code>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {demoAccounts.map((acc, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/50">
                                                <span className="text-xl">{acc.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-semibold truncate">{acc.role}</div>
                                                    <div className="text-xs text-muted-foreground truncate">{acc.dept}</div>
                                                    <div className="text-xs font-mono text-primary font-medium mt-0.5 select-all">{acc.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5 text-center">
                                        <Button asChild variant="outline" size="sm" className="gap-2">
                                            <Link href={login()}>
                                                Coba Masuk Sekarang
                                                <ArrowRight className="size-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>

                {/* Footer Resmi Internal */}
                <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground bg-muted/30">
                    <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p>© {new Date().getFullYear()} SmartOffice SIMRAD — Sistem Manajemen Rapat & Dokumen Kantor.</p>
                        <p className="text-[11px]">Portal internal terbatas untuk pegawai dan pimpinan kantor.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
