import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    FileText,
    FolderGit2,
    FolderLock,
    LayoutDashboard,
    SquareCheckBig,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Manajemen Rapat',
        href: '/meetings',
        icon: Calendar,
    },
    {
        title: 'Notulen Rapat',
        href: '/minutes',
        icon: FileText,
    },
    {
        title: 'Tindak Lanjut',
        href: '/action-items',
        icon: SquareCheckBig,
    },
    {
        title: 'Repositori Dokumen',
        href: '/documents',
        icon: FolderLock,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;

    const items: NavItem[] =
        auth.user?.role === 'admin'
            ? [
                  ...mainNavItems,
                  {
                      title: 'Manajemen Pengguna',
                      href: '/users',
                      icon: Users,
                  },
              ]
            : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
