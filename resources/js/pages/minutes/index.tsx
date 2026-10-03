import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    Download,
    ExternalLink,
    FileCheck2,
    FileEdit,
    FileText,
    Filter,
    Search,
    User as UserIcon,
    X,
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
import type { BreadcrumbItem, MeetingMinute } from '@/types';

interface PaginatedMinutes {
    data: (MeetingMinute & {
        meeting: {
            id: number;
            title: string;
            date: string;
            start_time: string;
            end_time: string;
        };
        recorder?: { id: number; name: string };
        reviewer?: { id: number; name: string };
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

interface MinutesIndexProps {
    minutes: PaginatedMinutes;
    filters: {
        status?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Notulen', href: '/minutes' },
];

export default function MinutesIndex({ minutes, filters }: MinutesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilterChange = (newStatus?: string, newSearch?: string) => {
        const queryParams: Record<string, string> = {};
        const activeStatus = newStatus !== undefined ? newStatus : status;
        const activeSearch = newSearch !== undefined ? newSearch : search;

        if (activeStatus && activeStatus !== 'all') {
            queryParams.status = activeStatus;
        }
        if (activeSearch.trim()) {
            queryParams.search = activeSearch.trim();
        }

        router.get('/minutes', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange(undefined, search);
    };

    const handleReset = () => {
        setSearch('');
        setStatus('all');
        router.get('/minutes', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    const formatDateIndo = (dateStr?: string | null) => {
        if (!dateStr) return '-';
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
    const getStatusBadge = (minuteStatus: string) => {
        switch (minuteStatus) {
            case 'approved':
                return (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                        <FileCheck2 className="size-3.5 mr-1" />
                        Disetujui
                    </Badge>
                );
            case 'pending_review':
                return (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                        <Clock className="size-3.5 mr-1" />
                        Menunggu Review
                    </Badge>
                );
            case 'draft':
            default:
                return (
                    <Badge variant="outline" className="text-muted-foreground border-dashed">
                        <FileEdit className="size-3.5 mr-1" />
                        Draft Notulen
                    </Badge>
                );
        }
    };

    return (
        <>
            <Head title="Daftar Notulen Rapat" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Header section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FileText className="size-6 text-primary" />
                            Daftar Notulen Rapat
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola, tinjau, dan unduh risalah serta keputusan resmi dari seluruh agenda rapat kantor.
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <Card className="border shadow-xs">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari ringkasan, poin keputusan, atau judul rapat..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            handleFilterChange(undefined, '');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div className="w-full md:w-56">
                                <Select
                                    value={status}
                                    onValueChange={(val) => {
                                        setStatus(val);
                                        handleFilterChange(val, undefined);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <Filter className="size-4 text-muted-foreground" />
                                            <SelectValue placeholder="Status Approval" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="pending_review">Menunggu Review</SelectItem>
                                        <SelectItem value="draft">Draft Notulen</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" variant="default" className="w-full md:w-auto">
                                    Cari
                                </Button>
                                {(filters.search || (filters.status && filters.status !== 'all')) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleReset}
                                        className="w-full md:w-auto"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Listing content */}
                {minutes.data.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="size-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Belum Ada Notulen</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Tidak ditemukan data notulen rapat sesuai filter yang diterapkan atau belum ada notulen yang dibuat.
                            </p>
                            {(filters.search || (filters.status && filters.status !== 'all')) && (
                                <Button variant="outline" size="sm" onClick={handleReset} className="mt-2">
                                    Bersihkan Filter
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Desktop Table View / Cards */}
                        <div className="hidden lg:block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/4">
                                            Rapat & Tanggal
                                        </th>
                                        <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/6">
                                            Notulis & Reviewer
                                        </th>
                                        <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/6">
                                            Status Approval
                                        </th>
                                        <th className="h-11 px-4 align-middle font-medium text-muted-foreground">
                                            Ringkasan Keputusan
                                        </th>
                                        <th className="h-11 px-4 align-middle font-medium text-muted-foreground text-right w-44">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {minutes.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 align-top">
                                                <div className="font-semibold text-foreground text-base line-clamp-2">
                                                    {item.meeting?.title || 'Rapat Tanpa Judul'}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="size-3.5" />
                                                        {formatDateIndo(item.meeting?.date)}
                                                    </span>
                                                    {item.meeting?.start_time && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="size-3.5" />
                                                            {item.meeting.start_time.slice(0, 5)} - {item.meeting.end_time?.slice(0, 5) || 'Selesai'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4 align-top text-xs space-y-2">
                                                <div>
                                                    <span className="text-muted-foreground block font-medium">Notulis:</span>
                                                    <span className="text-foreground flex items-center gap-1 mt-0.5">
                                                        <UserIcon className="size-3 text-muted-foreground" />
                                                        {item.recorder?.name || 'Tidak dicatat'}
                                                    </span>
                                                </div>
                                                {item.reviewer && (
                                                    <div>
                                                        <span className="text-muted-foreground block font-medium">Reviewer:</span>
                                                        <span className="text-foreground flex items-center gap-1 mt-0.5">
                                                            <UserIcon className="size-3 text-emerald-600" />
                                                            {item.reviewer.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4 align-top">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    {getStatusBadge(item.status)}
                                                    {item.reviewed_at && (
                                                        <span className="text-[11px] text-muted-foreground">
                                                            Direview: {formatDateIndo(item.reviewed_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4 align-top">
                                                {item.decisions ? (
                                                    <div className="text-xs text-foreground/90 bg-muted/30 p-2.5 rounded-md border line-clamp-3 whitespace-pre-line">
                                                        {item.decisions}
                                                    </div>
                                                ) : item.content_summary ? (
                                                    <div className="text-xs text-muted-foreground line-clamp-3 italic">
                                                        {item.content_summary}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic">
                                                        Belum ada poin keputusan dicatat.
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 align-top text-right">
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full justify-start text-xs h-8"
                                                        asChild
                                                    >
                                                        <Link href={`/meetings/${item.meeting_id}`}>
                                                            <ExternalLink className="size-3.5 mr-1.5" />
                                                            Buka Rapat
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="w-full justify-start text-xs h-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`/minutes/${item.id}/export-pdf`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Download className="size-3.5 mr-1.5" />
                                                            Cetak PDF
                                                        </a>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                            {minutes.data.map((item) => (
                                <Card key={item.id} className="flex flex-col justify-between shadow-xs">
                                    <CardHeader className="p-4 pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base font-semibold line-clamp-2">
                                                {item.meeting?.title || 'Rapat Tanpa Judul'}
                                            </CardTitle>
                                            {getStatusBadge(item.status)}
                                        </div>
                                        <CardDescription className="flex items-center gap-2 text-xs mt-1">
                                            <Calendar className="size-3.5" />
                                            {formatDateIndo(item.meeting?.date)}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="p-4 pt-2 text-xs space-y-3">
                                        <div className="grid grid-cols-2 gap-2 py-2 border-y bg-muted/20 px-2 rounded">
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Notulis</span>
                                                <span className="font-medium text-foreground">{item.recorder?.name || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block text-[11px]">Reviewer</span>
                                                <span className="font-medium text-foreground">{item.reviewer?.name || '-'}</span>
                                            </div>
                                        </div>

                                        {item.decisions && (
                                            <div>
                                                <span className="text-xs font-medium text-foreground block mb-1">
                                                    Poin Keputusan:
                                                </span>
                                                <div className="bg-muted/40 p-2 rounded text-xs line-clamp-3 whitespace-pre-line border">
                                                    {item.decisions}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                                                <Link href={`/meetings/${item.meeting_id}`}>
                                                    <ExternalLink className="size-3.5 mr-1" />
                                                    Buka Rapat
                                                </Link>
                                            </Button>

                                            <Button variant="secondary" size="sm" className="flex-1 text-xs text-primary" asChild>
                                                <a href={`/minutes/${item.id}/export-pdf`} target="_blank" rel="noopener noreferrer">
                                                    <Download className="size-3.5 mr-1" />
                                                    PDF
                                                </a>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Links */}
                        {minutes.last_page > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                                <div className="text-xs text-muted-foreground">
                                    Menampilkan {minutes.data.length} dari {minutes.total} notulen
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {minutes.links.map((link, idx) => {
                                        if (!link.url) {
                                            return (
                                                <span
                                                    key={idx}
                                                    className="px-3 py-1 text-xs rounded border text-muted-foreground/50 border-transparent cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Link
                                                key={idx}
                                                href={link.url}
                                                preserveScroll
                                                className={`px-3 py-1 text-xs rounded border transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-primary-foreground font-semibold border-primary'
                                                        : 'hover:bg-muted text-foreground border-border'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

MinutesIndex.layout = {
    breadcrumbs,
};
