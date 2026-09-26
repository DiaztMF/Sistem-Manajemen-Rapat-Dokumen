import { router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { InAppNotification } from '@/types/meeting';
import { cn } from '@/lib/utils';

function getXsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'baru saja';
    if (minutes < 60) return `${minutes} mnt lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} hari lalu`;
    return new Date(iso).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

type NotificationsResponse = {
    notifications: InAppNotification[];
    unread_count: number;
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/notifications', {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) return;
            const data = (await res.json()) as NotificationsResponse;
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchNotifications();
    }, [fetchNotifications]);

    async function patch(url: string): Promise<boolean> {
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };
        const token = getXsrfToken();
        if (token) headers['X-XSRF-TOKEN'] = token;
        const res = await fetch(url, { method: 'PATCH', headers });
        return res.ok;
    }

    async function markAsRead(id: string): Promise<void> {
        if (await patch(`/notifications/${id}/read`)) {
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, read_at: new Date().toISOString() }
                        : n,
                ),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        }
    }

    async function markAllAsRead(): Promise<void> {
        if (await patch('/notifications/read-all')) {
            setNotifications((prev) =>
                prev.map((n) => ({
                    ...n,
                    read_at: n.read_at ?? new Date().toISOString(),
                })),
            );
            setUnreadCount(0);
        }
    }

    function handleItemClick(n: InAppNotification): void {
        void markAsRead(n.id);
        setOpen(false);
        const url =
            typeof n.data.url === 'string' && n.data.url.length > 0
                ? n.data.url
                : null;
        if (url) router.visit(url);
    }

    return (
        <DropdownMenu
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (next) void fetchNotifications();
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 cursor-pointer"
                    aria-label="Notifikasi"
                >
                    <Bell className="!size-5 opacity-80" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifikasi</span>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={() => void markAllAsRead()}
                            className="flex cursor-pointer items-center gap-1 text-xs font-normal text-muted-foreground hover:text-foreground"
                        >
                            <CheckCheck className="size-3.5" />
                            Tandai semua dibaca
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {loading && notifications.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                            Memuat notifikasi...
                        </p>
                    ) : notifications.length === 0 ? (
                        <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                            Belum ada notifikasi.
                        </p>
                    ) : (
                        notifications.map((n) => (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => handleItemClick(n)}
                                className={cn(
                                    'flex w-full cursor-pointer flex-col gap-0.5 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent',
                                    n.read_at === null && 'bg-accent/50',
                                )}
                            >
                                <span className="font-medium">
                                    {n.data.title}
                                </span>
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                    {n.data.message}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {timeAgo(n.created_at)}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
