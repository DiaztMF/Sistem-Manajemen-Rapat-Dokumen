import { router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Check,
    CheckCircle2,
    Clock,
    Download,
    Edit3,
    FileCheck,
    FileText,
    History,
    RotateCcw,
    Save,
    Send,
    ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
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
import { Label } from '@/components/ui/label';
import type { Auth, Meeting, MeetingMinute } from '@/types';

interface MinutesTabProps {
    meeting: Meeting;
    minute?: MeetingMinute | null;
}

export default function MinutesTab({ meeting, minute }: MinutesTabProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth?.user;
    const userRole = user?.role ?? 'peserta';

    const isAdmin = userRole === 'admin';

    // Review revision dialog state
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [revisionNotes, setRevisionNotes] = useState('');
    const [isApproving, setIsApproving] = useState(false);

    // Form for drafting/updating minutes
    const { data, setData, post, processing, errors } = useForm({
        content_summary: minute?.content_summary ?? '',
        decisions: minute?.decisions ?? '',
        submit_for_review: false,
    });

    const handleSaveDraft = (submitForReview = false) => {
        data.submit_for_review = submitForReview;
        post(`/meetings/${meeting.id}/minutes`, {
            preserveScroll: true,
        });
    };

    const handleApproveAction = (action: 'approve' | 'revision') => {
        if (!minute) return;
        setIsApproving(true);
        router.patch(
            `/minutes/${minute.id}/approve`,
            {
                action,
                review_notes: action === 'revision' ? revisionNotes : null,
            },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsApproving(false);
                    setRevisionDialogOpen(false);
                    setRevisionNotes('');
                },
            }
        );
    };

    const getMinuteStatusBadge = (status?: MeetingMinute['status']) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge variant="secondary" className="gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                        Disetujui Admin
                    </Badge>
                );
            case 'pending_review':
                return (
                    <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        <Clock className="size-3.5 text-amber-600" />
                        Menunggu Persetujuan
                    </Badge>
                );
            case 'draft':
            default:
                return (
                    <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                        <Edit3 className="size-3.5" />
                        Draf Notulen
                    </Badge>
                );
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Top Status & PDF Export Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg border bg-card">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Status Notulen:</span>
                        {getMinuteStatusBadge(minute?.status)}
                    </div>
                    {minute?.recorder && (
                        <p className="text-xs text-muted-foreground">
                            Dicatat oleh: <span className="font-medium text-foreground">{minute.recorder.name}</span>
                        </p>
                    )}
                    {minute?.reviewer && minute?.reviewed_at && (
                        <p className="text-xs text-muted-foreground">
                            Diverifikasi oleh: <span className="font-medium text-foreground">{minute.reviewer.name}</span>
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {minute && minute.status === 'approved' && (
                        <Button asChild variant="default" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                            <a
                                href={`/minutes/${minute.id}/export-pdf`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Download className="size-4" />
                                Unduh Notulen Resmi (PDF)
                            </a>
                        </Button>
                    )}
                </div>
            </div>

            {/* Revision / Rejection Note Alert if exists */}
            {minute?.review_notes && (
                <Alert variant="destructive">
                    <AlertCircle className="size-4" />
                    <AlertTitle>Catatan Perbaikan dari Admin</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                        {minute.review_notes}
                    </AlertDescription>
                </Alert>
            )}

            {/* Pimpinan Action Bar: Approve or Request Revision */}
                {isAdmin && minute && minute.status === 'pending_review' && (
                <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="size-5 text-amber-600" />
                            <CardTitle className="text-base">Persetujuan & Verifikasi Notulen</CardTitle>
                        </div>
                        <CardDescription>
                            Sebagai Admin, Anda dapat meninjau ringkasan hasil rapat dan memutuskan untuk menyetujui atau meminta revisi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="default"
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            disabled={isApproving}
                            onClick={() => handleApproveAction('approve')}
                        >
                            <Check className="size-4" />
                            Setujui Notulen Resmi
                        </Button>

                        <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="gap-2 text-destructive hover:bg-destructive/10">
                                    <RotateCcw className="size-4" />
                                    Minta Revisi Catatan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Kirim Catatan Perbaikan Notulen</DialogTitle>
                                    <DialogDescription>
                                        Tuliskan poin yang perlu disesuaikan atau diperbaiki oleh notulis rapat.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-2">
                                    <Label htmlFor="review_notes">Catatan Koreksi / Masukan</Label>
                                    <textarea
                                        id="review_notes"
                                        rows={4}
                                        placeholder="Contoh: Tambahkan poin kesepakatan terkait anggaran divisi pada bagian keputusan..."
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        value={revisionNotes}
                                        onChange={(e) => setRevisionNotes(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setRevisionDialogOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        disabled={isApproving || !revisionNotes.trim()}
                                        onClick={() => handleApproveAction('revision')}
                                    >
                                        Kirim Permintaan Revisi
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            )}

            {/* Readonly View when Approved or not allowed to edit */}
                    {minute?.status === 'approved' && !isAdmin ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ringkasan Pembahasan Rapat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                                {minute.content_summary || 'Tidak ada ringkasan.'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Keputusan & Kesepakatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
                                {minute.decisions || 'Tidak ada keputusan tercatat.'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* Editable Form */
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveDraft(false);
                    }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ringkasan Jalannya Rapat</CardTitle>
                            <CardDescription>
                                Catat rangkuman jalannya diskusi, aspirasi peserta, dan pokok-pokok pembahasan utama.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <textarea
                                rows={6}
                                placeholder="Tuliskan rangkuman poin-poin utama diskusi rapat di sini..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.content_summary}
                                onChange={(e) => setData('content_summary', e.target.value)}
                                required
                            />
                            <InputError message={errors.content_summary} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Keputusan & Kesepakatan Akhir</CardTitle>
                            <CardDescription>
                                Butir-butir keputusan resmi yang disepakati bersama dalam pertemuan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <textarea
                                rows={6}
                                placeholder="1. Disepakati bahwa...&#10;2. Menyetujui timeline kegiatan..."
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                value={data.decisions}
                                onChange={(e) => setData('decisions', e.target.value)}
                                required
                            />
                            <InputError message={errors.decisions} />
                        </CardContent>
                    </Card>

                    {/* Submit Actions */}
                                {isAdmin && (
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => handleSaveDraft(false)}
                                className="gap-2 w-full sm:w-auto"
                            >
                                <Save className="size-4" />
                                Simpan Draf Notulen
                            </Button>

                            <Button
                                type="button"
                                variant="default"
                                disabled={processing || !data.content_summary || !data.decisions}
                                onClick={() => handleSaveDraft(true)}
                                className="gap-2 w-full sm:w-auto"
                            >
                                <Send className="size-4" />
                                Ajukan Notulen untuk Persetujuan
                            </Button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
}
