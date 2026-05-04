import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Edit3,
    MapPin,
    Star,
    Trash2,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
    destroy as destroyInitiative,
    update as updateInitiative,
} from '@/actions/App/Http/Controllers/InitiativesController';
import { confirmAttendance } from '@/actions/App/Http/Controllers/ParticipationsController';
import { show as showInitiative } from '@/actions/App/Http/Controllers/InitiativesController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SiteHeader } from '@/components/site-header';
import { JORDAN_CITIES } from '@/constants/jordan-cities';

// ─── Types ───────────────────────────────────────────────────────────────────

type Participant = {
    id: number;
    user_id: number;
    username: string | null;
    avatar_url: string | null;
    status: 'registered' | 'attended';
    points_awarded: number | null;
    enrolled_at: string;
};

type CreatedInitiative = {
    id: number;
    name: string;
    description: string | null;
    starts_at: string | null;
    city: string | null;
    status: 'pending' | 'approved' | 'completed';
    creation_points: number;
    min_participants: number | null;
    max_participants: number | null;
    participants_count: number;
    target_gender: 'male' | 'female' | null;
    min_age: number | null;
    participants: Participant[];
};

type JoinedParticipation = {
    id: number;
    status: 'registered' | 'attended';
    points_awarded: number | null;
    enrolled_at: string;
    initiative: {
        id: number;
        name: string;
        starts_at: string | null;
        city: string | null;
        status: 'pending' | 'approved' | 'completed';
        creation_points: number;
    };
};

