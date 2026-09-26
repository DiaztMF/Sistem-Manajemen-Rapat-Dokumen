import { useForm, usePage } from '@inertiajs/react';
import {
    Download,
    FileIcon,
    FilePlus,
    FileText,
    FolderLock,
    HardDrive,
    Trash2,
    UploadCloud,
    User,
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
import type { Auth, DocumentItem, Meeting } from '@/types';

interface DocumentsTabProps {
    meeting: Meeting;
    documents?: DocumentItem[];
}

export default function DocumentsTab({
    meeting,
    documents = [],
}: DocumentsTabProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        title: string;
        meeting_id: number;
        category: 'undangan' | 'materi' | 'notulen_pdf' | 'bukti_tindak_lanjut';
        file: File | null;
    }>({
        title: '',
        meeting_id: meeting.id,
        category: 'materi',
        file: null,
    });

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/documents', {
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                reset();
            },
        });
    };

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getCategoryBadge = (category: DocumentItem['category']) => {
        switch (category) {
            case 'undangan':
                return (
                    <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border-sky-200">
                        Surat Undangan
                    </Badge>
                );
            case 'materi':
                return (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200">
                        Materi Paparan
                    </Badge>
                );
            case 'notulen_pdf':
                return (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200">
                        Notulen Resmi (PDF)
                    </Badge>
                );
            case 'bukti_tindak_lanjut':
                return (
                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200">
                        Bukti Tindak Lanjut
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="text-xs">
                        Dokumen
                    </Badge>
                );
        }
    };

    const formatDateIndo = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold">Dokumen & Lampiran Rapat</h3>
                    <p className="text-xs text-muted-foreground">
                        Kumpulan berkas materi, undangan, salinan notulen, dan bukti pelaksanaan.
                    </p>
                </div>

                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-1.5 self-start sm:self-auto">
                            <FilePlus className="size-4" />
                            Unggah Dokumen
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Unggah Berkas Baru</DialogTitle>
                            <DialogDescription>
                                Simpan dokumen terkait rapat ini dengan batas maksimal 15MB.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="doc_title">
                                    Judul Dokumen <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="doc_title"
                                    placeholder="Contoh: Slide Presentasi Evaluasi Program"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="category">
                                    Kategori Dokumen <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(
                                        val: 'undangan' | 'materi' | 'notulen_pdf' | 'bukti_tindak_lanjut'
                                    ) => setData('category', val)}
                                >
                                    <SelectTrigger id="category">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="materi">Materi Paparan (Slide/Bahan)</SelectItem>
                                        <SelectItem value="undangan">Surat / Memo Undangan</SelectItem>
                                        <SelectItem value="notulen_pdf">Notulen Resmi (PDF)</SelectItem>
                                        <SelectItem value="bukti_tindak_lanjut">Bukti Tindak Lanjut</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.category} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="file">
                                    Pilih Berkas <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) =>
                                        setData('file', e.target.files ? e.target.files[0] : null)
                                    }
                                    required
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Format diizinkan: PDF, DOCX, XLSX, PPTX, JPG, PNG (Maks 15MB).
                                </p>
                                <InputError message={errors.file} />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsUploadOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing || !data.file}>
                                    {processing ? 'Mengunggah...' : 'Unggah Sekarang'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <FolderLock className="size-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Belum ada dokumen yang diunggah</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Lampirkan file materi paparan atau salinan dokumen pendukung di tab ini.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex flex-col justify-between gap-3 p-4 rounded-lg border bg-card shadow-xs transition-colors hover:border-primary/40"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="rounded-lg bg-primary/10 p-2 text-primary shrink-0">
                                    <FileIcon className="size-5" />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-sm font-semibold truncate" title={doc.title}>
                                            {doc.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate" title={doc.file_name}>
                                        {doc.file_name}
                                    </span>
                                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                                        <span>{formatBytes(doc.file_size)}</span>
                                        <span>•</span>
                                        <span>{formatDateIndo(doc.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t mt-1">
                                {getCategoryBadge(doc.category)}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1.5 text-xs"
                                >
                                    <a
                                        href={`/documents/${doc.id}/download`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Download className="size-3.5" />
                                        Unduh
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
