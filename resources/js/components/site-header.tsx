import { Link, usePage } from '@inertiajs/react';
import { HandHeart, LayoutDashboard, LogOut, ShieldCheck, Trophy, UserRound } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index as adminInitiatives } from '@/actions/App/Http/Controllers/Admin/AdminInitiativesController';
import { showUser } from '@/actions/App/Http/Controllers/ProfileController';
import { useUnionNav } from '@/lib/site-nav';
import { dashboard, home, login, logout, register } from '@/routes';

export type { NavLinkItem, ResolvedNavLink } from '@/lib/site-nav';
export { NAV_LINKS, getNavLinkHref, useUnionNav } from '@/lib/site-nav';

const accountMenuOverlayZ = 1000;
const accountMenuContentZ = 1001;

export function SiteHeader() {
    const page = usePage();
    const { auth, canRegister } = page.props;
    const user = auth.user;
    const isAdmin = auth.isAdmin;
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const { links } = useUnionNav();
    const isLoginPage = page.component === 'auth/login';
    const isRegisterPage = page.component === 'auth/register';

    return (
        <header className="sticky top-0 z-999 border-b border-border bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <Link
                    href={home()}
                    className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-foreground"
                >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <HandHeart className="size-5" />
                    </span>
                    همة
                </Link>
                {user && (
                    <span className="hidden items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1.5 text-sm font-semibold text-primary sm:inline-flex">
                        <Trophy className="size-3.5" />
                        {new Intl.NumberFormat('en-US').format(user.points)}
                        <span className="text-xs font-normal text-primary/70">
                            نقطة
                        </span>
                    </span>
                )}

                <nav className="hidden items-center gap-1 md:flex" dir="rtl">
                    {links.map((link) => (
                        <a
                            key={link.key}
                            href={link.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="flex shrink-0 items-center gap-2">
                    <AppearanceToggle />
                    {user ? (
                        <>
                            <DropdownMenu open={accountMenuOpen} onOpenChange={setAccountMenuOpen}>
                                <DropdownMenuTrigger
                                    className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    aria-label="قائمة الحساب"
                                    aria-expanded={accountMenuOpen}
                                >
                                    <Avatar className="size-9 border border-border">
                                        <AvatarImage src={user.avatar_url} alt={user.username} />
                                        <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
                                            {user.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="min-w-52"
                                    style={{ direction: 'rtl', zIndex: accountMenuContentZ }}
                                >
                                    <DropdownMenuLabel className="flex items-center gap-2 font-normal">
                                        <Avatar className="size-9 border border-border">
                                            <AvatarImage src={user.avatar_url} alt={user.username} />
                                            <AvatarFallback className="bg-muted text-muted-foreground">
                                                {user.username.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex min-w-0 flex-col text-right">
                                            <span className="truncate text-sm font-medium">{user.username}</span>
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Trophy className="size-3 shrink-0" />
                                                {new Intl.NumberFormat('en-US').format(user.points)} نقطة
                                            </span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href={showUser(user.username).url} className="flex w-full flex-row-reverse items-center gap-2">
                                            <UserRound className="size-4 shrink-0" />
                                            الملف الشخصي
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="cursor-pointer">
                                        <Link href={dashboard()} className="flex w-full flex-row-reverse items-center gap-2">
                                            <LayoutDashboard className="size-4 shrink-0" />
                                            لوحة التحكم
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                <Link
                                                    href={adminInitiatives().url}
                                                    className="flex w-full flex-row-reverse items-center gap-2 text-primary"
                                                >
                                                    <ShieldCheck className="size-4 shrink-0" />
                                                    لوحة الإدارة
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                                    >
                                        <Link
                                            href={logout()}
                                            method="post"
                                            as="button"
                                            className="flex w-full flex-row-reverse items-center gap-2 text-destructive [&_svg]:text-destructive"
                                        >
                                            <LogOut className="size-4 shrink-0 text-destructive" />
                                            خروج
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {accountMenuOpen &&
                                typeof document !== 'undefined' &&
                                createPortal(
                                    <button
                                        type="button"
                                        className="fixed inset-0 bg-black/45"
                                        style={{ zIndex: accountMenuOverlayZ }}
                                        aria-label="إغلاق القائمة"
                                        onClick={() => {
                                            setAccountMenuOpen(false);
                                        }}
                                    />,
                                    document.body,
                                )}
                        </>
                    ) : (
                        <>
                            {!isLoginPage && (
                                <Link
                                    href={login()}
                                    className="hidden rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:inline-flex"
                                >
                                    تسجيل الدخول
                                </Link>
                            )}
                            {canRegister && !isRegisterPage && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                                >
                                    إنشاء حساب
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
