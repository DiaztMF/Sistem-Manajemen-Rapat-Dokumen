import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    Download,
    ExternalLink,
    FileCheck,
    FileSpreadsheet,
    FileText,
    Files,
    Filter,
    HardDrive,
    Plus,
    Search,
    Trash2,
    UploadCloud,
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
import type { Auth, BreadcrumbItem, DocumentItem, Meeting } from '@/types';

interface PaginatedDocuments {
    data: (DocumentItem & {
        uploader: { id: number; name: string };
        meeting?: { id: number; title: string };
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

interface DocumentsIndexProps {
    documents: PaginatedDocuments;
    meetings?: Meeting[];
    filters: {
        category?: string;
        meeting_id?: string | number;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Repositori Dokumen', href: '/documents' },
];

const CATEGORIES = [
    { key: 'all', label: 'Semua Kategori' },
    { key: 'undangan', label: 'Surat Undangan' },
    { key: 'materi', label: 'Materi Paparan' },
    { key: 'notulen_pdf', label: 'Notulen Resmi PDF' },
    { key: 'bukti_tindak_lanjut', label: 'Bukti Tindak Lanjut' },
] as const;

export default function DocumentsIndex({
    documents,
    meetings = [],
    filters,
}: DocumentsIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [activeCategory, setActiveCategory] = useState<string>(
        filters.category || 'all'
    );
    const [selectedMeeting, setSelectedMeeting] = useState<string>(
        filters.meeting_id ? String(filters.meeting_id) : 'all'
    );

    // Modal state for uploading document
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Document deletion confirmation state
    const [itemToDelete, setItemToDelete] = useState<DocumentItem | null>(null);

    const {
        data,
        setData,
        post,
        processing,
        reset,
        errors,
        progress,
    } = useForm<{
        title: string;
        category: 'undangan' | 'materi' | 'notulen_pdf' | 'bukti_tindak_lanjut';
        meeting_id: string;
        file: File | null;
    }>({
        title: '',
        category: 'materi',
        meeting_id: '',
        file: null,
    });

    const handleFilterChange = (
        newCategory?: string,
        newMeeting?: string,
        newSearch?: string
    ) => {
        const queryParams: Record<string, string> = {};
        const cat = newCategory !== undefined ? newCategory : activeCategory;
        const meet = newMeeting !== undefined ? newMeeting : selectedMeeting;
        const q = newSearch !== undefined ? newSearch : search;

        if (cat && cat !== 'all') queryParams.category = cat;
        if (meet && meet !== 'all') queryParams.meeting_id = meet;
        if (q.trim()) queryParams.search = q.trim();

        router.get('/documents', queryParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange(undefined, undefined, search);
    };

    const handleResetFilters = () => {
        setSearch('');
        setActiveCategory('all');
        setSelectedMeeting('all');
        router.get('/documents', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/documents', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (doc: DocumentItem) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus berkas "${doc.title}"?`)) {
            return;
        }

        router.delete(`/documents/${doc.id}`, {
            preserveScroll: true,
        });
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getCategoryBadge = (category: string) => {
        switch (category) {
            case 'undangan':
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300">
                        Surat Undangan
                    </Badge>
                );
            case 'materi':
                return (
                    <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-300">
                        Materi Paparan
                    </Badge>
                );
            case 'notulen_pdf':
                return (
                    <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Notulen Resmi PDF
                    </Badge>
                );
            case 'bukti_tindak_lanjut':
                return (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        Bukti Tindak Lanjut
                    </Badge>
                );
            default:
                return <Badge variant="outline">{category}</Badge>;
        }
    };

    const getFileIcon = (fileType: string) => {
        const type = fileType?.toLowerCase() || '';
        if (type.includes('pdf')) {
            return <FileText className="size-5 text-rose-500" />;
        }
        if (type.includes('xls') || type.includes('sheet') || type.includes('csv')) {
            return <FileSpreadsheet className="size-5 text-emerald-600" />;
        }
        if (type.includes('doc') || type.includes('word')) {
            return <FileCheck className="size-5 text-blue-600" />;
        }
        return <HardDrive className="size-5 text-muted-foreground" />;
    };

    const canDeleteDocument = (doc: DocumentItem) => {
        if (!auth.user) return false;
        if (auth.user.role === 'admin') return true;
        return doc.uploader_id === auth.user.id;
    };

    const canUploadDocument = !!auth.user && auth.user.role === 'admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Repositori Dokumen Rapat" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Header section with upload button */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Files className="size-6 text-primary" />
                            Repositori Dokumen Rapat
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pusat arsip surat undangan, bahan paparan, notulen PDF, dan bukti tindak lanjut agenda kantor.
                        </p>
                    </div>

                    {canUploadDocument && (
                        <Button
                            onClick={() => setIsUploadOpen(true)}
                            className="self-start md:self-auto gap-1.5"
                        >
                            <Plus className="size-4" />
                            Unggah Dokumen Baru
                        </Button>
                    )}
                </div>

                {/* Category Pills Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.key;
                        return (
                            <button
                                key={cat.key}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(cat.key);
                                    handleFilterChange(cat.key, undefined, undefined);
                                }}
                                className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors border ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                                        : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search & Meeting Filter */}
                <Card className="border shadow-xs">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari judul dokumen atau nama berkas..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 w-full"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            handleFilterChange(undefined, undefined, '');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>

                            <div className="w-full md:w-64">
                                <Select
                                    value={selectedMeeting}
                                    onValueChange={(val) => {
                                        setSelectedMeeting(val);
                                        handleFilterChange(undefined, val, undefined);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Filter Berdasarkan Rapat" />
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

                            <div className="flex gap-2">
                                <Button type="submit" variant="default" className="w-full md:w-auto">
                                    Cari
                                </Button>
                                {(search ||
                                    activeCategory !== 'all' ||
                                    selectedMeeting !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResetFilters}
                                        className="w-full md:w-auto"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Content Table / Grid */}
                {documents.data.length === 0 ? (
                    <Card className="p-12 text-center border-dashed">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                                <Files className="size-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">Dokumen Tidak Ditemukan</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Tidak ada dokumen atau berkas yang cocok dengan kata kunci pencarian dan filter saat ini.
                            </p>
                            {(search ||
                                activeCategory !== 'all' ||
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
                ) : (
                    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-2/5">
                                        Dokumen & Berkas
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/6">
                                        Kategori
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground w-1/5">
                                        Rapat Terkait
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground">
                                        Pengunggah & Waktu
                                    </th>
                                    <th className="h-11 px-4 align-middle font-medium text-muted-foreground text-right w-36">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {documents.data.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="p-4 align-top">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-0.5 p-2 rounded-lg bg-muted/60 border shrink-0">
                                                    {getFileIcon(doc.file_type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-foreground text-sm line-clamp-1">
                                                        {doc.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                                                        {doc.file_name}
                                                    </div>
                                                    <div className="inline-flex items-center gap-2 text-[11px] text-muted-foreground/80 mt-1">
                                                        <span className="font-mono uppercase bg-muted/40 px-1 rounded">
                                                            {doc.file_type}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{formatFileSize(doc.file_size)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-4 align-top">
                                            {getCategoryBadge(doc.category)}
                                        </td>

                                        <td className="p-4 align-top">
                                            {doc.meeting ? (
                                                <Link
                                                    href={`/meetings/${doc.meeting_id}`}
                                                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                                                >
                                                    <ExternalLink className="size-3 shrink-0" />
                                                    <span className="line-clamp-2">{doc.meeting.title}</span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-muted-foreground italic">
                                                    Umum (Non-rapat)
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-4 align-top text-xs space-y-1">
                                            <div className="flex items-center gap-1 text-foreground font-medium">
                                                <UserIcon className="size-3 text-muted-foreground" />
                                                {doc.uploader?.name || 'Anonim'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <Calendar className="size-3" />
                                                {new Date(doc.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </td>

                                        <td className="p-4 align-top text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 px-2.5 text-xs text-primary bg-primary/10 hover:bg-primary/20"
                                                    asChild
                                                >
                                                    <a
                                                        href={`/documents/${doc.id}/download`}
                                                        title="Unduh Berkas"
                                                    >
                                                        <Download className="size-3.5 mr-1" />
                                                        Unduh
                                                    </a>
                                                </Button>

                                                {canDeleteDocument(doc) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(doc)}
                                                        className="h-8 px-2 text-destructive hover:bg-destructive/10"
                                                        title="Hapus Dokumen"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {documents.last_page > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
                        <div className="text-xs text-muted-foreground">
                            Menampilkan {documents.data.length} dari {documents.total} berkas
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {documents.links.map((link, idx) => {
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

                {/* Upload Modal Dialog */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UploadCloud className="size-5 text-primary" />
                                Unggah Dokumen Baru
                            </DialogTitle>
                            <DialogDescription>
                                Unggah berkas terkait surat undangan, bahan materi, notulen, atau bukti tindak lanjut.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-xs font-medium">
                                    Judul Dokumen <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Contoh: Materi Paparan RKAS 2026"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">{errors.title}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-xs font-medium">
                                    Kategori Dokumen <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.category}
                                    onValueChange={(
                                        val: 'undangan' | 'materi' | 'notulen_pdf' | 'bukti_tindak_lanjut'
                                    ) => setData('category', val)}
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="undangan">Surat Undangan</SelectItem>
                                        <SelectItem value="materi">Materi Paparan</SelectItem>
                                        <SelectItem value="notulen_pdf">Notulen Resmi PDF</SelectItem>
                                        <SelectItem value="bukti_tindak_lanjut">Bukti Tindak Lanjut</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && (
                                    <p className="text-xs text-destructive">{errors.category}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meeting_id" className="text-xs font-medium">
                                    Terkait Rapat (Opsional)
                                </Label>
                                <Select
                                    value={data.meeting_id || 'none'}
                                    onValueChange={(val) =>
                                        setData('meeting_id', val === 'none' ? '' : val)
                                    }
                                >
                                    <SelectTrigger id="meeting_id" className="w-full">
                                        <SelectValue placeholder="Pilih rapat jika berkaitan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Bukan Bagian dari Rapat (Umum)</SelectItem>
                                        {meetings.map((m) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.meeting_id && (
                                    <p className="text-xs text-destructive">{errors.meeting_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file" className="text-xs font-medium">
                                    Berkas File (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG - Maks 15MB) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setData('file', e.target.files[0]);
                                        }
                                    }}
                                    className="cursor-pointer"
                                    required
                                />
                                {errors.file && (
                                    <p className="text-xs text-destructive">{errors.file}</p>
                                )}
                                {progress && (
                                    <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-primary h-1.5 rounded-full"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsUploadOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Mengunggah...' : 'Unggah Berkas'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
