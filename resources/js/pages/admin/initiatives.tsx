import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    CircleDashed,
    ClipboardList,
    MapPin,
    Trophy,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { approve, reject } from '@/actions/App/Http/Controllers/Admin/AdminInitiativesController';
import { showUser } from '@/actions/App/Http/Controllers/ProfileController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import AdminLayout from '@/layouts/admin-layout';

type Initiative = {
    id: number;
    name: string;
    description: string | null;
    starts_at: string | null;
    city: string | null;
    status: string;
    creation_points: number;
    min_participants: number | null;
    max_participants: number | null;
    target_gender: string | null;
    min_age: number | null;
    participants_count: number;
    creator_username: string | null;
    creator_avatar_url: string | null;
    created_at: string;
};

type Props = {
    pendingInitiatives: Initiative[];
    recentInitiatives: Initiative[];
};

const GENDER_LABELS: Record<string, string> = {
    male: 'ذكور',
    female: 'إناث',
};

function formatDate(iso: string | null): string {
    if (!iso) {
return '—';
}

    return new Intl.DateTimeFormat('ar-JO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'pending') {
        return (
            <Badge variant="outline" className="gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <CircleDashed className="size-3" />
                قيد المراجعة
            </Badge>
        );
    }

    if (status === 'approved') {
        return (
            <Badge variant="outline" className="gap-1 border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle2 className="size-3" />
                موافق عليها
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="gap-1 border-destructive/40 bg-destructive/5 text-destructive">
            <XCircle className="size-3" />
            مرفوضة
        </Badge>
    );
}

function InitiativeCard({ initiative, showActions }: { initiative: Initiative; showActions: boolean }) {
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);
    const [approvalPoints, setApprovalPoints] = useState(30);

    function handleApprove() {
        setLoading('approve');
        router.post(
            approve(initiative.id).url,
            { creation_points: approvalPoints },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('تمت الموافقة على المبادرة'),
                onError: () => toast.error('حدث خطأ أثناء الموافقة'),
                onFinish: () => setLoading(null),
            },
        );
    }

    function handleReject() {
        setLoading('reject');
        router.post(
            reject(initiative.id).url,
            {},
            {
                preserveScroll: true,
                onSuccess: () => toast.success('تم رفض المبادرة'),
                onError: () => toast.error('حدث خطأ أثناء الرفض'),
                onFinish: () => setLoading(null),
            },
        );
    }

    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-0">
                <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                <StatusBadge status={initiative.status} />
                                {initiative.target_gender && (
                                    <Badge variant="secondary" className="text-xs">
                                        {GENDER_LABELS[initiative.target_gender] ?? initiative.target_gender}
                                    </Badge>
                                )}
                                {initiative.min_age && (
                                    <Badge variant="secondary" className="text-xs">
                                        +{initiative.min_age} سنة
                                    </Badge>
                                )}
                            </div>
                            <h3 className="text-base font-semibold leading-tight text-foreground sm:text-lg">
                                {initiative.name}
                            </h3>
                        </div>

                        <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/8 px-2.5 py-1 text-sm font-semibold text-primary">
                            <span>{initiative.creation_points}</span>
                            <span className="text-xs font-normal text-primary/70">نقطة</span>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                        {initiative.city && (
                            <span className="flex items-center gap-1">
                                <MapPin className="size-3.5 shrink-0" />
                                {initiative.city}
                            </span>
                        )}
                        {initiative.starts_at && (
                            <span className="flex items-center gap-1">
                                <CalendarDays className="size-3.5 shrink-0" />
                                {formatDate(initiative.starts_at)}
                            </span>
                        )}
                        {(initiative.min_participants || initiative.max_participants) && (
                            <span className="flex items-center gap-1">
                                <Users className="size-3.5 shrink-0" />
                                {initiative.min_participants ?? '—'} – {initiative.max_participants ?? '∞'} مشارك
                            </span>
                        )}
                    </div>

                    {initiative.description && (
                        <div className="mt-3">
                            <p className={`text-sm leading-relaxed text-muted-foreground ${!expanded ? 'line-clamp-2' : ''}`}>
                                {initiative.description}
                            </p>
                            {initiative.description.length > 140 && (
                                <button
                                    type="button"
                                    onClick={() => setExpanded((v) => !v)}
                                    className="mt-1 flex items-center gap-0.5 text-xs text-primary hover:underline"
                                >
                                    {expanded ? (
                                        <>أقل <ChevronUp className="size-3" /></>
                                    ) : (
                                        <>المزيد <ChevronDown className="size-3" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {initiative.creator_username ? (
                                <Link
                                    href={showUser(initiative.creator_username).url}
                                    className="flex items-center gap-2 transition-opacity hover:opacity-75"
                                >
                                    <Avatar className="size-6 border border-border">
                                        <AvatarImage src={initiative.creator_avatar_url ?? undefined} alt={initiative.creator_username} />
                                        <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                                            {initiative.creator_username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">
                                        {initiative.creator_username}
                                    </span>
                                </Link>
                            ) : (
                                <span>—</span>
                            )}
                            <span className="text-xs text-muted-foreground/60">·</span>
                            <span className="text-xs">{formatDate(initiative.created_at)}</span>
                        </div>

                        {showActions && (
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5">
                                    <Trophy className="size-3.5 shrink-0 text-primary" />
                                    <label htmlFor={`points-${initiative.id}`} className="text-xs font-medium text-muted-foreground">
                                        نقاط الحضور
                                    </label>
                                    <input
                                        id={`points-${initiative.id}`}
                                        type="number"
                                        min={0}
                                        max={1000}
                                        value={approvalPoints}
                                        onChange={(e) => setApprovalPoints(Number(e.target.value))}
                                        disabled={loading !== null}
                                        className="w-16 rounded border border-border bg-background px-1.5 py-0.5 text-center text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none disabled:opacity-50"
                                    />
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/8 hover:text-destructive"
                                    disabled={loading !== null}
                                    onClick={handleReject}
                                >
                                    <XCircle className="size-4" />
                                    {loading === 'reject' ? 'جاري الرفض…' : 'رفض'}
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-1.5"
                                    disabled={loading !== null}
                                    onClick={handleApprove}
                                >
                                    <CheckCircle2 className="size-4" />
                                    {loading === 'approve' ? 'جاري الموافقة…' : 'موافقة'}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminInitiativesPage({ pendingInitiatives, recentInitiatives }: Props) {
    return (
        <AdminLayout pageTitle="مراجعة المبادرات">
            <Head title="مراجعة المبادرات — الإدارة" />
            <Toaster position="top-center" richColors />

            <div className="mx-auto max-w-4xl space-y-10 px-4 py-8 sm:px-6" dir="rtl">
                <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <ClipboardList className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">مراجعة المبادرات</h1>
                        <p className="text-sm text-muted-foreground">مراجعة وقبول أو رفض المبادرات المقدّمة</p>
                    </div>
                </div>

                <section>
                    <div className="mb-4 flex items-center gap-2.5">
                        <ClipboardList className="size-5 text-primary" />
                        <h2 className="text-lg font-semibold text-foreground">قيد المراجعة</h2>
                        {pendingInitiatives.length > 0 && (
                            <Badge className="bg-primary text-primary-foreground">
                                {pendingInitiatives.length}
                            </Badge>
                        )}
                    </div>

                    {pendingInitiatives.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 py-14 text-center">
                            <AlertCircle className="size-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">لا توجد مبادرات في انتظار المراجعة</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingInitiatives.map((initiative) => (
                                <InitiativeCard key={initiative.id} initiative={initiative} showActions />
                            ))}
                        </div>
                    )}
                </section>

                {recentInitiatives.length > 0 && (
                    <section>
                        <div className="mb-4 flex items-center gap-2.5">
                            <CheckCircle2 className="size-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold text-foreground">المراجعات الأخيرة</h2>
                        </div>

                        <div className="space-y-3">
                            {recentInitiatives.map((initiative) => (
                                <InitiativeCard key={initiative.id} initiative={initiative} showActions={false} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </AdminLayout>
    );
}
