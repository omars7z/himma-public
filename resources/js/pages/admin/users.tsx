import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    MapPin,
    MoreHorizontal,
    Search,
    ShieldCheck,
    ShieldOff,
    Trash2,
    TrendingUp,
    User as UserIcon,
    Users,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    destroy,
    toggleRole,
    adjustPoints,
} from '@/actions/App/Http/Controllers/Admin/AdminUsersController';
import { showUser } from '@/actions/App/Http/Controllers/ProfileController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { JORDAN_CITIES } from '@/constants/jordan-cities';
import AdminLayout from '@/layouts/admin-layout';

/* ── types ─────────────────────────────────────────────────── */
type User = {
    id: number;
    username: string;
    avatar_url: string;
    city: string | null;
    gender: string | null;
    points: number;
    role: string | null;
    status: string | null;
    initiatives_count: number;
    participations_count: number;
    created_at: string;
};

type Props = {
    users: User[];
    authId: number;
};

/* ── helpers ─────────────────────────────────────────────────── */
const GENDER_LABELS: Record<string, string> = { male: 'ذكر', female: 'أنثى' };

const fmt = (n: number) => new Intl.NumberFormat('ar-JO').format(n);

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('ar-JO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(iso));
}

function cityLabel(value: string) {
    return (
        JORDAN_CITIES.find((c) => c.value === value.toLowerCase())?.label ??
        value
    );
}

