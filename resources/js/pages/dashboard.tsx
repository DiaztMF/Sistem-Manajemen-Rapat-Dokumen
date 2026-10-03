import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CalendarPlus,
    Clock,
    FileText,
    FolderLock,
    ListTodo,
    MapPin,
    Video,
    Users,
    CheckCircle2,
    Circle,
    ArrowRight,
    AlertCircle,
    Building2,
    ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import type { ActionItem, Auth, Meeting } from '@/types';

interface DashboardProps {
    totalMeetingsMonth: number;
    upcomingMeetingsCount: number;
    pendingActionItemsCount: number;
    recentDocumentsCount: number;
    upcomingMeetings: Meeting[];
    myActionItems: ActionItem[];
}

export default function Dashboard({
    totalMeetingsMonth,
    upcomingMeetingsCount,
    pendingActionItemsCount,
    recentDocumentsCount,
    upcomingMeetings,
    myActionItems,
}: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.user;
    const userRole = user?.role ?? 'peserta';
    const canCreateMeeting = userRole === 'admin';
    const canUploadDocument = userRole === 'admin';

    const handleToggleActionItem = (item: ActionItem) => {
        const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
        router.patch(
            `/action-items/${item.id}`,
            { status: nextStatus },
            { preserveScroll: true },
        );
    };

    const isOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return due < today;
    };

    const formatDateIndo = (dateStr: string) => {
        try {
            const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
            if (year && month && day) {
                return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });
            }
            return new Date(dateStr).toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const getMeetingTypeBadge = (type: Meeting['type']) => {
        switch (type) {
            case 'online':
                return (
                    <Badge variant="secondary" className="gap-1 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        <Video className="size-3" />
                        Online
                    </Badge>
                );
            case 'hybrid':
                return (
                    <Badge variant="secondary" className="gap-1 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        <Users className="size-3" />
                        Hybrid
                    </Badge>
                );
            case 'offline':
            default:
                return (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <MapPin className="size-3" />
                        Offline
                    </Badge>
                );
        }
    };

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Greeting & Header Section */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight">
                                Selamat Datang, {user?.name ?? 'Pengguna'}!
                            </h1>
                            <Badge variant="secondary" className="capitalize">
                                <ShieldCheck className="size-3" />
                                {userRole}
                            </Badge>
                            {user?.department && (
                                <Badge variant="outline" className="gap-1 text-muted-foreground">
                                    <Building2 className="size-3" />
                                    {user.department}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan agenda rapat kerja, tugas tindak lanjut, dan dokumen arsip Anda hari ini.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {canCreateMeeting && (
                            <Button asChild size="sm" className="gap-1.5 shadow-xs">
                                <Link href="/meetings/create">
                                    <CalendarPlus className="size-4" />
                                    Jadwalkan Rapat Baru
                                </Link>
                            </Button>
                        )}
                        {canUploadDocument && (
                            <Button asChild variant="outline" size="sm" className="gap-1.5">
                                <Link href="/documents">
                                    <FolderLock className="size-4" />
                                    Unggah Dokumen
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* 4 KPI Metric Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Rapat Bulan Ini
                            </CardTitle>
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                <CalendarCheck className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{totalMeetingsMonth}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Terjadwal pada bulan kalender ini
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Rapat Mendatang
                            </CardTitle>
                            <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
                                <Clock className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{upcomingMeetingsCount}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Agenda terdaftar siap dilaksanakan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Tindak Lanjut Aktif
                            </CardTitle>
                            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                                <ListTodo className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{pendingActionItemsCount}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Tugas pending / dalam proses
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Dokumen Terbaru
                            </CardTitle>
                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                                <FileText className="size-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{recentDocumentsCount}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Diunggah dalam 30 hari terakhir
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* 2-Column Responsive Layout */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column: Jadwal Rapat Terdekat */}
                    <div className="lg:col-span-7">
                        <Card className="h-full border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">Jadwal Rapat Terdekat</CardTitle>
                                    <CardDescription>
                                        Daftar 5 agenda rapat terdekat yang terjadwal.
                                    </CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                    <Link href="/meetings">
                                        Semua Rapat
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {upcomingMeetings && upcomingMeetings.length > 0 ? (
                                    <div className="flex flex-col divide-y divide-border/60">
                                        {upcomingMeetings.map((meeting) => (
                                            <div
                                                key={meeting.id}
                                                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-foreground hover:underline">
                                                            <Link href={`/meetings/${meeting.id}`}>{meeting.title}</Link>
                                                        </span>
                                                        {getMeetingTypeBadge(meeting.type)}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3.5" />
                                                            {formatDateIndo(meeting.date)} ({meeting.start_time.slice(0, 5)} - {meeting.end_time.slice(0, 5)} WIB)
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {meeting.type === 'online' ? (
                                                                <Video className="size-3.5" />
                                                            ) : (
                                                                <MapPin className="size-3.5" />
                                                            )}
                                                            <span className="max-w-[200px] truncate">
                                                                {meeting.location_or_link}
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>

                                                <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-center">
                                                    <Link href={`/meetings/${meeting.id}`}>
                                                        Lihat Detail
                                                    </Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                            <CalendarCheck className="size-6" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-foreground">
                                            Belum ada agenda rapat mendatang
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Agenda rapat baru akan ditampilkan di sini saat dijadwalkan.
                                        </p>
                                        {canCreateMeeting && (
                                            <Button asChild size="sm" variant="outline" className="mt-4 gap-1.5">
                                                <Link href="/meetings/create">
                                                    <CalendarPlus className="size-3.5" />
                                                    Buat Rapat Sekarang
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Tindak Lanjut Tugas Saya */}
                    <div className="lg:col-span-5">
                        <Card className="h-full border-sidebar-border/70 dark:border-sidebar-border">
                            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">Tindak Lanjut Tugas Saya</CardTitle>
                                    <CardDescription>
                                        Tugas dari notulen rapat yang ditugaskan kepada Anda.
                                    </CardDescription>
                                </div>
                                <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
                                    <Link href="/action-items">
                                        Semua Tugas
                                        <ArrowRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {myActionItems && myActionItems.length > 0 ? (
                                    <div className="flex flex-col divide-y divide-border/60">
                                        {myActionItems.map((item) => {
                                            const overdue = isOverdue(item.due_date);
                                            const isCompleted = item.status === 'completed';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActionItem(item)}
                                                        className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                                                        title={isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-500" />
                                                        ) : (
                                                            <Circle className="size-5" />
                                                        )}
                                                    </button>

                                                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <span
                                                                className={`text-sm font-medium leading-snug break-words ${
                                                                    isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                                                                }`}
                                                            >
                                                                {item.title}
                                                            </span>
                                                        </div>

                                                        {item.meeting && (
                                                            <Link
                                                                href={`/meetings/${item.meeting.id}`}
                                                                className="text-xs text-muted-foreground hover:text-foreground truncate"
                                                            >
                                                                Rapat: {item.meeting.title}
                                                            </Link>
                                                        )}

                                                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                                                            {overdue && !isCompleted ? (
                                                                <Badge variant="destructive" className="gap-1 text-[10px] py-0 px-1.5 h-5">
                                                                    <AlertCircle className="size-2.5" />
                                                                    Lewat Tenggat ({formatDateIndo(item.due_date)})
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    Batas: {formatDateIndo(item.due_date)}
                                                                </span>
                                                            )}

                                                            <Badge
                                                                variant="outline"
                                                                className={`text-[10px] py-0 px-1.5 h-5 capitalize ${
                                                                    item.status === 'in_progress'
                                                                        ? 'border-blue-500/30 text-blue-600 bg-blue-50/50 dark:text-blue-400 dark:bg-blue-950/50'
                                                                        : 'text-muted-foreground'
                                                                }`}
                                                            >
                                                                {item.status === 'in_progress' ? 'Dalam Proses' : 'Tertunda'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-muted p-3 text-muted-foreground">
                                            <ListTodo className="size-6" />
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-foreground">
                                            Tidak ada tugas tindak lanjut aktif
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Semua tindak lanjut rapat Anda sudah selesai atau belum ditugaskan.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
