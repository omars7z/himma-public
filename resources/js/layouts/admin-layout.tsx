import { Link, usePage } from '@inertiajs/react';
import {
    BarChart2,
    ChevronRight,
    ClipboardList,
    Gift,
    HandHeart,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { show as adminAnalytics } from '@/actions/App/Http/Controllers/Admin/AdminDashboardController';
import { index as adminInitiatives } from '@/actions/App/Http/Controllers/Admin/AdminInitiativesController';
import { index as adminRewards } from '@/actions/App/Http/Controllers/Admin/AdminRewardsController';
import { index as adminUsers } from '@/actions/App/Http/Controllers/Admin/AdminUsersController';
import { home, logout } from '@/routes';

type NavItem = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    matchPrefix?: string;
};

const NAV_ITEMS: NavItem[] = [
    {
        label: 'المبادرات',
        href: adminInitiatives().url,
        icon: ClipboardList,
        matchPrefix: '/admin/initiatives',
    },
    {
        label: 'التحليلات',
        href: adminAnalytics().url,
        icon: BarChart2,
        matchPrefix: '/admin/analytics',
    },
    {
        label: 'المستخدمون',
        href: adminUsers().url,
        icon: Users,
        matchPrefix: '/admin/users',
    },
    {
        label: 'المكافآت',
        href: adminRewards().url,
        icon: Gift,
        matchPrefix: '/admin/rewards',
    },
];

function SidebarContent({
    currentPath,
    onClose,
}: {
    currentPath: string;
    onClose?: () => void;
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    return (
        <div className="flex h-full flex-col" dir="rtl">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
                <Link
                    href={home()}
                    className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground"
                >
                    <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <HandHeart className="size-4" />
                    </span>
                    همة
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                        إدارة
                    </span>
                </Link>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="إغلاق القائمة"
                    >
                        <X className="size-5" />
                    </button>
                )}
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                    القائمة
                </p>
                <ul className="space-y-0.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = currentPath.startsWith(item.matchPrefix ?? item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                >
                                    <item.icon className="size-4 shrink-0" />
                                    {item.label}
                                    {isActive && (
                                        <ChevronRight className="mr-auto size-3.5 opacity-60" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom: user + actions */}
            <div className="shrink-0 border-t border-border p-4">
                <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 p-2.5">
                    <Avatar className="size-8 border border-border">
                        <AvatarImage src={user?.avatar_url} alt={user?.username} />
                        <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                            {(user?.username ?? '?').charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-right">
                        <p className="truncate text-sm font-medium text-foreground">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">مدير النظام</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                        <Link href={home()}>
                            <LayoutDashboard className="size-3.5" />
                            الموقع
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-1.5 text-xs text-destructive hover:bg-destructive/8 hover:text-destructive"
                    >
                        <Link href={logout()} method="post" as="button">
                            <LogOut className="size-3.5" />
                            خروج
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({
    children,
    pageTitle,
}: {
    children: React.ReactNode;
    pageTitle?: string;
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const page = usePage();
    const currentPath = new URL(page.url, window.location.origin).pathname;

    return (
        <div className="flex min-h-screen bg-muted/30" dir="rtl">
            {/* Desktop sidebar — sticky, viewport-height only */}
            <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-hidden border-l border-border bg-background md:flex md:flex-col">
                <SidebarContent currentPath={currentPath} />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/45 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="fixed inset-y-0 right-0 z-50 w-72 border-l border-border bg-background shadow-xl md:hidden">
                        <SidebarContent
                            currentPath={currentPath}
                            onClose={() => setMobileOpen(false)}
                        />
                    </aside>
                </>
            )}

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile topbar */}
                <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:hidden">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ShieldCheck className="size-4 text-primary" />
                        {pageTitle ?? 'لوحة الإدارة'}
                    </div>
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="فتح القائمة"
                    >
                        <Menu className="size-5" />
                    </button>
                </header>

                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
}
