import { Head, router } from '@inertiajs/react';
import {
    Gift,
    ImageOff,
    Pencil,
    Plus,
    Star,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
    store,
    update,
    destroy,
} from '@/actions/App/Http/Controllers/Admin/AdminRewardsController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import AdminLayout from '@/layouts/admin-layout';

/* ── types ──────────────────────────────────────────────────── */
type Reward = {
    id: number;
    title: string;
    description: string | null;
    image: string | null;
    points_cost: number;
    redemptions_count: number;
    created_at: string;
};

type FormData = {
    title: string;
    description: string;
    image: string;
    points_cost: string;
};

type Props = { rewards: Reward[] };

/* ── helpers ─────────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat('ar-JO').format(n);

function formatDate(iso: string) {
    return new Intl.DateTimeFormat('ar-JO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(iso));
}

const EMPTY_FORM: FormData = {
    title: '',
    description: '',
    image: '',
    points_cost: '',
};

/* ── Image Preview ───────────────────────────────────────────── */
function ImagePreview({ src }: { src: string }) {
    const [failed, setFailed] = useState(false);

    useEffect(() => setFailed(false), [src]);

    if (!src || failed) {
        return (
            <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                <ImageOff className="size-5" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt=""
            className="size-full object-cover"
            onError={() => setFailed(true)}
        />
    );
}

/* ── Reward Form Dialog ──────────────────────────────────────── */
function RewardFormDialog({
    open,
    reward,
    onClose,
}: {
    open: boolean;
    reward: Reward | null;
    onClose: () => void;
}) {
    const isEdit = reward !== null;

    const [data, setData] = useState<FormData>(EMPTY_FORM);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [busy, setBusy] = useState(false);

    /* Populate form when editing */
    useEffect(() => {
        if (open) {
            setData(
                reward
                    ? {
                          title: reward.title,
                          description: reward.description ?? '',
                          image: reward.image ?? '',
                          points_cost: String(reward.points_cost),
                      }
                    : EMPTY_FORM,
            );
            setErrors({});
        }
    }, [open, reward]);

    function set(field: keyof FormData, value: string) {
        setData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            title: data.title.trim(),
            description: data.description.trim() || null,
            image: data.image.trim() || null,
            points_cost: parseInt(data.points_cost, 10),
        };

        setBusy(true);

        const url = isEdit ? update(reward!.id).url : store().url;
        const method = isEdit ? router.put : router.post;

        method(url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    isEdit ? 'تم تحديث المكافأة بنجاح' : 'تمت إضافة المكافأة بنجاح',
                );
                onClose();
            },
            onError: (errs) => {
                const mapped: Partial<Record<keyof FormData, string>> = {};

                for (const [k, v] of Object.entries(errs)) {
                    mapped[k as keyof FormData] = Array.isArray(v) ? v[0] : String(v);
                }

                setErrors(mapped);
            },
            onFinish: () => setBusy(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => {
 if (!v) {
onClose();
} 
}}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <Gift className="size-4 text-primary" />
                        {isEdit ? 'تعديل المكافأة' : 'إضافة مكافأة جديدة'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Title */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            اسم المكافأة <span className="text-destructive">*</span>
                        </label>
                        <Input
                            value={data.title}
                            onChange={(e) => set('title', e.target.value)}
                            placeholder="مثال: كوبون خصم 10%"
                            dir="rtl"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-destructive">{errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            الوصف
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => set('description', e.target.value)}
                            rows={3}
                            placeholder="صِف المكافأة وكيفية استخدامها…"
                            dir="rtl"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-destructive">{errors.description}</p>
                        )}
                    </div>

                    {/* Image URL + preview */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            رابط الصورة
                        </label>
                        <Input
                            value={data.image}
                            onChange={(e) => set('image', e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            dir="ltr"
                            className="text-left"
                        />
                        {errors.image && (
                            <p className="mt-1 text-xs text-destructive">{errors.image}</p>
                        )}
                        {data.image && (
                            <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                                <ImagePreview src={data.image} />
                            </div>
                        )}
                    </div>

                    {/* Points cost */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            تكلفة النقاط <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <Star className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                            <Input
                                type="number"
                                min={1}
                                max={100000}
                                value={data.points_cost}
                                onChange={(e) => set('points_cost', e.target.value)}
                                placeholder="مثال: 500"
                                dir="ltr"
                                className="pr-9 text-left"
                            />
                        </div>
                        {errors.points_cost && (
                            <p className="mt-1 text-xs text-destructive">{errors.points_cost}</p>
                        )}
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            disabled={busy || !data.title.trim() || !data.points_cost}
                            className="flex-1"
                        >
                            {busy
                                ? 'جارٍ الحفظ…'
                                : isEdit
                                  ? 'حفظ التعديلات'
                                  : 'إضافة المكافأة'}
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

/* ── Delete Confirm Dialog ───────────────────────────────────── */
function DeleteConfirmDialog({
    reward,
    open,
    onClose,
}: {
    reward: Reward;
    open: boolean;
    onClose: () => void;
}) {
    const [busy, setBusy] = useState(false);

    function handleDelete() {
        setBusy(true);
        router.delete(destroy(reward.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('تم حذف المكافأة بنجاح');
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
                        حذف المكافأة
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                        سيُحذف{' '}
                        <span className="font-bold">"{reward.title}"</span>{' '}
                        نهائيًا.
                        {reward.redemptions_count > 0 && (
                            <p className="mt-1 font-medium">
                                تنبيه: هذه المكافأة استُردّت{' '}
                                {fmt(reward.redemptions_count)} مرة.
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            disabled={busy}
                            onClick={handleDelete}
                            className="flex-1"
                        >
                            {busy ? 'جارٍ الحذف…' : 'تأكيد الحذف'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={busy}
                        >
                            إلغاء
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function AdminRewardsPage({ rewards }: Props) {
    const [formOpen, setFormOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<Reward | null>(null);
    const [deletingReward, setDeletingReward] = useState<Reward | null>(null);

    const totalRedemptions = rewards.reduce(
        (sum, r) => sum + r.redemptions_count,
        0,
    );
    const mostRedeemed = rewards.reduce(
        (max, r) =>
            r.redemptions_count > (max?.redemptions_count ?? -1) ? r : max,
        null as Reward | null,
    );

    function openCreate() {
        setEditingReward(null);
        setFormOpen(true);
    }

    function openEdit(r: Reward) {
        setEditingReward(r);
        setFormOpen(true);
    }

    return (
        <AdminLayout pageTitle="المكافآت">
            <Head title="المكافآت — الإدارة" />
            <Toaster position="top-center" richColors />

            <div
                className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6"
                dir="rtl"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                            <Gift className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">
                                المكافآت
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {rewards.length} مكافأة ·{' '}
                                {fmt(totalRedemptions)} عملية استرداد
                            </p>
                        </div>
                    </div>

                    <Button onClick={openCreate} className="gap-2 shrink-0">
                        <Plus className="size-4" />
                        إضافة مكافأة
                    </Button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="p-5 text-right">
                            <p className="text-sm text-muted-foreground">
                                إجمالي المكافآت
                            </p>
                            <p className="mt-1 text-3xl font-bold text-foreground">
                                {rewards.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 text-right">
                            <p className="text-sm text-muted-foreground">
                                عمليات الاسترداد
                            </p>
                            <p className="mt-1 text-3xl font-bold text-foreground">
                                {fmt(totalRedemptions)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2 sm:col-span-1">
                        <CardContent className="p-5 text-right">
                            <p className="text-sm text-muted-foreground">
                                الأكثر استرداداً
                            </p>
                            <p className="mt-1 truncate text-base font-bold text-foreground">
                                {mostRedeemed?.title ?? '—'}
                            </p>
                            {mostRedeemed && (
                                <p className="text-xs text-muted-foreground">
                                    {fmt(mostRedeemed.redemptions_count)} مرة
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rewards table */}
                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-sm text-muted-foreground">
                            قائمة المكافآت
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {rewards.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                                    <Gift className="size-6" />
                                </span>
                                <p className="text-sm text-muted-foreground">
                                    لا توجد مكافآت حتى الآن
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openCreate}
                                    className="gap-1.5"
                                >
                                    <Plus className="size-3.5" />
                                    أضف أول مكافأة
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm" dir="rtl">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 text-right text-xs text-muted-foreground">
                                            <th className="px-4 py-3 font-medium">
                                                المكافأة
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                التكلفة
                                            </th>
                                            <th className="px-4 py-3 text-center font-medium">
                                                الاستردادات
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                تاريخ الإضافة
                                            </th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rewards.map((reward) => (
                                            <tr
                                                key={reward.id}
                                                className="transition-colors hover:bg-muted/30"
                                            >
                                                {/* Reward info */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {/* Thumbnail */}
                                                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                                                            <ImagePreview
                                                                src={reward.image ?? ''}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-foreground">
                                                                {reward.title}
                                                            </p>
                                                            {reward.description && (
                                                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                                    {reward.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Points cost */}
                                                <td className="px-4 py-3">
                                                    <span className="flex items-center gap-1 font-semibold text-primary">
                                                        <Star className="size-3.5 shrink-0" />
                                                        {fmt(reward.points_cost)}
                                                    </span>
                                                </td>

                                                {/* Redemptions */}
                                                <td className="px-4 py-3 text-center">
                                                    <Badge
                                                        variant={
                                                            reward.redemptions_count > 0
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className={
                                                            reward.redemptions_count > 0
                                                                ? 'bg-primary/10 text-primary hover:bg-primary/15'
                                                                : ''
                                                        }
                                                    >
                                                        {fmt(reward.redemptions_count)}
                                                    </Badge>
                                                </td>

                                                {/* Date */}
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {formatDate(reward.created_at)}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                                                            onClick={() => openEdit(reward)}
                                                            title="تعديل"
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
                                                            onClick={() =>
                                                                setDeletingReward(reward)
                                                            }
                                                            title="حذف"
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
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

            {/* Dialogs */}
            <RewardFormDialog
                open={formOpen}
                reward={editingReward}
                onClose={() => setFormOpen(false)}
            />

            {deletingReward && (
                <DeleteConfirmDialog
                    reward={deletingReward}
                    open={!!deletingReward}
                    onClose={() => setDeletingReward(null)}
                />
            )}
        </AdminLayout>
    );
}