type PageProps = {
    createdInitiatives: CreatedInitiative[];
    joinedParticipations: JoinedParticipation[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null): string => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('ar-JO-u-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(iso));
};

const cityLabel = (city: string | null): string | null => {
    if (!city) return null;
    return JORDAN_CITIES.find((c) => c.value === city.toLowerCase())?.label ?? city;
};

const statusConfig = {
    pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    approved: { label: 'موافق عليها', color: 'bg-primary/10 text-primary border-primary/20' },
    completed: { label: 'مكتملة', color: 'bg-muted text-muted-foreground border-border' },
};

// ─── Edit Initiative Dialog ───────────────────────────────────────────────────

function EditInitiativeDialog({
    initiative,
    open,
    onClose,
}: {
    initiative: CreatedInitiative;
    open: boolean;
    onClose: () => void;
}) {
    const isPending = initiative.status === 'pending';
    const { data, setData, patch, processing, errors, reset } = useForm({
        name: initiative.name,
        description: initiative.description ?? '',
        starts_at: initiative.starts_at
            ? new Date(initiative.starts_at).toISOString().slice(0, 16)
            : '',
        city: initiative.city ?? '',
        min_participants: initiative.min_participants?.toString() ?? '',
        max_participants: initiative.max_participants?.toString() ?? '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        patch(updateInitiative.url(initiative.id), {
            onSuccess: () => {
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-right">تعديل المبادرة</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4 pt-1">
                    {isPending && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-foreground">
                                اسم المبادرة
                            </label>
                            <input
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-foreground">
                            الوصف
                        </label>
                        <textarea
                            rows={4}
                            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="أضف وصفاً للمبادرة…"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                        )}
                    </div>

                    {isPending && (
                        <>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">
                                    تاريخ البدء
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    value={data.starts_at}
                                    onChange={(e) => setData('starts_at', e.target.value)}
                                />
                                {errors.starts_at && (
                                    <p className="mt-1 text-xs text-red-500">{errors.starts_at}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">
                                        الحد الأدنى للمشاركين
                                    </label>
                                    <input
                                        type="number"
                                        min={2}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        value={data.min_participants}
                                        onChange={(e) => setData('min_participants', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-foreground">
                                        الحد الأقصى للمشاركين
                                    </label>
                                    <input
                                        type="number"
                                        min={2}
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        value={data.max_participants}
                                        onChange={(e) => setData('max_participants', e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'جاري الحفظ…' : 'حفظ التغييرات'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Created Initiative Card ──────────────────────────────────────────────────

function CreatedInitiativeCard({ initiative }: { initiative: CreatedInitiative }) {
    const [expanded, setExpanded] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const attendedCount = initiative.participants.filter(
        (p) => p.status === 'attended',
    ).length;
    const totalParticipants = initiative.participants.length;

    function handleDelete() {
        router.delete(destroyInitiative.url(initiative.id), {
            onSuccess: () => setConfirmingDelete(false),
        });
    }

    function handleConfirmAttendance(participationId: number) {
        router.post(
            confirmAttendance.url({ initiative: initiative.id, participation: participationId }),
        );
    }

    const cfg = statusConfig[initiative.status];

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                        >
                            {cfg.label}
                        </span>
                        {initiative.status === 'approved' && totalParticipants > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {attendedCount}/{totalParticipants} حضروا
                            </span>
                        )}
                    </div>
                    <Link
                        href={showInitiative.url(initiative.id)}
                        className="font-semibold text-foreground hover:text-primary"
                    >
                        {initiative.name}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {initiative.starts_at && (
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(initiative.starts_at)}
                            </span>
                        )}
                        {initiative.city && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {cityLabel(initiative.city)}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {initiative.participants_count} مشارك
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 text-amber-500" />
                            {initiative.creation_points} نقطة
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                    {initiative.status !== 'completed' && (
                        <button
                            onClick={() => setEditOpen(true)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            title="تعديل"
                        >
                            <Edit3 className="h-4 w-4" />
                        </button>
                    )}
                    {initiative.status === 'pending' && (
                        <button
                            onClick={() => setConfirmingDelete(true)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                            title="حذف"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                    {initiative.status === 'approved' && totalParticipants > 0 && (
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent"
                        >
                            {expanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Description snippet */}
            {initiative.description && (
                <div className="border-t border-border px-4 py-2.5 text-sm text-muted-foreground">
                    <p className="line-clamp-2">{initiative.description}</p>
                </div>
            )}

            {/* Participants list (approved only) */}
            {initiative.status === 'approved' && expanded && totalParticipants > 0 && (
                <div className="border-t border-border p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        المشاركون
                    </p>
                    <div className="space-y-2">
                        {initiative.participants.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"
                            >
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={p.avatar_url ?? undefined} />
                                        <AvatarFallback className="text-xs">
                                            {p.username?.[0]?.toUpperCase() ?? '؟'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {p.username ?? 'مشارك'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            انضم {formatDate(p.enrolled_at)}
                                        </p>
                                    </div>
                                </div>

                                {p.status === 'attended' ? (
                                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        حضر
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleConfirmAttendance(p.id)}
                                        className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        <UserCheck className="h-3.5 w-3.5" />
                                        تأكيد الحضور
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed note */}
            {initiative.status === 'completed' && (
                <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    تم تأكيد حضور جميع المشاركين وإكمال المبادرة.
                </div>
            )}

            {/* Delete confirmation */}
            {confirmingDelete && (
                <div className="border-t border-border bg-red-50 px-4 py-3 dark:bg-red-950/20">
                    <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">
                        هل تريد حذف هذه المبادرة؟ لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex gap-2">
                        <Button size="sm" variant="destructive" onClick={handleDelete}>
                            نعم، احذف
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmingDelete(false)}
                        >
                            إلغاء
                        </Button>
                    </div>
                </div>
            )}

            {/* Edit dialog */}
            <EditInitiativeDialog
                initiative={initiative}
                open={editOpen}
                onClose={() => setEditOpen(false)}
            />
        </div>
    );
}

// ─── Joined Participation Card ────────────────────────────────────────────────

function JoinedParticipationCard({ participation }: { participation: JoinedParticipation }) {
    const ini = participation.initiative;
    const cfg = statusConfig[ini.status];

    const participationStatusMap = {
        registered: { label: 'مسجّل', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        attended: { label: 'حضرت', color: 'bg-primary/10 text-primary border-primary/20' },
    };
    const pCfg = participationStatusMap[participation.status];

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap gap-2">
                        <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                        >
                            {cfg.label}
                        </span>
                        <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${pCfg.color}`}
                        >
                            {pCfg.label}
                        </span>
                    </div>
                    <Link
                        href={showInitiative.url(ini.id)}
                        className="font-semibold text-foreground hover:text-primary"
                    >
                        {ini.name}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {ini.starts_at && (
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(ini.starts_at)}
                            </span>
                        )}
                        {ini.city && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {cityLabel(ini.city)}
                            </span>
                        )}
                    </div>
                </div>

                {participation.points_awarded !== null && (
                    <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-primary">
                            +{participation.points_awarded}
                        </p>
                        <p className="text-xs text-muted-foreground">نقطة</p>
                    </div>
                )}
            </div>

            {participation.status === 'registered' && ini.status === 'pending' && (
                <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    المبادرة قيد المراجعة من الإدارة.
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Dashboard({ createdInitiatives, joinedParticipations }: PageProps) {
    const [mainTab, setMainTab] = useState<'created' | 'joined'>('created');
    const [createdFilter, setCreatedFilter] = useState<'pending' | 'approved' | 'completed'>(
        'approved',
    );

    const filteredCreated = createdInitiatives.filter((i) => i.status === createdFilter);

    const pendingCount = createdInitiatives.filter((i) => i.status === 'pending').length;
    const approvedCount = createdInitiatives.filter((i) => i.status === 'approved').length;
    const completedCount = createdInitiatives.filter((i) => i.status === 'completed').length;

    return (
        <>
            <Head title="لوحة التحكم" />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <SiteHeader />
                <main className="flex-1">
                    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
                        {/* Page title */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                                لوحة التحكم
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                تابع مبادراتك ومشاركاتك من مكان واحد.
                            </p>
                        </div>

                        {/* Main tabs */}
                        <div className="mb-6 flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
                            <button
                                onClick={() => setMainTab('created')}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    mainTab === 'created'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                مبادراتي
                                {createdInitiatives.length > 0 && (
                                    <span className="mr-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                        {createdInitiatives.length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setMainTab('joined')}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                    mainTab === 'joined'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                مشاركاتي
                                {joinedParticipations.length > 0 && (
                                    <span className="mr-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                                        {joinedParticipations.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* ── Created initiatives ── */}
                        {mainTab === 'created' && (
                            <div>
                                {/* Status filter */}
                                <div className="mb-5 flex flex-wrap gap-2">
                                    {(
                                        [
                                            ['approved', 'موافق عليها', approvedCount],
                                            ['pending', 'قيد المراجعة', pendingCount],
                                            ['completed', 'مكتملة', completedCount],
                                        ] as const
                                    ).map(([key, label, count]) => (
                                        <button
                                            key={key}
                                            onClick={() => setCreatedFilter(key)}
                                            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                                                createdFilter === key
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                            }`}
                                        >
                                            {label}
                                            <span
                                                className={`rounded-full px-1.5 py-0.5 text-xs ${
                                                    createdFilter === key
                                                        ? 'bg-primary-foreground/20 text-primary-foreground'
                                                        : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {filteredCreated.length === 0 ? (
                                    <EmptyState
                                        icon={
                                            createdFilter === 'pending' ? (
                                                <Clock className="h-10 w-10 text-muted-foreground/40" />
                                            ) : createdFilter === 'completed' ? (
                                                <CheckCircle2 className="h-10 w-10 text-muted-foreground/40" />
                                            ) : (
                                                <Users className="h-10 w-10 text-muted-foreground/40" />
                                            )
                                        }
                                        message={
                                            createdFilter === 'pending'
                                                ? 'لا توجد مبادرات قيد المراجعة.'
                                                : createdFilter === 'completed'
                                                  ? 'لا توجد مبادرات مكتملة بعد.'
                                                  : 'لا توجد مبادرات موافق عليها.'
                                        }
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {filteredCreated.map((initiative) => (
                                            <CreatedInitiativeCard
                                                key={initiative.id}
                                                initiative={initiative}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Joined participations ── */}
                        {mainTab === 'joined' && (
                            <div>
                                {joinedParticipations.length === 0 ? (
                                    <EmptyState
                                        icon={
                                            <Users className="h-10 w-10 text-muted-foreground/40" />
                                        }
                                        message="لم تنضم إلى أي مبادرة بعد."
                                        action={
                                            <Link
                                                href="/initiatives"
                                                className="mt-3 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                            >
                                                تصفح المبادرات
                                            </Link>
                                        }
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {joinedParticipations.map((p) => (
                                            <JoinedParticipationCard key={p.id} participation={p} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
    icon,
    message,
    action,
}: {
    icon: React.ReactNode;
    message: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
            {icon}
            <p className="mt-3 text-sm text-muted-foreground">{message}</p>
            {action}
        </div>
    );
}
