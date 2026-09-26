import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    KeyRound,
    Lock,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    Trash2,
    UserCheck,
    UserCog,
    UserMinus,
    UserPlus,
    Users,
    X,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import type { Auth, BreadcrumbItem, Role, User } from '@/types';

interface PaginatedUsers {
    data: User[];
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

interface UserIndexProps {
    users: PaginatedUsers;
    departments: string[];
    filters: {
        search?: string;
        role?: string;
        department?: string;
    };
    stats: {
        total: number;
        admin: number;
        sekretaris: number;
        pimpinan: number;
        peserta: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Manajemen Pengguna',
        href: '/users',
    },
];

export default function UserIndex({
    users,
    departments,
    filters,
    stats,
}: UserIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const currentUserId = auth.user.id;

    // Filters state
    const [search, setSearch] = useState(filters.search ?? '');
    const [roleFilter, setRoleFilter] = useState(filters.role ?? 'all');
    const [departmentFilter, setDepartmentFilter] = useState(
        filters.department ?? 'all'
    );

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Inertia Create Form
    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'peserta' as Role,
        position: '',
        department: '',
        phone: '',
        is_active: true,
    });

    // Inertia Edit Form
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'peserta' as Role,
        position: '',
        department: '',
        phone: '',
        is_active: true,
    });

    const applyFilter = (params: {
        search?: string;
        role?: string;
        department?: string;
    }) => {
        const query: Record<string, string> = {};

        const nextSearch = params.search !== undefined ? params.search : search;
        const nextRole = params.role !== undefined ? params.role : roleFilter;
        const nextDepartment =
            params.department !== undefined ? params.department : departmentFilter;

        if (nextSearch.trim()) query.search = nextSearch.trim();
        if (nextRole && nextRole !== 'all') query.role = nextRole;
        if (nextDepartment && nextDepartment !== 'all')
            query.department = nextDepartment;

        router.get('/users', query, {
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
        setRoleFilter('all');
        setDepartmentFilter('all');
        router.get('/users', {}, { preserveState: true });
    };

    // Open Edit Dialog
    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: (user.role as Role) || 'peserta',
            position: user.position || '',
            department: user.department || '',
            phone: user.phone || '',
            is_active: user.is_active ?? true,
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    // Handle Create Submit
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/users', {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    // Handle Edit Submit
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(`/users/${editingUser.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    // Handle Toggle Active Status
    const handleToggleActive = (user: User) => {
        const nextStatus = !user.is_active;
        router.put(
            `/users/${user.id}`,
            {
                name: user.name,
                email: user.email,
                role: user.role,
                position: user.position,
                department: user.department,
                phone: user.phone,
                is_active: nextStatus,
            },
            {
                preserveScroll: true,
            }
        );
    };

    // Handle Delete User
    const handleDeleteUser = (user: User) => {
        if (user.id === currentUserId) return;

        if (
            confirm(
                `Apakah Anda yakin ingin menghapus akun ${user.name} (${user.email})? Tindakan ini tidak dapat dibatalkan.`
            )
        ) {
            router.delete(`/users/${user.id}`, {
                preserveScroll: true,
            });
        }
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const getRoleBadge = (role?: Role | string) => {
        switch (role) {
            case 'admin':
                return (
                    <Badge className="border-purple-300 bg-purple-100 text-purple-800 hover:bg-purple-200 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300">
                        Admin
                    </Badge>
                );
            case 'sekretaris':
                return (
                    <Badge className="border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
                        Sekretaris
                    </Badge>
                );
            case 'pimpinan':
                return (
                    <Badge className="border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Pimpinan
                    </Badge>
                );
            case 'peserta':
            default:
                return (
                    <Badge className="border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Peserta
                    </Badge>
                );
        }
    };

    const hasActiveFilters =
        Boolean(search) || roleFilter !== 'all' || departmentFilter !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Pengguna" />

            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Manajemen Pengguna
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Kelola data akun, peran akses, jabatan, dan status keaktifan pengguna dalam sistem.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            createForm.reset();
                            createForm.clearErrors();
                            setIsCreateOpen(true);
                        }}
                        className="gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Tambah Pengguna Baru
                    </Button>
                </div>

                {/* Metric Header Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    <Card className="shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground">
                                Total Pengguna
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Terdaftar di sistem</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                Admin Sistem
                            </CardTitle>
                            <ShieldAlert className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.admin}</div>
                            <p className="text-xs text-muted-foreground">Akses penuh sistem</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-sky-600 dark:text-sky-400">
                                Sekretaris
                            </CardTitle>
                            <UserCog className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.sekretaris}</div>
                            <p className="text-xs text-muted-foreground">Pengelola rapat</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Pimpinan
                            </CardTitle>
                            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.pimpinan}</div>
                            <p className="text-xs text-muted-foreground">Persetujuan & review</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xs">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Peserta / Pegawai
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">{stats.peserta}</div>
                            <p className="text-xs text-muted-foreground">Anggota rapat</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Controls */}
                <Card className="shadow-xs">
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <form
                                onSubmit={handleSearchSubmit}
                                className="relative flex-1"
                            >
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Cari berdasarkan nama, email, jabatan, departemen..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-16"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    variant="ghost"
                                    className="absolute right-1 top-1/2 h-7 -translate-y-1/2 px-2 text-xs"
                                >
                                    Cari
                                </Button>
                            </form>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Role Filter */}
                                <div className="w-full sm:w-44">
                                    <Select
                                        value={roleFilter}
                                        onValueChange={(val) => {
                                            setRoleFilter(val);
                                            applyFilter({ role: val });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Role</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="sekretaris">Sekretaris</SelectItem>
                                            <SelectItem value="pimpinan">Pimpinan</SelectItem>
                                            <SelectItem value="peserta">Peserta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Department Filter */}
                                <div className="w-full sm:w-48">
                                    <Select
                                        value={departmentFilter}
                                        onValueChange={(val) => {
                                            setDepartmentFilter(val);
                                            applyFilter({ department: val });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Pilih Departemen" />
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
                                </div>

                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleClearFilters}
                                        title="Reset Filter"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* User Table Card */}
                <Card className="shadow-xs">
                    <CardHeader className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Daftar Pengguna
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Total {users.total} pengguna ditemukan
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-y bg-muted/40 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Pengguna</th>
                                    <th className="px-6 py-3 font-semibold">Role</th>
                                    <th className="px-6 py-3 font-semibold">Jabatan & Departemen</th>
                                    <th className="px-6 py-3 font-semibold">Kontak</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-muted-foreground"
                                        >
                                            <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                                            <p className="font-medium">Tidak ada data pengguna.</p>
                                            <p className="text-xs">Coba sesuaikan filter pencarian Anda.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => {
                                        const isSelf = user.id === currentUserId;
                                        return (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                {/* User Info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            {user.avatar ? (
                                                                <AvatarImage
                                                                    src={user.avatar}
                                                                    alt={user.name}
                                                                />
                                                            ) : null}
                                                            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-foreground">
                                                                    {user.name}
                                                                </span>
                                                                {isSelf && (
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] uppercase tracking-wider"
                                                                    >
                                                                        Anda
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Mail className="h-3 w-3" />
                                                                <span>{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Role */}
                                                <td className="px-6 py-4">
                                                    {getRoleBadge(user.role)}
                                                </td>

                                                {/* Position & Department */}
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-foreground">
                                                        {user.position || '-'}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Building2 className="h-3 w-3" />
                                                        <span>{user.department || '-'}</span>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-6 py-4 text-xs text-muted-foreground">
                                                    {user.phone ? (
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{user.phone}</span>
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {user.is_active ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                        >
                                                            <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="outline"
                                                            className="gap-1 border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
                                                        >
                                                            <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                                                            Nonaktif
                                                        </Badge>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Menu Opsi</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenEdit(user)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                <UserCog className="h-4 w-4" />
                                                                Edit Pengguna
                                                            </DropdownMenuItem>

                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleActive(user)}
                                                                className="gap-2 cursor-pointer"
                                                            >
                                                                {user.is_active ? (
                                                                    <>
                                                                        <UserMinus className="h-4 w-4 text-amber-500" />
                                                                        <span>Nonaktifkan Akun</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="h-4 w-4 text-emerald-500" />
                                                                        <span>Aktifkan Akun</span>
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />

                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteUser(user)}
                                                                disabled={isSelf}
                                                                className="gap-2 text-rose-600 focus:text-rose-600 cursor-pointer disabled:opacity-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span>Hapus Akun</span>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 sm:flex-row">
                            <div className="text-xs text-muted-foreground">
                                Menampilkan baris {(users.current_page - 1) * users.per_page + 1} hingga{' '}
                                {Math.min(users.current_page * users.per_page, users.total)} dari{' '}
                                {users.total} total data
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                                {users.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-3 py-1.5 text-xs text-muted-foreground opacity-50 cursor-not-allowed"
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
                                            className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${
                                                link.active
                                                    ? 'border-primary bg-primary font-semibold text-primary-foreground'
                                                    : 'text-foreground hover:bg-muted'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Dialog Tambah Pengguna Baru */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
                        <DialogDescription>
                            Isi formulir untuk menambahkan akun pengguna baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        {/* Nama */}
                        <div className="space-y-1.5">
                            <Label htmlFor="create-name">
                                Nama Lengkap <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                required
                            />
                            {createForm.errors.name && (
                                <p className="text-xs text-rose-500">{createForm.errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="create-email">
                                Alamat Email <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="create-email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="budi@instansi.go.id"
                                required
                            />
                            {createForm.errors.email && (
                                <p className="text-xs text-rose-500">{createForm.errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="create-password">
                                Kata Sandi <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="create-password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            {createForm.errors.password && (
                                <p className="text-xs text-rose-500">{createForm.errors.password}</p>
                            )}
                        </div>

                        {/* Role & Phone */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-role">
                                    Role Akses <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={createForm.data.role}
                                    onValueChange={(val: Role) =>
                                        createForm.setData('role', val)
                                    }
                                >
                                    <SelectTrigger id="create-role" className="w-full">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="sekretaris">Sekretaris</SelectItem>
                                        <SelectItem value="pimpinan">Pimpinan</SelectItem>
                                        <SelectItem value="peserta">Peserta</SelectItem>
                                    </SelectContent>
                                </Select>
                                {createForm.errors.role && (
                                    <p className="text-xs text-rose-500">{createForm.errors.role}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-phone">Nomor Telepon</Label>
                                <Input
                                    id="create-phone"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                />
                                {createForm.errors.phone && (
                                    <p className="text-xs text-rose-500">{createForm.errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Jabatan & Departemen */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="create-position">Jabatan</Label>
                                <Input
                                    id="create-position"
                                    value={createForm.data.position}
                                    onChange={(e) =>
                                        createForm.setData('position', e.target.value)
                                    }
                                    placeholder="Contoh: Kepala Seksi"
                                />
                                {createForm.errors.position && (
                                    <p className="text-xs text-rose-500">{createForm.errors.position}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="create-department">Departemen / Bidang</Label>
                                <Input
                                    id="create-department"
                                    value={createForm.data.department}
                                    onChange={(e) =>
                                        createForm.setData('department', e.target.value)
                                    }
                                    placeholder="Contoh: IT & Sistem Informasi"
                                />
                                {createForm.errors.department && (
                                    <p className="text-xs text-rose-500">{createForm.errors.department}</p>
                                )}
                            </div>
                        </div>

                        {/* Status Keaktifan */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="create-is-active"
                                checked={createForm.data.is_active}
                                onCheckedChange={(checked) =>
                                    createForm.setData('is_active', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="create-is-active"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Status Akun Aktif (Dapat masuk ke dalam sistem)
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Dialog Edit Pengguna */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-md sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Data Pengguna</DialogTitle>
                        <DialogDescription>
                            Perbarui informasi akun, hak akses role, serta keaktifan pengguna.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        {/* Nama */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-name">
                                Nama Lengkap <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Nama Pengguna"
                                required
                            />
                            {editForm.errors.name && (
                                <p className="text-xs text-rose-500">{editForm.errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-email">
                                Alamat Email <span className="text-rose-500">*</span>
                            </Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                placeholder="email@instansi.go.id"
                                required
                            />
                            {editForm.errors.email && (
                                <p className="text-xs text-rose-500">{editForm.errors.email}</p>
                            )}
                        </div>

                        {/* Password (Optional) */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-password">
                                Kata Sandi Baru <span className="text-xs text-muted-foreground">(Kosongkan jika tidak diubah)</span>
                            </Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter baru"
                            />
                            {editForm.errors.password && (
                                <p className="text-xs text-rose-500">{editForm.errors.password}</p>
                            )}
                        </div>

                        {/* Role & Phone */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-role">
                                    Role Akses <span className="text-rose-500">*</span>
                                </Label>
                                <Select
                                    value={editForm.data.role}
                                    onValueChange={(val: Role) =>
                                        editForm.setData('role', val)
                                    }
                                >
                                    <SelectTrigger id="edit-role" className="w-full">
                                        <SelectValue placeholder="Pilih Role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="sekretaris">Sekretaris</SelectItem>
                                        <SelectItem value="pimpinan">Pimpinan</SelectItem>
                                        <SelectItem value="peserta">Peserta</SelectItem>
                                    </SelectContent>
                                </Select>
                                {editForm.errors.role && (
                                    <p className="text-xs text-rose-500">{editForm.errors.role}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-phone">Nomor Telepon</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                />
                                {editForm.errors.phone && (
                                    <p className="text-xs text-rose-500">{editForm.errors.phone}</p>
                                )}
                            </div>
                        </div>

                        {/* Jabatan & Departemen */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-position">Jabatan</Label>
                                <Input
                                    id="edit-position"
                                    value={editForm.data.position}
                                    onChange={(e) =>
                                        editForm.setData('position', e.target.value)
                                    }
                                    placeholder="Jabatan pengguna"
                                />
                                {editForm.errors.position && (
                                    <p className="text-xs text-rose-500">{editForm.errors.position}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-department">Departemen / Bidang</Label>
                                <Input
                                    id="edit-department"
                                    value={editForm.data.department}
                                    onChange={(e) =>
                                        editForm.setData('department', e.target.value)
                                    }
                                    placeholder="Departemen pengguna"
                                />
                                {editForm.errors.department && (
                                    <p className="text-xs text-rose-500">{editForm.errors.department}</p>
                                )}
                            </div>
                        </div>

                        {/* Status Keaktifan */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit-is-active"
                                checked={editForm.data.is_active}
                                onCheckedChange={(checked) =>
                                    editForm.setData('is_active', Boolean(checked))
                                }
                            />
                            <Label
                                htmlFor="edit-is-active"
                                className="text-sm font-normal cursor-pointer"
                            >
                                Status Akun Aktif (Dapat masuk ke dalam sistem)
                            </Label>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
