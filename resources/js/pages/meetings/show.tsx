import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Edit3,
    FileCheck,
    FileText,
    FolderLock,
    ListOrdered,
    ListTodo,
    MapPin,
    Play,
    Users,
    Video,
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
import type { Auth, Meeting, User } from '@/types';

import ActionItemsTab from './partials/action-items-tab';
import AgendaTab from './partials/agenda-tab';
import AttendeesTab from './partials/attendees-tab';
import DocumentsTab from './partials/documents-tab';
import MinutesTab from './partials/minutes-tab';

interface MeetingShowProps {
    meeting: Meeting;
    users?: User[];
    availableUsers?: User[];
}

type TabKey = 'agenda' | 'attendees' | 'minutes' | 'action_items' | 'documents';

export default function MeetingShow({
    meeting,
    users = [],
    availableUsers = [],
}: MeetingShowProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.user;
    const userRole = user?.role ?? 'peserta';
    const canManage = userRole === 'admin';

    const [activeTab, setActiveTab] = useState<TabKey>('agenda');
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const allUsers = users.length > 0 ? users : availableUsers;

    const handleQuickStatusChange = (
        nextStatus: 'scheduled' | 'in_progress' | 'completed'
    ) => {
        setUpdatingStatus(true);
        router.patch(
            `/meetings/${meeting.id}/status`,
            { status: nextStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatus(false),
            }
        );
    };

    const getStatusBadge = (statusValue: Meeting['status']) => {
        switch (statusValue) {
            case 'scheduled':
                return (
                    <Badge variant="secondary" className="gap-1 bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        <Clock className="size-3" />
                        Terjadwal
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge variant="default" className="gap-1 bg-amber-600 hover:bg-amber-700 text-white animate-pulse">
                        <Play className="size-3" />
                        Sedang Berlangsung
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="size-3" />
                        Rapat Selesai
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
                    <Badge variant="outline" className="gap-1 text-sky-600 border-sky-300 dark:text-sky-400">
                        <Video className="size-3" />
                        Pertemuan Online
                    </Badge>
                );
            case 'hybrid':
                return (
                    <Badge variant="outline" className="gap-1 text-purple-600 border-purple-300 dark:text-purple-400">
                        <Users className="size-3" />
                        Pertemuan Hybrid
                    </Badge>
                );
            case 'offline':
            default:
                return (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <MapPin className="size-3" />
                        Tatap Muka (Offline)
                    </Badge>
                );
        }
    };

    const formatDateIndo = (dateStr: string) => {
        try {
            const [year, month, day] = dateStr.slice(0, 10).split('-').map(Number);
            if (year && month && day) {
                return new Date(year, month - 1, day).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });
            }
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

    const attendeesCount = meeting.attendees?.length ?? 0;
    const actionItemsCount = meeting.action_items?.length ?? 0;
    const documentsCount = meeting.documents?.length ?? 0;

    return (
        <>
            <Head title={`Rapat: ${meeting.title}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                {/* Header Actions & Back */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
                            <Link href="/meetings">
                                <ArrowLeft className="size-3.5" />
                                Kembali ke Daftar Rapat
                            </Link>
                        </Button>

                        <div className="flex items-center gap-2 flex-wrap">
                            {canManage && (
                                <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                                    <Link href={`/meetings/${meeting.id}/edit`}>
                                        <Edit3 className="size-3.5" />
                                        Edit Rapat
                                    </Link>
                                </Button>
                            )}

                            {/* Quick Meeting Workflow Status Buttons */}
                            {canManage && meeting.status === 'scheduled' && (
                                <Button
                                    size="sm"
                                    className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                                    disabled={updatingStatus}
                                    onClick={() => handleQuickStatusChange('in_progress')}
                                >
                                    <Play className="size-3.5" />
                                    Mulai Rapat
                                </Button>
                            )}

                            {canManage && meeting.status === 'in_progress' && (
                                <Button
                                    size="sm"
                                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={updatingStatus}
                                    onClick={() => handleQuickStatusChange('completed')}
                                >
                                    <CheckCircle2 className="size-3.5" />
                                    Selesaikan Rapat
                                </Button>
                            )}

                            {meeting.minute && meeting.minute.status === 'approved' && (
                                <Button asChild size="sm" variant="default" className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <a
                                        href={`/minutes/${meeting.minute.id}/export-pdf`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Download className="size-3.5" />
                                        Cetak Notulen PDF
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Meeting Title Banner */}
                    <div className="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-xs">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                                {getStatusBadge(meeting.status)}
                                {getTypeBadge(meeting.type)}
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {meeting.title}
                            </h1>
                            {meeting.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {meeting.description}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-3 pt-3 border-t sm:grid-cols-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-primary shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">Tanggal & Waktu</p>
                                    <p>
                                        {formatDateIndo(meeting.date)} ({formatTime(meeting.start_time)} - {formatTime(meeting.end_time)} WIB)
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="size-4 text-primary shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-foreground">Tempat / Tautan</p>
                                    <p className="truncate" title={meeting.location_or_link}>
                                        {meeting.location_or_link}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Users className="size-4 text-primary shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">Inisiator Rapat</p>
                                    <p>
                                        {meeting.creator?.name ?? 'Pengguna'} ({meeting.creator?.email ?? '-'})
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5-Tab Interface Controls */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 border-b overflow-x-auto pb-px">
                        <button
                            type="button"
                            onClick={() => setActiveTab('agenda')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'agenda'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <ListOrdered className="size-4" />
                            Agenda ({meeting.agendas?.length ?? 0})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('attendees')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'attendees'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Users className="size-4" />
                            Peserta & Presensi ({attendeesCount})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('minutes')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'minutes'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <FileText className="size-4" />
                            Notulen
                            {meeting.minute && (
                                <span className={`size-2 rounded-full ${
                                    meeting.minute.status === 'approved'
                                        ? 'bg-emerald-500'
                                        : meeting.minute.status === 'pending_review'
                                        ? 'bg-amber-500'
                                        : 'bg-muted-foreground'
                                }`} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('action_items')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'action_items'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <ListTodo className="size-4" />
                            Tindak Lanjut ({actionItemsCount})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('documents')}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === 'documents'
                                    ? 'border-primary text-primary font-semibold'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <FolderLock className="size-4" />
                            Dokumen ({documentsCount})
                        </button>
                    </div>

                    {/* Active Tab Content Panel */}
                    <div className="pt-2">
                        {activeTab === 'agenda' && (
                            <AgendaTab agendas={meeting.agendas} />
                        )}

                        {activeTab === 'attendees' && (
                            <AttendeesTab
                                meeting={meeting}
                                attendees={meeting.attendees}
                            />
                        )}

                        {activeTab === 'minutes' && (
                            <MinutesTab
                                meeting={meeting}
                                minute={meeting.minute}
                            />
                        )}

                        {activeTab === 'action_items' && (
                            <ActionItemsTab
                                meeting={meeting}
                                actionItems={meeting.action_items}
                                availableUsers={allUsers}
                            />
                        )}

                        {activeTab === 'documents' && (
                            <DocumentsTab
                                meeting={meeting}
                                documents={meeting.documents}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

MeetingShow.layout = {
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
            title: 'Detail Rapat',
            href: '#',
        },
    ],
};