/* ── Adjust Points Dialog ───────────────────────────────────── */
function AdjustPointsDialog({
    user,
    open,
    onClose,
}: {
    user: User;
    open: boolean;
    onClose: () => void;
}) {
    const [delta, setDelta] = useState('');
    const [busy, setBusy] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const n = parseInt(delta, 10);

        if (isNaN(n) || n === 0) {
return;
}

        setBusy(true);
        router.post(
            adjustPoints(user.id).url,
            { delta: n },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `تم تعديل نقاط ${user.username}: ${n > 0 ? '+' : ''}${n}`,
                    );
                    setDelta('');
                    onClose();
                },
                onError: () => toast.error('حدث خطأ أثناء تعديل النقاط'),
                onFinish: () => setBusy(false),
            },
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) {
 setDelta(''); onClose(); 
}
            }}
        >
            <DialogContent className="sm:max-w-sm" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="size-4 text-primary" />
                        تعديل نقاط {user.username}
                    </DialogTitle>
                </DialogHeader>

                <div className="mb-3 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Avatar className="size-9 border border-border">
                        <AvatarImage src={user.avatar_url} alt={user.username} />
                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                            {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            الرصيد الحالي:{' '}
                            <span className="font-bold text-primary">
                                {fmt(user.points)} نقطة
                            </span>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            المقدار (موجب للإضافة، سالب للخصم)
                        </label>
                        <Input
                            ref={inputRef}
                            type="number"
                            value={delta}
                            onChange={(e) => setDelta(e.target.value)}
                            placeholder="مثال: 50 أو -20"
                            min={-10000}
                            max={10000}
                            dir="ltr"
                            className="text-center"
                            autoFocus
                        />
                        {delta && !isNaN(parseInt(delta, 10)) && (
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                الرصيد بعد التعديل:{' '}
                                <span className="font-bold text-foreground">
                                    {fmt(
                                        Math.max(
                                            0,
                                            user.points + parseInt(delta, 10),
                                        ),
                                    )}{' '}
                                    نقطة
                                </span>
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={busy || !delta || delta === '0'}
                            className="flex-1"
                        >
                            {busy ? 'جارٍ التعديل…' : 'تأكيد'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={busy}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

/* ── Delete Confirm Dialog ──────────────────────────────────── */
function DeleteConfirmDialog({
    user,
    open,
    onClose,
}: {
    user: User;
    open: boolean;
    onClose: () => void;
}) {
    const [busy, setBusy] = useState(false);

    function handleDelete() {
        setBusy(true);
        router.delete(destroy(user.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`تم حذف المستخدم ${user.username}`);
                onClose();
            },
            onError: () => toast.error('حدث خطأ أثناء الحذف'),
            onFinish: () => setBusy(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
 if (!v) {
onClose();
} 
}}>
            <DialogContent className="sm:max-w-sm" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base text-destructive">
                        <Trash2 className="size-4" />
                        حذف المستخدم
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                        هذا الإجراء <span className="font-bold">لا يمكن التراجع عنه</span>.
                        سيُحذف حساب{' '}
                        <span className="font-bold">@{user.username}</span> مع
                        جميع بياناته نهائيًا.
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            disabled={busy}
                            onClick={handleDelete}
                            className="flex-1"
                        >
                            {busy ? 'جارٍ الحذف…' : 'نعم، احذف الحساب'}
                        </Button>
                        <Button variant="outline" onClick={onClose} disabled={busy}>
                            إلغاء
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ── Row Actions ────────────────────────────────────────────── */
function RowActions({
    user,
    isSelf,
}: {
    user: User;
    isSelf: boolean;
}) {
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [roleLoading, setRoleLoading] = useState(false);

    function handleToggleRole() {
        setRoleLoading(true);
        router.post(
            toggleRole(user.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        `تم تغيير دور ${user.username} إلى ${user.role === 'admin' ? 'مستخدم' : 'مدير'}`,
                    ),
                onError: () => toast.error('حدث خطأ أثناء تغيير الدور'),
                onFinish: () => setRoleLoading(false),
            },
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">إجراءات</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" dir="rtl">
                    {/* View profile */}
                    <DropdownMenuItem asChild>
                        <Link
                            href={showUser(user.username).url}
                            className="flex cursor-pointer items-center gap-2"
                        >
                            <UserIcon className="size-3.5 text-muted-foreground" />
                            عرض الملف الشخصي
                        </Link>
                    </DropdownMenuItem>

                    {/* Adjust points */}
                    <DropdownMenuItem
                        className="cursor-pointer gap-2"
                        onSelect={() => setAdjustOpen(true)}
                    >
                        <TrendingUp className="size-3.5 text-muted-foreground" />
                        تعديل النقاط
                    </DropdownMenuItem>

                    {/* Toggle role — not for self */}
                    {!isSelf && (
                        <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            disabled={roleLoading}
                            onSelect={handleToggleRole}
                        >
                            {user.role === 'admin' ? (
                                <>
                                    <ShieldOff className="size-3.5 text-muted-foreground" />
                                    إلغاء صلاحية الإدارة
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="size-3.5 text-muted-foreground" />
                                    ترقية إلى مدير
                                </>
                            )}
                        </DropdownMenuItem>
                    )}

                    {/* Delete — not for self or other admins */}
                    {!isSelf && user.role !== 'admin' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                                onSelect={() => setDeleteOpen(true)}
                            >
                                <Trash2 className="size-3.5" />
                                حذف المستخدم
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <AdjustPointsDialog
                user={user}
                open={adjustOpen}
                onClose={() => setAdjustOpen(false)}
            />
            <DeleteConfirmDialog
                user={user}
                open={deleteOpen}
                onClose={() => setDeleteOpen(false)}
            />
        </>
    );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function AdminUsersPage({ users, authId }: Props) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const q = search.toLowerCase();
            const matchSearch =
                !search ||
                u.username.toLowerCase().includes(q) ||
                (u.city ?? '').toLowerCase().includes(q);
            const matchRole =
                roleFilter === 'all' ||
                (roleFilter === 'admin' && u.role === 'admin') ||
                (roleFilter === 'user' && u.role !== 'admin');

            return matchSearch && matchRole;
        });
    }, [users, search, roleFilter]);

    return (
        <AdminLayout pageTitle="المستخدمون">
            <Head title="المستخدمون — الإدارة" />
            <Toaster position="top-center" richColors />

            <div
                className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"
                dir="rtl"
            >
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Users className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            المستخدمون
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {fmt(users.length)} مستخدم مسجّل
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-48 flex-1">
                        <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="ابحث باسم المستخدم أو المحافظة…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pr-9 text-right"
                            dir="rtl"
                        />
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
                        {(
                            [
                                ['all', 'الكل'],
                                ['user', 'مستخدمون'],
                                ['admin', 'مدراء'],
                            ] as const
                        ).map(([role, label]) => (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setRoleFilter(role)}
                                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                    roleFilter === role
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm text-muted-foreground">
                            {filtered.length} نتيجة
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <div className="py-16 text-center text-sm text-muted-foreground">
                                لا توجد نتائج مطابقة
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm" dir="rtl">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 text-right text-xs text-muted-foreground">
                                            <th className="px-4 py-3 font-medium">
                                                المستخدم
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                المحافظة
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                الجنس
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                النقاط
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                المبادرات
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                المشاركات
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                الدور
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                التسجيل
                                            </th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filtered.map((user) => (
                                            <tr
                                                key={user.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                {/* User */}
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={showUser(user.username).url}
                                                        className="flex items-center gap-2.5 hover:opacity-80"
                                                    >
                                                        <Avatar className="size-8 border border-border">
                                                            <AvatarImage
                                                                src={user.avatar_url}
                                                                alt={user.username}
                                                            />
                                                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                                                {user.username
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium text-foreground">
                                                            {user.username}
                                                        </span>
                                                    </Link>
                                                </td>

                                                {/* City */}
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.city ? (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="size-3.5 shrink-0" />
                                                            {cityLabel(user.city)}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>

                                                {/* Gender */}
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {user.gender
                                                        ? (GENDER_LABELS[user.gender] ?? user.gender)
                                                        : '—'}
                                                </td>

                                                {/* Points */}
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-primary">
                                                        {fmt(user.points)}
                                                    </span>
                                                </td>

                                                {/* Initiatives */}
                                                <td className="px-4 py-3 text-center text-muted-foreground">
                                                    {user.initiatives_count}
                                                </td>

                                                {/* Participations */}
                                                <td className="px-4 py-3 text-center text-muted-foreground">
                                                    {user.participations_count}
                                                </td>

                                                {/* Role */}
                                                <td className="px-4 py-3">
                                                    {user.role === 'admin' ? (
                                                        <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/15">
                                                            <ShieldCheck className="size-3" />
                                                            مدير
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary">
                                                            مستخدم
                                                        </Badge>
                                                    )}
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {formatDate(user.created_at)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-3">
                                                    <RowActions
                                                        user={user}
                                                        isSelf={user.id === authId}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
