import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    CalendarCheck,
    CalendarPlus,
    Clock,
    FileText,
    Filter,
    MapPin,
    Search,
    Users,
    Video,
    X,
    ChevronRight,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Auth, Meeting } from '@/types';

interface PaginatedMeetings {
    data: (Meeting & {
        creator?: { id: number; name: string };
        agendas_count?: number;
        attendees_count?: number;
    })[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface MeetingIndexProps {
    meetings: PaginatedMeetings;
    filters: {
        status?: string;
        search?: string;
        type?: string;
        date?: string;
    };
    stats: {
        total: number;
        scheduled: number;
        in_progress: number;
        completed: number;
    };
}

export default function MeetingIndex({
    meetings,
    filters,
    stats,
}: MeetingIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userRole = auth?.user?.role ?? 'peserta';
    const canCreate = userRole === 'admin';

    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');
    const [type, setType] = useState(filters.type ?? 'all');
    const [date, setDate] = useState(filters.date ?? '');

    const applyFilter = (params: {
        search?: string;
        status?: string;
        type?: string;
        date?: string;
    }) => {
        const query: Record<string, string> = {};

        const nextSearch = params.search !== undefined ? params.search : search;
        const nextStatus = params.status !== undefined ? params.status : status;
        const nextType = params.type !== undefined ? params.type : type;
        const nextDate = params.date !== undefined ? params.date : date;

        if (nextSearch.trim()) query.search = nextSearch.trim();
        if (nextStatus && nextStatus !== 'all') query.status = nextStatus;
        if (nextType && nextType !== 'all') query.type = nextType;
        if (nextDate) query.date = nextDate;

        router.get('/meetings', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        setType('all');
        setDate('');
        router.get('/meetings', {}, { preserveState: true });
    };

    const getStatusBadge = (statusValue: Meeting['status']) => {
        switch (statusValue) {
            case 'scheduled':
                return (
                    <Badge variant="secondary" className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        Terjadwal
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="default" className="bg-amber-600 hover:bg-amber-700 text-white animate-pulse">
                        Berlangsung
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Selesai
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="destructive">
                        Dibatalkan
                    </Badge>
                );
            case 'draft':
            default:
                return (
                    <Badge variant="outline">
                        Draft
                    </Badge>
                );
        }
    };

    const getTypeBadge = (typeValue: Meeting['type']) => {
        switch (typeValue) {
            case 'online':
                return (
                    <span className="inline-flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400 font-medium">
                        <Video className="size-3.5" />
                        Online
                    </span>
                );
            case 'hybrid':
                return (
                    <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        <Users className="size-3.5" />
                        Hybrid
                    </span>
                );
            case 'offline':
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <MapPin className="size-3.5" />
                        Offline
                    </span>
                );
        }
    };

    const formatDateIndo = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        return timeStr.slice(0, 5);
    };

    const hasActiveFilters = Boolean(
        (filters.search && filters.search.length > 0) ||
        (filters.status && filters.status !== 'all') ||
        (filters.type && filters.type !== 'all') ||
        filters.date
    );

    return (
        <>
            <Head title="Manajemen Rapat" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header & Primary CTA */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Manajemen Rapat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola jadwal rapat, agenda pembahasan, daftar peserta, dan notulen keputusan.
                        </p>
                    </div>

                    {canCreate && (
                        <Button asChild className="gap-2 shrink-0">
                            <Link href="/meetings/create">
                                <CalendarPlus className="size-4" />
                                Jadwalkan Rapat Baru
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Metric Summary Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Rapat
                            </CardTitle>
                            <Calendar className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">Keseluruhan agenda rapat</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Terjadwal
                            </CardTitle>
                            <Clock className="size-4 text-sky-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-sky-600">{stats.scheduled}</div>
                            <p className="text-xs text-muted-foreground mt-1">Menunggu waktu rapat</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Berlangsung
                            </CardTitle>
                            <div className="size-2 rounded-full bg-amber-500 animate-ping" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{stats.in_progress}</div>
                            <p className="text-xs text-muted-foreground mt-1">Sedang aktif dilaksanakan</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Selesai
                            </CardTitle>
                            <CalendarCheck className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
                            <p className="text-xs text-muted-foreground mt-1">Telah rampung diselenggarakan</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="size-4 text-muted-foreground" />
                                <CardTitle className="text-base font-semibold">Filter & Pencarian</CardTitle>
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <X className="size-3.5" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                        <CardDescription>
                            Saring daftar rapat berdasarkan kata kunci judul, status kegiatan, tipe, atau tanggal.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari judul rapat..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select
                                value={status}
                                onValueChange={(val) => {
                                    setStatus(val);
                                    applyFilter({ status: val });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="scheduled">Terjadwal</SelectItem>
                                    <SelectItem value="in_progress">Berlangsung</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Filter */}
                            <Select
                                value={type}
                                onValueChange={(val) => {
                                    setType(val);
                                    applyFilter({ type: val });
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Tipe Rapat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    <SelectItem value="offline">Tatap Muka (Offline)</SelectItem>
                                    <SelectItem value="online">Daring (Online)</SelectItem>
                                    <SelectItem value="hybrid">Gabungan (Hybrid)</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Date Filter & Search trigger */}
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        applyFilter({ date: e.target.value });
                                    }}
                                    className="w-full"
                                />
                                <Button type="submit" variant="secondary" size="default" className="shrink-0">
                                    Cari
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Meetings Table & Card Listing */}
                <div className="rounded-lg border bg-card text-card-foreground shadow-xs">
                    <div className="p-4 border-b flex items-center justify-between">
                        <div className="text-sm font-medium">
                            Ditemukan <span className="font-bold">{meetings.total}</span> agenda rapat
                        </div>
                    </div>

                    {meetings.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="rounded-full bg-muted p-4 mb-3">
                                <Calendar className="size-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-base font-semibold">Tidak ada data rapat</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                {hasActiveFilters
                                    ? 'Tidak ditemukan rapat yang sesuai dengan kriteria filter saat ini.'
                                    : 'Belum ada agenda rapat yang dibuat.'}
                            </p>
                            {hasActiveFilters ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="mt-4"
                                >
                                    Hapus Semua Filter
                                </Button>
                            ) : canCreate ? (
                                <Button asChild size="sm" className="mt-4 gap-2">
                                    <Link href="/meetings/create">
                                        <CalendarPlus className="size-4" />
                                        Buat Rapat Sekarang
                                    </Link>
                                </Button>
                            ) : null}
                        </div>
                    ) : (
                        <div className="divide-y">
                            {meetings.data.map((meeting) => (
                                <Link
                                    key={meeting.id}
                                    href={`/meetings/${meeting.id}`}
                                    className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex flex-col gap-2 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-base tracking-tight hover:underline">
                                                {meeting.title}
                                            </span>
                                            {getStatusBadge(meeting.status)}
                                            {getTypeBadge(meeting.type)}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5" />
                                                <span>{formatDateIndo(meeting.date)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="size-3.5" />
                                                <span>
                                                    {formatTime(meeting.start_time)} - {formatTime(meeting.end_time)} WIB
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 truncate max-w-xs">
                                                <MapPin className="size-3.5 shrink-0" />
                                                <span className="truncate">{meeting.location_or_link}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Users className="size-3.5" />
                                                {meeting.attendees_count ?? meeting.attendees?.length ?? 0} Peserta
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="size-3.5" />
                                                {meeting.agendas_count ?? meeting.agendas?.length ?? 0} Agenda
                                            </span>
                                            {meeting.creator && (
                                                <span className="text-xs">
                                                    Dibuat oleh: <span className="font-medium text-foreground">{meeting.creator.name}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                            Buka Rapat
                                            <ChevronRight className="size-4" />
                                        </Button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {meetings.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t text-sm">
                            <span className="text-xs text-muted-foreground">
                                Halaman {meetings.current_page} dari {meetings.last_page} ({meetings.total} total)
                            </span>
                            <div className="flex items-center gap-1">
                                {meetings.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 text-xs text-muted-foreground border rounded-md opacity-50 select-none"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground font-semibold border-primary'
                                                    : 'hover:bg-muted text-foreground'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

MeetingIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Manajemen Rapat',
            href: '/meetings',
        },
    ],
};
