import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    FileText,
    MapPin,
    Plus,
    Save,
    Trash2,
    UserCheck,
    Users,
    Video,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Meeting, User } from '@/types';

interface AgendaInput {
    id?: number;
    title: string;
    description: string;
    duration_minutes: number | '';
}

interface AttendeeInput {
    user_id: number;
    role_in_meeting: 'leader' | 'notetaker' | 'participant';
}

interface EditMeetingProps {
    meeting: Meeting;
    users: (User & { position?: string | null })[];
}

export default function EditMeeting({ meeting, users }: EditMeetingProps) {
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [attendeeSearch, setAttendeeSearch] = useState<string>('');

    // Pre-format date & time
    const initialDate = meeting.date
        ? meeting.date.split('T')[0]
        : '';
    const initialStartTime = meeting.start_time
        ? meeting.start_time.slice(0, 5)
        : '09:00';
    const initialEndTime = meeting.end_time
        ? meeting.end_time.slice(0, 5)
        : '11:00';

    const { data, setData, put, processing, errors } = useForm<{
        title: string;
        description: string;
        date: string;
        start_time: string;
        end_time: string;
        type: 'offline' | 'online' | 'hybrid';
        location_or_link: string;
        agendas: AgendaInput[];
        attendees: AttendeeInput[];
    }>({
        title: meeting.title ?? '',
        description: meeting.description ?? '',
        date: initialDate,
        start_time: initialStartTime,
        end_time: initialEndTime,
        type: meeting.type ?? 'offline',
        location_or_link: meeting.location_or_link ?? '',
        agendas:
            meeting.agendas && meeting.agendas.length > 0
                ? meeting.agendas.map((ag) => ({
                      id: ag.id,
                      title: ag.title,
                      description: ag.description ?? '',
                      duration_minutes: ag.duration_minutes ?? 30,
                  }))
                : [
                      {
                          title: 'Pembahasan Utama',
                          description: '',
                          duration_minutes: 60,
                      },
                  ],
        attendees:
            meeting.attendees && meeting.attendees.length > 0
                ? meeting.attendees.map((att) => ({
                      user_id: att.user_id,
                      role_in_meeting: att.role_in_meeting,
                  }))
                : [],
    });

    const departments = Array.from(
        new Set(users.map((u) => u.department).filter(Boolean))
    ) as string[];

    const filteredUsers = users.filter((u) => {
        const matchDept =
            selectedDepartment === 'all' || u.department === selectedDepartment;
        const matchSearch =
            !attendeeSearch ||
            u.name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(attendeeSearch.toLowerCase());
        return matchDept && matchSearch;
    });

    // Agenda operations
    const handleAddAgenda = () => {
        setData('agendas', [
            ...data.agendas,
            {
                title: '',
                description: '',
                duration_minutes: 30,
            },
        ]);
    };

    const handleRemoveAgenda = (index: number) => {
        setData(
            'agendas',
            data.agendas.filter((_, i) => i !== index)
        );
    };

    const handleUpdateAgenda = (
        index: number,
        field: keyof AgendaInput,
        value: string | number
    ) => {
        const updated = [...data.agendas];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        setData('agendas', updated);
    };

    // Attendee operations
    const handleToggleAttendee = (user: User) => {
        const exists = data.attendees.some((a) => a.user_id === user.id);
        if (exists) {
            setData(
                'attendees',
                data.attendees.filter((a) => a.user_id !== user.id)
            );
        } else {
            setData('attendees', [
                ...data.attendees,
                {
                    user_id: user.id,
                    role_in_meeting: 'participant',
                },
            ]);
        }
    };

    const handleUpdateAttendeeRole = (
        userId: number,
        role: 'leader' | 'notetaker' | 'participant'
    ) => {
        setData(
            'attendees',
            data.attendees.map((a) =>
                a.user_id === userId ? { ...a, role_in_meeting: role } : a
            )
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/meetings/${meeting.id}`);
    };

    return (
        <>
            <Head title={`Edit Rapat - ${meeting.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
                {/* Header Navigation */}
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={`/meetings/${meeting.id}`}>
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Perbarui Informasi Rapat</h1>
                        <p className="text-sm text-muted-foreground">
                            Edit perubahan jadwal, susunan agenda, atau daftar peserta rapat.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Basic Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informasi Pokok Rapat</CardTitle>
                            <CardDescription>
                                Perubahan data judul, tanggal, dan lokasi/link rapat.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 space-y-1.5">
                                <Label htmlFor="title">
                                    Judul Rapat <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                                <Label htmlFor="description">Deskripsi / Pengantar Rapat</Label>
                                <textarea
                                    id="description"
                                    rows={3}
                                    placeholder="Penjelasan latar belakang rapat..."
                                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="date">
                                    Tanggal Pelaksanaan <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="type">
                                    Tipe Pelaksanaan <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(val: 'offline' | 'online' | 'hybrid') =>
                                        setData('type', val)
                                    }
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="offline">Tatap Muka Langsung (Offline)</SelectItem>
                                        <SelectItem value="online">Pertemuan Virtual (Online)</SelectItem>
                                        <SelectItem value="hybrid">Gabungan (Hybrid)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.type} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="start_time">
                                    Waktu Mulai <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.start_time} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="end_time">
                                    Waktu Selesai <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    required
                                />
                                <InputError message={errors.end_time} />
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                                <Label htmlFor="location_or_link">
                                    Ruangan Fisik atau Tautan Virtual <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="location_or_link"
                                    value={data.location_or_link}
                                    onChange={(e) => setData('location_or_link', e.target.value)}
                                    required
                                />
                                <InputError message={errors.location_or_link} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dynamic Agenda Builder */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Susunan Agenda Pembahasan</CardTitle>
                                <CardDescription>
                                    Sesuaikan rincian pokok pembahasan dan alokasi durasi.
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddAgenda}
                                className="gap-1.5"
                            >
                                <Plus className="size-4" />
                                Tambah Agenda
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.agendas.length === 0 ? (
                                <div className="text-center py-6 border border-dashed rounded-lg text-sm text-muted-foreground">
                                    Belum ada agenda. Klik &quot;Tambah Agenda&quot; untuk menyusun alur rapat.
                                </div>
                            ) : (
                                data.agendas.map((agenda, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 p-4 rounded-lg border bg-card/50 relative group"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono text-xs">
                                                    #{index + 1}
                                                </Badge>
                                                <span className="text-sm font-semibold">
                                                    Agenda #{index + 1}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8"
                                                onClick={() => handleRemoveAgenda(index)}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="sm:col-span-2 space-y-1">
                                                <Label className="text-xs">Judul Pokok Bahasan</Label>
                                                <Input
                                                    placeholder="Nama topik"
                                                    value={agenda.title}
                                                    onChange={(e) =>
                                                        handleUpdateAgenda(index, 'title', e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Estimasi Durasi (Menit)</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="30"
                                                    value={agenda.duration_minutes}
                                                    onChange={(e) =>
                                                        handleUpdateAgenda(
                                                            index,
                                                            'duration_minutes',
                                                            e.target.value ? parseInt(e.target.value) : ''
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="sm:col-span-3 space-y-1">
                                                <Label className="text-xs">Catatan / Detail Tambahan</Label>
                                                <Input
                                                    placeholder="Rincian bahasan"
                                                    value={agenda.description}
                                                    onChange={(e) =>
                                                        handleUpdateAgenda(index, 'description', e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <InputError message={errors.agendas} />
                        </CardContent>
                    </Card>

                    {/* Attendee Picker */}
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle className="text-lg">Peserta Rapat</CardTitle>
                                    <CardDescription>
                                        Pilih atau ubah pegawai yang diundang beserta peran khusus masing-masing.
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="gap-1.5 self-start sm:self-center">
                                    <UserCheck className="size-3.5" />
                                    {data.attendees.length} Pegawai Terpilih
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filter Bar */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Cari nama atau email pegawai..."
                                        value={attendeeSearch}
                                        onChange={(e) => setAttendeeSearch(e.target.value)}
                                        className="h-9"
                                    />
                                </div>
                                {departments.length > 0 && (
                                    <Select
                                        value={selectedDepartment}
                                        onValueChange={setSelectedDepartment}
                                    >
                                        <SelectTrigger className="w-full sm:w-[200px] h-9">
                                            <SelectValue placeholder="Semua Divisi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Departemen</SelectItem>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* User List Checklist */}
                            <div className="border rounded-lg max-h-72 overflow-y-auto divide-y">
                                {filteredUsers.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        Tidak ada pegawai yang sesuai dengan pencarian.
                                    </div>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const isSelected = data.attendees.some(
                                            (a) => a.user_id === u.id
                                        );
                                        const currentAttendee = data.attendees.find(
                                            (a) => a.user_id === u.id
                                        );

                                        return (
                                            <div
                                                key={u.id}
                                                className={`flex items-center justify-between p-3 transition-colors ${
                                                    isSelected ? 'bg-primary/5' : 'hover:bg-muted/40'
                                                }`}
                                            >
                                                <div
                                                    className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                                                    onClick={() => handleToggleAttendee(u)}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleToggleAttendee(u)}
                                                    />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium text-foreground truncate">
                                                            {u.name}
                                                        </span>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span>{u.email}</span>
                                                            {u.department && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{u.department}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {isSelected && currentAttendee && (
                                                    <div className="pl-3 shrink-0">
                                                        <Select
                                                            value={currentAttendee.role_in_meeting}
                                                            onValueChange={(
                                                                val: 'leader' | 'notetaker' | 'participant'
                                                            ) => handleUpdateAttendeeRole(u.id, val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs w-[130px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="participant">Peserta</SelectItem>
                                                                <SelectItem value="leader">Pimpinan</SelectItem>
                                                                <SelectItem value="notetaker">Notulis</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <InputError message={errors.attendees} />
                        </CardContent>
                    </Card>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pb-8">
                        <Button variant="outline" asChild>
                            <Link href={`/meetings/${meeting.id}`}>Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            <Save className="size-4" />
                            {processing ? 'Menyimpan Perubahan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

EditMeeting.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Manajemen Rapat',
            href: '/meetings',
        },
        {
            title: 'Perbarui Rapat',
            href: '#',
        },
    ],
};
