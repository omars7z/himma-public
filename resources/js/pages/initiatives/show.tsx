import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    HandHeart,
    MapPin,
    Star,
    Trophy,
    UserCheck,
    UserMinus,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import {
    index as indexInitiatives,
} from '@/actions/App/Http/Controllers/InitiativesController';
import {
    store,
    destroy,
} from '@/actions/App/Http/Controllers/ParticipationsController';
import { SiteHeader } from '@/components/site-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JORDAN_CITIES } from '@/constants/jordan-cities';

type Initiative = {
    id: number;
    name: string;
    starts_at: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    description: string | null;
    min_participants: number | null;
    max_participants: number | null;
    participants_count: number;
    creator_username: string | null;
    creator_avatar_url: string | null;
    target_gender: 'male' | 'female' | null;
    min_age: number | null;
    reviews_average: number | null;
    reviews_count: number;
    creation_points: number;
    is_joined: boolean;
};

type PageProps = {
    initiative: Initiative;
    withdrawalPenaltyPoints: number;
};

const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-US').format(value);

const formatArabicDate = (iso: string | null): string => {
    if (!iso) {
return 'موعد قريب';
}

    return new Intl.DateTimeFormat('ar-JO-u-nu-latn', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(iso));
};

export default function InitiativeShow({
    initiative,
    withdrawalPenaltyPoints,
}: PageProps) {
    const [joinConfirming, setJoinConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    const max = initiative.max_participants ?? 0;
    const joined = initiative.participants_count;
    const isFull = max > 0 && joined >= max;
    const progress = max > 0 ? Math.min(100, Math.round((joined / max) * 100)) : 0;

    const cityLabel =
        JORDAN_CITIES.find((c) => c.value === initiative.city?.toLowerCase())?.label ??
        initiative.city;

    function handleJoin() {
        setProcessing(true);
        router.post(store(initiative.id).url, {}, {
            preserveScroll: true,
            onSuccess: () => setJoinConfirming(false),
            onFinish: () => setProcessing(false),
        });
    }

    function handleLeave() {
        setProcessing(true);
        router.delete(destroy(initiative.id).url, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <>
            <Head title={initiative.name} />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <SiteHeader />
                <div className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
                        <Link
                            href={indexInitiatives().url}
                            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ArrowRight className="size-4" />
                            المبادرات
                        </Link>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="line-clamp-1 text-sm font-medium text-foreground">
                            {initiative.name}
                        </span>
                    </div>
                </div>

                <main className="flex-1">
                    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
                        <div className="grid gap-6 lg:grid-cols-3">

                            {/* المحتوى الرئيسي */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* بطاقة التعريف */}
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <div className="flex flex-wrap items-start gap-3">
                                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-initiative-surface text-primary">
                                            <HandHeart className="size-6" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-foreground sm:text-2xl">
                                                {initiative.name}
                                            </h1>
                                            {initiative.is_joined && (
                                                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                    <UserCheck className="size-3.5" />
                                                    أنت منضم إلى هذه المبادرة
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {initiative.description && (
                                        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                                            {initiative.description}
                                        </p>
                                    )}
                                </div>

                                {/* تفاصيل المبادرة */}
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                    <h2 className="mb-4 text-sm font-bold text-foreground">
                                        تفاصيل المبادرة
                                    </h2>

                                    <dl className="space-y-4">
                                        {/* الموعد */}
                                        <div className="flex items-start gap-3">
                                            <CalendarDays className="mt-0.5 size-4.5 shrink-0 text-primary" />
                                            <div>
                                                <dt className="text-xs font-semibold text-muted-foreground">
                                                    موعد الانطلاق
                                                </dt>
                                                <dd className="mt-0.5 text-sm font-medium text-foreground">
                                                    {formatArabicDate(initiative.starts_at)}
                                                </dd>
                                            </div>
                                        </div>

                                        {/* الموقع */}
                                        {cityLabel && (
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 size-4.5 shrink-0 text-primary" />
                                                <div>
                                                    <dt className="text-xs font-semibold text-muted-foreground">
                                                        المحافظة
                                                    </dt>
                                                    <dd className="mt-0.5 text-sm font-medium text-foreground">
                                                        {cityLabel}
                                                    </dd>
                                                </div>
                                            </div>
                                        )}

                                        {/* المشاركون */}
                                        <div className="flex items-start gap-3">
                                            <Users className="mt-0.5 size-4.5 shrink-0 text-primary" />
                                            <div className="flex-1">
                                                <dt className="text-xs font-semibold text-muted-foreground">
                                                    المشاركون
                                                </dt>
                                                <dd className="mt-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-semibold text-foreground">
                                                            {formatNumber(joined)}
                                                            {max > 0 ? ` / ${formatNumber(max)}` : ''}
                                                            {' '}مشارك
                                                        </span>
                                                        {isFull && (
                                                            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                                                                مكتملة
                                                            </span>
                                                        )}
                                                    </div>
                                                    {max > 0 && (
                                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                                            <div
                                                                className="h-full rounded-full bg-primary transition-all"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </dd>
                                            </div>
                                        </div>

                                        {/* النقاط */}
                                        <div className="flex items-start gap-3">
                                            <Trophy className="mt-0.5 size-4.5 shrink-0 text-primary" />
                                            <div>
                                                <dt className="text-xs font-semibold text-muted-foreground">
                                                    نقاط الحضور
                                                </dt>
                                                <dd className="mt-0.5 text-sm font-bold text-foreground">
                                                    {formatNumber(initiative.creation_points)} نقطة
                                                </dd>
                                            </div>
                                        </div>

                                        {initiative.reviews_count > 0 &&
                                        initiative.reviews_average !== null ? (
                                            <div className="flex items-start gap-3">
                                                <Star className="mt-0.5 size-4.5 shrink-0 fill-primary/25 text-primary" />
                                                <div>
                                                    <dt className="text-xs font-semibold text-muted-foreground">
                                                        تقييم المشاركين
                                                    </dt>
                                                    <dd className="mt-0.5 text-sm font-bold tabular-nums text-foreground">
                                                        {Number(
                                                            initiative.reviews_average,
                                                        ).toFixed(1)}{' '}
                                                        <span className="font-normal text-muted-foreground">
                                                            (
                                                            {formatNumber(
                                                                initiative.reviews_count,
                                                            )}{' '}
                                                            تقييم)
                                                        </span>
                                                    </dd>
                                                </div>
                                            </div>
                                        ) : null}

                                        {/* المنشئ */}
                                        {initiative.creator_username && (
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8 shrink-0 border border-border">
                                                    <AvatarImage
                                                        src={initiative.creator_avatar_url ?? undefined}
                                                        alt={initiative.creator_username}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                                        {initiative.creator_username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <dt className="text-xs font-semibold text-muted-foreground">
                                                        بإشراف
                                                    </dt>
                                                    <dd className="mt-0.5 text-sm font-semibold text-foreground">
                                                        @{initiative.creator_username}
                                                    </dd>
                                                </div>
                                            </div>
                                        )}
                                    </dl>

                                    {/* شارات الجنس والعمر */}
                                    {(initiative.target_gender || initiative.min_age || initiative.min_participants) && (
                                        <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                                            {initiative.target_gender && (
                                                <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                    {initiative.target_gender === 'male' ? '👨 للذكور' : '👩 للإناث'}
                                                </span>
                                            )}
                                            {initiative.min_age && (
                                                <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                    {formatNumber(initiative.min_age)}+ سنة
                                                </span>
                                            )}
                                            {initiative.min_participants && (
                                                <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                                                    يتطلب {formatNumber(initiative.min_participants)} مشارك على الأقل
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* الشريط الجانبي — الانضمام */}
                            <div className="space-y-4 lg:sticky lg:top-24">
                                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <h2 className="mb-4 text-sm font-bold text-foreground">
                                        الانضمام للمبادرة
                                    </h2>

                                    {initiative.is_joined ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-4 py-3">
                                                <CheckCircle2 className="size-5 text-primary" />
                                                <span className="text-sm font-semibold text-primary">
                                                    أنت منضم بالفعل
                                                </span>
                                            </div>
                                            <button
                                                onClick={handleLeave}
                                                disabled={processing}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
                                            >
                                                <UserMinus className="size-4" />
                                                {processing ? 'جارٍ الانسحاب…' : 'الانسحاب من المبادرة'}
                                            </button>
                                            <p className="text-center text-xs leading-relaxed text-muted-foreground">
                                                سيُخصم حتى{' '}
                                                <span className="font-semibold text-foreground">
                                                    {formatNumber(withdrawalPenaltyPoints)} نقاط
                                                </span>{' '}
                                                عند الانسحاب.
                                            </p>
                                        </div>
                                    ) : joinConfirming ? (
                                        <div className="space-y-4">
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                                                <div className="flex gap-2.5">
                                                    <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                                    <div className="text-sm text-amber-800 dark:text-amber-300">
                                                        <p className="font-bold">تنبيه قبل الانضمام</p>
                                                        <p className="mt-1.5 leading-relaxed">
                                                            ستكسب{' '}
                                                            <span className="font-bold">
                                                                {formatNumber(initiative.creation_points)} نقطة
                                                            </span>{' '}
                                                            عند تسجيل حضورك. إذا انسحبت لاحقًا سيُخصم حتى{' '}
                                                            <span className="font-bold">
                                                                {formatNumber(withdrawalPenaltyPoints)} نقاط
                                                            </span>{' '}
                                                            من رصيدك.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={handleJoin}
                                                    disabled={processing}
                                                    className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                                                >
                                                    {processing ? 'جارٍ الانضمام…' : 'تأكيد الانضمام'}
                                                </button>
                                                <button
                                                    onClick={() => setJoinConfirming(false)}
                                                    disabled={processing}
                                                    className="w-full rounded-xl border border-border bg-background py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <button
                                                onClick={() => setJoinConfirming(true)}
                                                disabled={isFull}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <UserCheck className="size-4.5" />
                                                {isFull ? 'المبادرة مكتملة' : 'انضم إلى المبادرة'}
                                            </button>
                                            <p className="text-center text-xs text-muted-foreground">
                                                ستكسب{' '}
                                                <span className="font-semibold text-foreground">
                                                    {formatNumber(initiative.creation_points)} نقطة
                                                </span>{' '}
                                                عند تسجيل حضورك.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* رابط العودة */}
                                <Link
                                    href={indexInitiatives().url}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    <ArrowRight className="size-4" />
                                    العودة للمبادرات
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
