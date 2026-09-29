import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Edit3,
    ExternalLink,
    Filter,
    Kanban,
    ListFilter,
    ListTodo,
    Table as TableIcon,
    User as UserIcon,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { ActionItem, Auth, BreadcrumbItem, Meeting, User } from '@/types';

interface PaginatedActionItems {
    data: (ActionItem & {
        pic: User;
        meeting?: Meeting;
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

interface ActionItemsIndexProps {
    actionItems: PaginatedActionItems;
    users: User[];
    meetings?: Meeting[];
    filters: {
        status?: string;
        pic_id?: string | number;
        meeting_id?: string | number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Tindak Lanjut & Tugas', href: '/action-items' },
];

export default function ActionItemsIndex({
    actionItems,
    users,
    meetings = [],
    filters,
}: ActionItemsIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState<string>(
        filters.status || 'all'
    );
    const [selectedPic, setSelectedPic] = useState<string>(
        filters.pic_id ? String(filters.pic_id) : 'all'
    );
    const [selectedMeeting, setSelectedMeeting] = useState<string>(
        filters.meeting_id ? String(filters.meeting_id) : 'all'
    );

    // Modal state for updating action item status
    const [activeItem, setActiveItem] = useState<ActionItem | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const { data, setData, patch, processing, reset, errors } = useForm({
        status: 'pending' as 'pending' | 'in_progress' | 'completed',
        completion_notes: '',
    });

    const openUpdateModal = (item: ActionItem) => {
        setActiveItem(item);
        setData({
            status: item.status,
            completion_notes: item.completion_notes || '',
        });
        setIsUpdateModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeItem) return;

        patch(`/action-items/${activeItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsUpdateModalOpen(false);
                setActiveItem(null);
                reset();
            },
        });
    };

    const handleFilterChange = (
        newStatus?: string,
        newPic?: string,
        newMeeting?: string
    ) => {
        const queryParams: Record<string, string> = {};
        const s = newStatus !== undefined ? newStatus : selectedStatus;
        const p = newPic !== undefined ? newPic : selectedPic;
        const m = newMeeting !== undefined ? newMeeting : selectedMeeting;

        if (s && s !== 'all') queryParams.status = s;
        if (p && p !== 'all') queryParams.pic_id = p;
        if (m && m !== 'all') queryParams.meeting_id = m;

        router.get('/action-items', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilters = () => {
        setSelectedStatus('all');
        setSelectedPic('all');
        setSelectedMeeting('all');
        router.get('/action-items', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const isPastDue = (dueDate: string, status: string) => {
        if (status === 'completed') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        return due < today;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                        <CheckCircle2 className="size-3 mr-1" />
                        Selesai
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                        <Clock className="size-3 mr-1" />
                        Sedang Dikerjakan
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-medium">
                        <AlertCircle className="size-3 mr-1" />
                        Menunggu
                    </Badge>
                );
        }
    };

    // Grouping for Kanban Board
    const kanbanColumns = [
        {
            id: 'pending',
            title: 'Menunggu (Pending)',
            colorClass: 'border-t-4 border-amber-500 bg-amber-500/5',
            badgeBg: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
            items: actionItems.data.filter((item) => item.status === 'pending'),
        },
        {
            id: 'in_progress',
            title: 'Sedang Berjalan (In Progress)',
            colorClass: 'border-t-4 border-blue-500 bg-blue-500/5',
            badgeBg: 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300',
            items: actionItems.data.filter((item) => item.status === 'in_progress'),
        },
        {
            id: 'completed',
            title: 'Selesai (Completed)',
            colorClass: 'border-t-4 border-emerald-500 bg-emerald-500/5',
            badgeBg: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
            items: actionItems.data.filter((item) => item.status === 'completed'),
        },
    ];

    const canEditItem = (item: ActionItem) => {
        if (!auth.user) return false;
        if (auth.user.role && ['admin', 'sekretaris'].includes(auth.user.role)) return true;
        return item.pic_id === auth.user.id;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tindak Lanjut & Tugas (Action Items)" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Header section with view toggle */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <ListTodo className="size-6 text-primary" />
                            Tindak Lanjut Agenda Rapat
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pantau pelaksanaan tanggung jawab PIC dan progres tindak lanjut dari seluruh rapat.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto">
                        <div className="inline-flex rounded-lg border bg-muted p-1 text-muted-foreground">
                            <button
                                type="button"
                                onClick={() => setViewMode('kanban')}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                                    viewMode === 'kanban'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'hover:text-foreground'
                                }`}
                            >
                                <Kanban className="size-3.5" />
                                Kanban Board
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                                    viewMode === 'table'
                                        ? 'bg-background text-foreground shadow-xs'
                                        : 'hover:text-foreground'
                                }`}
                            >
                                <TableIcon className="size-3.5" />
                                Tabel Rinci
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters card */}
                <Card className="border shadow-xs">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                    Status Tugas
                                </label>
                                <Select
                                    value={selectedStatus}
                                    onValueChange={(val) => {
                                        setSelectedStatus(val);
                                        handleFilterChange(val, undefined, undefined);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Menunggu</SelectItem>
                                        <SelectItem value="in_progress">Sedang Dikerjakan</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                    Penanggung Jawab (PIC)
                                </label>
                                <Select
                                    value={selectedPic}
                                    onValueChange={(val) => {
                                        setSelectedPic(val);
                                        handleFilterChange(undefined, val, undefined);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Semua PIC" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua PIC Pegawai</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                    Filter Rapat Terkait
                                </label>
                                <Select
                                    value={selectedMeeting}
                                    onValueChange={(val) => {
                                        setSelectedMeeting(val);
                                        handleFilterChange(undefined, undefined, val);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Rapat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Rapat</SelectItem>
                                        {meetings.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end gap-2">
                                {(selectedStatus !== 'all' ||
                                    selectedPic !== 'all' ||
                                    selectedMeeting !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResetFilters}
                                        className="w-full text-xs h-9"
                                    >
                                        <X className="size-3.5 mr-1" />
                                        Reset Filter
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content views */}
                {actionItems.data.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                <ListTodo className="size-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Tidak Ada Tindak Lanjut</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Tidak ditemukan tugas tindak lanjut untuk filter ini atau belum ada penugasan action item.
                            </p>
                            {(selectedStatus !== 'all' ||
                                selectedPic !== 'all' ||
                                selectedMeeting !== 'all') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="mt-2"
                                >
                                    Bersihkan Filter
                                </Button>
                            )}
                        </div>
                    </Card>
                ) : viewMode === 'kanban' ? (
                    /* Kanban Board View */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {kanbanColumns.map((col) => (
                            <div
                                key={col.id}
                                className={`rounded-xl border bg-card p-4 shadow-xs flex flex-col gap-3.5 min-h-[480px] ${col.colorClass}`}
                            >
                                <div className="flex items-center justify-between pb-2 border-b">
                                    <h3 className="font-semibold text-sm text-foreground">
                                        {col.title}
                                    </h3>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}
                                    >
                                        {col.items.length}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3 overflow-y-auto">
                                    {col.items.length === 0 ? (
                                        <div className="text-center py-8 text-xs text-muted-foreground border border-dashed rounded-lg">
                                            Tidak ada tugas di kolom ini.
                                        </div>
                                    ) : (
                                        col.items.map((item) => {
                                            const overdue = isPastDue(item.due_date, item.status);
                                            const userInitials = item.pic?.name
                                                ? item.pic.name
                                                      .split(' ')
                                                      .map((n) => n[0])
                                                      .join('')
                                                      .toUpperCase()
                                                      .slice(0, 2)
                                                : 'U';

                                            return (
                                                <Card
                                                    key={item.id}
                                                    className="shadow-2xs hover:shadow-xs transition-shadow border bg-background"
                                                >
                                                    <CardHeader className="p-3.5 pb-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                                                                {item.title}
                                                            </CardTitle>
                                                        </div>
                                                        {item.meeting && (
                                                            <Link
                                                                href={`/meetings/${item.meeting_id}`}
                                                                className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-1 truncate"
                                                            >
                                                                <ExternalLink className="size-3 shrink-0" />
                                                                <span className="truncate">{item.meeting.title}</span>
                                                            </Link>
                                                        )}
                                                    </CardHeader>

                                                    <CardContent className="p-3.5 pt-0 text-xs space-y-3">
                                                        {item.description && (
                                                            <p className="text-muted-foreground text-xs line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center justify-between gap-2 pt-2 border-t">
                                                            {/* PIC Avatar */}
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <Avatar className="size-6 text-[10px]">
                                                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                                                                    {item.pic?.name || 'Belum ada PIC'}
                                                                </span>
                                                            </div>

                                                            {/* Due Date */}
                                                            <div
                                                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${
                                                                    overdue
                                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold'
                                                                        : 'text-muted-foreground bg-muted/60'
                                                                }`}
                                                            >
                                                                <Calendar className="size-3" />
                                                                {item.due_date}
                                                            </div>
                                                        </div>

                                                        {item.completion_notes && (
                                                            <div className="text-[11px] bg-muted/40 p-2 rounded border text-muted-foreground">
                                                                <span className="font-semibold text-foreground block">
                                                                    Catatan Penyelesaian:
                                                                </span>
                                                                {item.completion_notes}
                                                            </div>
                                                        )}

                                                        {canEditItem(item) && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openUpdateModal(item)}
                                                                className="w-full text-xs h-7.5 mt-1"
                                                            >
                                                                <Edit3 className="size-3 mr-1.5" />
                                                                Perbarui Status
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/3">
                                        Tugas & Deskripsi
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/5">
                                        Rapat Terkait
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground">
                                        PIC (Pelaksana)
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground">
                                        Tenggat Waktu
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground">
                                        Status
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {actionItems.data.map((item) => {
                                    const overdue = isPastDue(item.due_date, item.status);
                                    const userInitials = item.pic?.name
                                        ? item.pic.name
                                              .split(' ')
                                              .map((n) => n[0])
                                              .join('')
                                              .toUpperCase()
                                              .slice(0, 2)
                                        : 'U';

                                    return (
                                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="p-4 align-top">
                                                <div className="font-semibold text-foreground text-sm">
                                                    {item.title}
                                                </div>
                                                {item.description && (
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                                {item.completion_notes && (
                                                    <div className="mt-2 text-[11px] bg-muted/40 p-1.5 rounded border text-muted-foreground">
                                                        <span className="font-medium text-foreground">Catatan: </span>
                                                        {item.completion_notes}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="p-4 align-top">
                                                {item.meeting ? (
                                                    <Link
                                                        href={`/meetings/${item.meeting_id}`}
                                                        className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                                                    >
                                                        <ExternalLink className="size-3 shrink-0" />
                                                        <span className="line-clamp-2">{item.meeting.title}</span>
                                                    </Link>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </td>

                                            <td className="p-4 align-top">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="size-6 text-[10px]">
                                                        <AvatarFallback>{userInitials}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="text-xs">
                                                        <div className="font-medium text-foreground">
                                                            {item.pic?.name || 'Tidak ada'}
                                                        </div>
                                                        <div className="text-[11px] text-muted-foreground">
                                                            {item.pic?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4 align-top">
                                                <div
                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                                                        overdue
                                                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-semibold'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    <Calendar className="size-3" />
                                                    {item.due_date}
                                                </div>
                                                {overdue && (
                                                    <span className="block text-[10px] text-rose-600 font-bold mt-0.5">
                                                        Lewat Tenggat
                                                    </span>
                                                )}
                                            </td>

                                            <td className="p-4 align-top">
                                                {getStatusBadge(item.status)}
                                            </td>

                                            <td className="p-4 align-top text-right">
                                                {canEditItem(item) && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openUpdateModal(item)}
                                                        className="text-xs h-8"
                                                    >
                                                        <Edit3 className="size-3 mr-1" />
                                                        Update
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {actionItems.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            Menampilkan {actionItems.data.length} dari {actionItems.total} tugas
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {actionItems.links.map((link, idx) => {
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

                {/* Quick Action Modal: Perbarui Status & Completion Notes */}
                <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Edit3 className="size-5 text-primary" />
                                Perbarui Status Tindak Lanjut
                            </DialogTitle>
                            <DialogDescription>
                                Perbarui status penugasan dan berikan catatan hasil penyelesaian tugas.
                            </DialogDescription>
                        </DialogHeader>

                        {activeItem && (
                            <form onSubmit={handleFormSubmit} className="space-y-4 pt-2">
                                <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                                    <div className="text-xs text-muted-foreground">Judul Tugas:</div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {activeItem.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1 pt-1">
                                        <Calendar className="size-3" />
                                        Tenggat: {activeItem.due_date}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-xs font-medium">
                                        Status Saat Ini
                                    </Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(val: 'pending' | 'in_progress' | 'completed') =>
                                            setData('status', val)
                                        }
                                    >
                                        <SelectTrigger id="status" className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Menunggu (Pending)</SelectItem>
                                            <SelectItem value="in_progress">Sedang Dikerjakan (In Progress)</SelectItem>
                                            <SelectItem value="completed">Selesai (Completed)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-xs text-destructive">{errors.status}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="completion_notes" className="text-xs font-medium">
                                        Catatan Hasil / Kendala
                                    </Label>
                                    <textarea
                                        id="completion_notes"
                                        rows={3}
                                        placeholder="Tuliskan keterangan hasil pelaksanaan tindak lanjut atau kendala yang dihadapi..."
                                        value={data.completion_notes}
                                        onChange={(e) => setData('completion_notes', e.target.value)}
                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    />
                                    {errors.completion_notes && (
                                        <p className="text-xs text-destructive">
                                            {errors.completion_notes}
                                        </p>
                                    )}
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsUpdateModalOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
