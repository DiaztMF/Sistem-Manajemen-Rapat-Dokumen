import { router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    ListTodo,
    Plus,
    User,
    Users,
} from 'lucide-react';
import React, { useState } from 'react';
import InputError from '@/components/input-error';
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
    DialogTrigger,
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
import type { ActionItem, Auth, Meeting, User as UserType } from '@/types';

interface ActionItemsTabProps {
    meeting: Meeting;
    actionItems?: ActionItem[];
    availableUsers?: UserType[];
}

export default function ActionItemsTab({
    meeting,
    actionItems = [],
    availableUsers = [],
}: ActionItemsTabProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUserId = auth?.user?.id;
    const userRole = auth?.user?.role ?? 'peserta';
    const canCreate = userRole === 'admin';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    // Form to create action item
    const { data, setData, post, processing, errors, reset } = useForm({
        pic_id: '',
        title: '',
        description: '',
        due_date: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/meetings/${meeting.id}/action-items`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                reset();
            },
        });
    };

    const handleToggleStatus = (item: ActionItem) => {
        setUpdatingId(item.id);
        const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
        router.patch(
            `/action-items/${item.id}`,
            { status: nextStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingId(null),
            }
        );
    };

    const isOverdue = (dateStr: string) => {
        try {
            const due = new Date(dateStr);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return due < today;
        } catch {
            return false;
        }
    };

    const formatDateIndo = (dateStr: string) => {
        try {
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

    const getStatusBadge = (status: ActionItem['status'], dueDate: string) => {
        if (status === 'completed') {
            return (
                <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="size-3 text-emerald-600" />
                    Selesai
                </Badge>
            );
        }

        if (isOverdue(dueDate)) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="size-3" />
                    Terlewat Deadline
                </Badge>
            );
        }

        if (status === 'in_progress') {
            return (
                <Badge variant="secondary" className="gap-1 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                    <Clock className="size-3 text-sky-600" />
                    Sedang Dikerjakan
                </Badge>
            );
        }

        return (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
                <Clock className="size-3" />
                Menunggu
            </Badge>
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold">Tindak Lanjut & Tugas Keputusan</h3>
                    <p className="text-xs text-muted-foreground">
                        Daftar mandat tindakan konkret beserta Person in Charge (PIC) dan tenggat waktu.
                    </p>
                </div>

                {canCreate && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5 self-start sm:self-auto">
                                <Plus className="size-4" />
                                Tambah Tindak Lanjut
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Buat Tugas Tindak Lanjut</DialogTitle>
                                <DialogDescription>
                                    Berikan mandat tugas konkret berdasarkan hasil kesepakatan rapat.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="item_title">
                                        Nama Tugas / Tindakan <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="item_title"
                                        placeholder="Contoh: Menyusun draf revisi SOP..."
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.title} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="pic_id">
                                        Penanggung Jawab (PIC) <span className="text-destructive">*</span>
                                    </Label>
                                    <Select
                                        value={data.pic_id}
                                        onValueChange={(val) => setData('pic_id', val)}
                                    >
                                        <SelectTrigger id="pic_id">
                                            <SelectValue placeholder="Pilih Pegawai PIC" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableUsers.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.name} ({u.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.pic_id} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="due_date">
                                        Tenggat Waktu (Deadline) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.due_date} />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="item_desc">Instruksi / Catatan Detail</Label>
                                    <textarea
                                        id="item_desc"
                                        rows={3}
                                        placeholder="Uraian instruksi pelaksanaan tugas..."
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Tugas'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* List Action Items */}
            {actionItems.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <ListTodo className="size-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Belum ada tugas tindak lanjut</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Keputusan rapat yang membutuhkan eksekusi kerja dapat didaftarkan di sini.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {actionItems.map((item) => {
                        const isPIC = item.pic_id === currentUserId;
                        const canToggle = isPIC || canCreate;
                        const isBusy = updatingId === item.id;

                        return (
                            <div
                                key={item.id}
                                className={`flex flex-col gap-3 p-4 rounded-lg border bg-card shadow-xs transition-colors sm:flex-row sm:items-center sm:justify-between ${
                                    item.status === 'completed' ? 'opacity-70 bg-muted/20' : ''
                                }`}
                            >
                                <div className="flex flex-col gap-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className={`text-sm font-semibold tracking-tight ${
                                                item.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                            }`}
                                        >
                                            {item.title}
                                        </span>
                                        {getStatusBadge(item.status, item.due_date)}
                                    </div>

                                    {item.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1.5">
                                            <User className="size-3.5 text-muted-foreground" />
                                            <span>
                                                PIC: <span className="font-medium text-foreground">{item.pic?.name ?? 'Pegawai'}</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="size-3.5 text-muted-foreground" />
                                            <span>Deadline: {formatDateIndo(item.due_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {canToggle && (
                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <Button
                                            variant={item.status === 'completed' ? 'outline' : 'default'}
                                            size="sm"
                                            disabled={isBusy}
                                            onClick={() => handleToggleStatus(item)}
                                            className={`text-xs gap-1.5 ${
                                                item.status !== 'completed'
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                    : ''
                                            }`}
                                        >
                                            <CheckCircle2 className="size-3.5" />
                                            {item.status === 'completed'
                                                ? 'Tandai Belum Selesai'
                                                : 'Selesaikan Tugas'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
