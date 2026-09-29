import { router, usePage } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    HelpCircle,
    User,
    UserCheck,
    Users,
    X,
    XCircle,
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
import type { Auth, Meeting, MeetingAttendee } from '@/types';

interface AttendeesTabProps {
    meeting: Meeting;
    attendees?: MeetingAttendee[];
}

export default function AttendeesTab({
    meeting,
    attendees = [],
}: AttendeesTabProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userRole = auth?.user?.role ?? 'peserta';
    const canManagePresence = userRole === 'admin';

    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const handleUpdatePresence = (
        attendeeId: number,
        status: 'present' | 'excused' | 'absent' | 'pending'
    ) => {
        setUpdatingId(attendeeId);
        router.patch(
            `/meetings/${meeting.id}/attendees/${attendeeId}`,
            { presence_status: status },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingId(null),
            }
        );
    };

    const countStatus = {
        present: attendees.filter((a) => a.presence_status === 'present').length,
        excused: attendees.filter((a) => a.presence_status === 'excused').length,
        absent: attendees.filter((a) => a.presence_status === 'absent').length,
        pending: attendees.filter(
            (a) => !a.presence_status || a.presence_status === 'pending'
        ).length,
    };

    const getRoleBadge = (role: MeetingAttendee['role_in_meeting']) => {
        switch (role) {
            case 'leader':
                return (
                    <Badge variant="default" className="bg-purple-600 hover:bg-purple-700 text-white text-[10px]">
                        Pimpinan
                    </Badge>
                );
            case 'notetaker':
                return (
                    <Badge variant="default" className="bg-sky-600 hover:bg-sky-700 text-white text-[10px]">
                        Notulis
                    </Badge>
                );
            case 'participant':
            default:
                return (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Peserta
                    </Badge>
                );
        }
    };

    const getPresenceBadge = (status: MeetingAttendee['presence_status']) => {
        switch (status) {
            case 'present':
                return (
                    <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Hadir
                    </Badge>
                );
            case 'excused':
                return (
                    <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="size-3 text-amber-600" />
                        Izin / Sakit
                    </Badge>
                );
            case 'absent':
                return (
                    <Badge variant="secondary" className="gap-1 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <XCircle className="size-3 text-rose-600" />
                        Tidak Hadir
                    </Badge>
                );
            case 'pending':
            default:
                return (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <HelpCircle className="size-3" />
                        Belum Presensi
                    </Badge>
                );
        }
    };

    const formatPresenceTime = (timeStr?: string | null) => {
        if (!timeStr) return '-';
        try {
            return new Date(timeStr).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
            }) + ' WIB';
        } catch {
            return timeStr;
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Stats presence recap */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Total Peserta</p>
                            <p className="text-xl font-bold">{attendees.length}</p>
                        </div>
                        <Users className="size-4 text-muted-foreground" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Hadir</p>
                            <p className="text-xl font-bold text-emerald-600">
                                {countStatus.present}
                            </p>
                        </div>
                        <CheckCircle2 className="size-4 text-emerald-600" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Izin / Sakit</p>
                            <p className="text-xl font-bold text-amber-600">
                                {countStatus.excused}
                            </p>
                        </div>
                        <Clock className="size-4 text-amber-600" />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">Belum Hadir</p>
                            <p className="text-xl font-bold text-muted-foreground">
                                {countStatus.pending + countStatus.absent}
                            </p>
                        </div>
                        <HelpCircle className="size-4 text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>

            {/* Attendance Table */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-semibold">
                                Daftar Undangan & Presensi Kehadiran
                            </CardTitle>
                            <CardDescription>
                                {canManagePresence
                                    ? 'Klik tombol status presensi di samping setiap pegawai untuk memperbarui kehadiran.'
                                    : 'Daftar kehadiran peserta yang dikonfirmasi oleh pengelola rapat.'}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {attendees.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Belum ada peserta yang diundang ke rapat ini.
                        </div>
                    ) : (
                        <div className="divide-y border-t">
                            {attendees.map((att) => {
                                const isBusy = updatingId === att.id;
                                return (
                                    <div
                                        key={att.id}
                                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="size-9">
                                                <AvatarFallback className="text-xs">
                                                    {getInitials(att.user?.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-sm font-semibold truncate">
                                                        {att.user?.name ?? 'Nama Pengguna'}
                                                    </span>
                                                    {getRoleBadge(att.role_in_meeting)}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                                    <span>{att.user?.email}</span>
                                                    {att.user?.department && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{att.user.department}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
                                            <div className="flex flex-col sm:items-end text-xs">
                                                {getPresenceBadge(att.presence_status)}
                                                {att.presence_status === 'present' && att.presence_time && (
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                                        Pukul {formatPresenceTime(att.presence_time)}
                                                    </span>
                                                )}
                                            </div>

                                            {canManagePresence && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant={
                                                            att.presence_status === 'present'
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            handleUpdatePresence(att.id, 'present')
                                                        }
                                                        className={`h-7 px-2 text-xs gap-1 ${
                                                            att.presence_status === 'present'
                                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                : 'hover:text-emerald-600'
                                                        }`}
                                                    >
                                                        <Check className="size-3.5" />
                                                        Hadir
                                                    </Button>

                                                    <Button
                                                        variant={
                                                            att.presence_status === 'excused'
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            handleUpdatePresence(att.id, 'excused')
                                                        }
                                                        className={`h-7 px-2 text-xs gap-1 ${
                                                            att.presence_status === 'excused'
                                                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                                                : 'hover:text-amber-600'
                                                        }`}
                                                    >
                                                        Izin
                                                    </Button>

                                                    <Button
                                                        variant={
                                                            att.presence_status === 'absent'
                                                                ? 'destructive'
                                                                : 'outline'
                                                        }
                                                        size="sm"
                                                        disabled={isBusy}
                                                        onClick={() =>
                                                            handleUpdatePresence(att.id, 'absent')
                                                        }
                                                        className="h-7 px-2 text-xs gap-1"
                                                    >
                                                        <X className="size-3.5" />
                                                        Absen
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
