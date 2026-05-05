import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownWideNarrow,
    ArrowRight,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    Gift,
    Flame,
    HandHeart,
    LogIn,
    MapPin,
    Plus,
    Sparkles,
    Star,
    Trophy,
    UserCheck,
    UserMinus,
    Users,
    X,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import {
    store,
    destroy,
} from '@/actions/App/Http/Controllers/ParticipationsController';
import { showUser } from '@/actions/App/Http/Controllers/ProfileController';
import type { InitiativePin } from '@/components/jordan-map';
import { SiteHeader } from '@/components/site-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { JORDAN_CITIES } from '@/constants/jordan-cities';
import type { InitiativeSortKey } from '@/lib/initiative-sort';
import { INITIATIVE_SORT_OPTIONS, sortInitiatives } from '@/lib/initiative-sort';
import { NAV_LINKS, getNavLinkHref } from '@/lib/site-nav';
import { collaborations, login, register } from '@/routes';
import { index as initiativesIndex } from '@/routes/initiatives';
import { index as rewardsIndex } from '@/routes/rewards';

const JordanMap = lazy(async () => {
    if (typeof window === 'undefined') {
        return { default: () => <></> };
    }

    return import('@/components/jordan-map').then((m) => ({
        default: m.JordanMap,
    }));
});

type FeaturedInitiative = {
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

type GenderFilter = 'all' | 'male' | 'female';
type AgeFilter = 'all' | '13' | '18' | '25';

type TrendingInitiative = {
    id: string;
    title: string;
    city: string;
    category: string;
    growth: string;
};

const TRENDING_INITIATIVES: TrendingInitiative[] = [
    {
        id: 't1',
        title: 'تنظيف أحياء وسط عمّان',
        city: 'عمّان',
        category: 'بيئي',
        growth: '+32%',
    },
    {
        id: 't2',
        title: 'تعليم مهارات رقمية للشباب',
        city: 'إربد',
        category: 'تعليمي',
        growth: '+27%',
    },
    {
        id: 't3',
        title: 'حملات تبرع بالدم الجامعية',
        city: 'الزرقاء',
        category: 'صحي',
        growth: '+24%',
    },
    {
        id: 't4',
        title: 'دعم الأسر المنتجة محليًا',
        city: 'الكرك',
        category: 'مجتمعي',
        growth: '+19%',
    },
    {
        id: 't5',
        title: 'تشجير المدارس والمساحات العامة',
        city: 'العقبة',
        category: 'استدامة',
        growth: '+16%',
    },
];

type Stats = {
    initiatives_count: number;
    users_count: number;
};

type LeaderboardContributor = {
    username: string;
    avatar_url: string;
    points: number;
    city: string | null;
};

type HomeProps = {
    withdrawalPenaltyPoints: number;
    stats: Stats;
    featuredInitiatives: FeaturedInitiative[];
    leaderboard?: LeaderboardContributor[];
    rewardsTotal?: number;
};

/** Latin digits (0–9) for all numeric display on this page. */
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
    }).format(new Date(iso));
};

function leaderboardCityLabel(city: string | null): string | null {
    if (!city) {
        return null;
    }

    return (
        JORDAN_CITIES.find((c) => c.value === city.toLowerCase())?.label ??
        city
    );
}

export default function Home({
    withdrawalPenaltyPoints,
    stats,
    featuredInitiatives,
    leaderboard = [],
    rewardsTotal = 0,
}: HomeProps) {
    const { auth, canRegister } = usePage().props;

    return (
        <>
            <Head title="منصة العمل التطوعي">
                <meta
                    name="description"
                    content="همة منصة شبابية للعمل التطوعي في الأردن. انضم إلى مبادرات، اكسب نقاط بالحضور، وأنشئ مبادرتك الخاصة."
                />
            </Head>

            <div
                id="top"
                className="flex min-h-screen flex-col bg-background text-foreground"
            >
                <SiteHeader />
                <main className="flex-1">
                    <Hero canRegister={canRegister} isAuthed={!!auth.user} />

                    <StatsSection stats={stats} />

                    <LeaderboardSection contributors={leaderboard} />

                    <FeaturedInitiatives
                        initiatives={featuredInitiatives}
                        withdrawalPenaltyPoints={withdrawalPenaltyPoints}
                        isAuthed={!!auth.user}
                        canRegister={canRegister}
                    />

                    <RewardsHomeTeaser
                        total={rewardsTotal}
                        isAuthed={!!auth.user}
                        canRegister={canRegister}
                    />
                </main>

                <SiteFooter />
            </div>
        </>
    );
}

function Hero({
    canRegister,
    isAuthed,
}: {
    canRegister: boolean;
    isAuthed: boolean;
}) {
    return (
        <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-initiative-surface/80 via-background to-background">
            <div className="pointer-events-none absolute inset-0">
                <img
                    src="/images/himma/hero-volunteer-planting.jpg"
                    alt=""
                    className="h-full w-full object-cover opacity-22"
                />
            </div>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-background/55"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--initiative-highlight)/0.18),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.16),transparent_55%)]"
            />

            <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
                <div className="mx-auto max-w-3xl text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        منصة العمل التطوعي في الأردن
                    </span>

                    <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl">
                        ابدأ رحلتك في{' '}
                        <span className="text-primary">العمل التطوعي</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
                        انضم إلى مبادرات شبابية في كل المحافظات، اكسب نقاطًا
                        بالحضور وأنشئ مبادرتك الخاصة. شبكة واحدة تجمع المتطوعين
                        والمبادرات والمكافآت في مكان واحد.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <a
                            href="#initiatives"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 sm:w-auto"
                        >
                            استكشف المبادرات
                        </a>
                        {!isAuthed && canRegister ? (
                            <Link
                                href={register()}
                                className="inline-flex w-full items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-accent sm:w-auto"
                            >
                                أنشئ حسابك
                            </Link>
                        ) : null}
                    </div>

                </div>
            </div>
        </section>
    );
}

function LeaderboardSection({
    contributors,
}: {
    contributors: LeaderboardContributor[];
}) {
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <section
            id="leaderboard"
            className="scroll-mt-20 border-b border-border bg-muted/30"
            aria-labelledby="leaderboard-heading"
        >
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
                <div className="mb-10 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                        <Trophy className="size-3.5" />
                        لوحة المتصدرين
                    </span>
                    <h2
                        id="leaderboard-heading"
                        className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
                    >
                        أعلى المتطوعين نقاطًا
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                        أفضل خمس حسابات حسب نقاط حضور وتفاعل المبادرات. انقر أي
                        صف لتفتح ملف المتطوع.
                    </p>
                </div>

                {contributors.length === 0 ? (
                    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-initiative-surface text-primary">
                            <Trophy className="size-6" />
                        </span>
                        <p className="mt-4 text-sm font-semibold text-foreground">
                            لا يوجد متصدرون بعد
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            انضم إلى مبادرة وحضّر فعالياتك لتظهر نقاطك هنا.
                        </p>
                    </div>
                ) : (
                    <ul
                        className="mx-auto max-w-xl space-y-2.5 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"
                        dir="rtl"
                    >
                        {contributors.map((c, i) => {
                            const cityLbl = leaderboardCityLabel(c.city);

                            return (
                                <li key={c.username}>
                                    <Link
                                        href={showUser(c.username).url}
                                        className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                                            i === 0
                                                ? 'border border-initiative-highlight/25 bg-initiative-highlight/10 hover:bg-initiative-highlight/18'
                                                : 'hover:bg-muted/60'
                                        }`}
                                    >
                                        <span className="w-7 shrink-0 text-center text-base leading-none">
                                            {medals[i] ?? (
                                                <span className="text-xs font-black tabular-nums text-muted-foreground">
                                                    {formatNumber(i + 1)}
                                                </span>
                                            )}
                                        </span>
                                        <Avatar className="size-10 border border-border">
                                            <AvatarImage
                                                src={c.avatar_url}
                                                alt={c.username}
                                            />
                                            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                                {c.username
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1 text-start">
                                            <p className="truncate font-semibold text-foreground">
                                                @{c.username}
                                            </p>
                                            {cityLbl ? (
                                                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <MapPin className="size-3 shrink-0" />
                                                    {cityLbl}
                                                </p>
                                            ) : null}
                                        </div>
                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold tabular-nums ${
                                                i === 0
                                                    ? 'bg-initiative-highlight/20 text-initiative-highlight'
                                                    : 'border border-primary/20 bg-primary/10 text-primary'
                                            }`}
                                        >
                                            {formatNumber(c.points)} نقطة
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}

function StatsSection({ stats }: { stats: Stats }) {
    const items = [
        {
            label: 'مبادرة معتمدة',
            value: stats.initiatives_count,
            icon: HandHeart,
        },
        {
            label: 'متطوع نشط',
            value: stats.users_count,
            icon: Users,
        },
        {
            label: 'نقاط لكل حضور',
            value: 30,
            icon: Trophy,
        },
    ];

    return (
        <section
            aria-label="إحصائيات المنصة"
            className="border-b border-border bg-background"
        >
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6 sm:py-16">
                {items.map(({ label, value, icon: Icon }) => (
                    <div
                        key={label}
                        className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                    >
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-initiative-surface text-primary">
                            <Icon className="size-6" />
                        </span>
                        <div>
                            <div className="text-3xl font-extrabold tracking-tight text-foreground">
                                {formatNumber(value)}
                                <span className="text-primary">+</span>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                                {label}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
    { value: 'all', label: 'الجميع' },
    { value: 'male', label: 'ذكور' },
    { value: 'female', label: 'إناث' },
];

const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
    { value: 'all', label: 'كل الأعمار' },
    { value: '13', label: '13+' },
    { value: '18', label: '18+' },
    { value: '25', label: '25+' },
];

function FeaturedInitiatives({
    initiatives,
    withdrawalPenaltyPoints,
    isAuthed,
    canRegister,
}: {
    initiatives: FeaturedInitiative[];
    withdrawalPenaltyPoints: number;
    isAuthed: boolean;
    canRegister: boolean;
}) {
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [genderFilter, setGenderFilter] = useState<GenderFilter>('all');
    const [ageFilter, setAgeFilter] = useState<AgeFilter>('all');
    const [selectedInitiativeId, setSelectedInitiativeId] = useState<
        number | null
    >(null);
    const [joinConfirming, setJoinConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [sortKey, setSortKey] = useState<InitiativeSortKey>('starts_at_asc');

    const filteredInitiatives = useMemo(() => {
        return initiatives.filter((i) => {
            if (selectedCity && i.city?.toLowerCase() !== selectedCity) {
return false;
}

            if (genderFilter !== 'all') {
                if (
                    i.target_gender !== null &&
                    i.target_gender !== genderFilter
                ) {
return false;
}
            }

            if (ageFilter !== 'all') {
                const minRequired = Number(ageFilter);

                if (i.min_age !== null && i.min_age > minRequired) {
return false;
}
            }

            return true;
        });
    }, [initiatives, selectedCity, genderFilter, ageFilter]);

    /** القائمة بعد الفرز — تستخدم للخرائط واللوحة والدبابيس. */
    const filteredSortedInitiatives = useMemo(
        () => sortInitiatives(filteredInitiatives, sortKey),
        [filteredInitiatives, sortKey],
    );

    /** City counts based on filtered initiatives so markers reflect active filters. */
    const filteredCityCounts = useMemo(() => {
        const counts: Record<string, number> = {};

        for (const initiative of filteredInitiatives) {
            const key = initiative.city?.toLowerCase() ?? '';

            if (key) {
                counts[key] = (counts[key] ?? 0) + 1;
            }
        }

        return counts;
    }, [filteredInitiatives]);

    /** Derive the selected initiative from current props (auto-updates after join/leave). */
    const selectedInitiative = useMemo(
        () =>
            filteredSortedInitiatives.find((i) => i.id === selectedInitiativeId) ??
            null,
        [filteredSortedInitiatives, selectedInitiativeId],
    );

    const cityInitiatives = useMemo(() => {
        if (!selectedCity) {
return [];
}

        return filteredSortedInitiatives.filter(
            (i) => i.city?.toLowerCase() === selectedCity,
        );
    }, [filteredSortedInitiatives, selectedCity]);

    /** Pins passed to the map — one per initiative that has coordinates. */
    const initiativePins: InitiativePin[] = useMemo(
        () =>
            filteredSortedInitiatives.map((i) => ({
                id: i.id,
                name: i.name,
                city: i.city,
                latitude: i.latitude,
                longitude: i.longitude,
                is_joined: i.is_joined,
                full:
                    i.max_participants !== null &&
                    i.max_participants > 0 &&
                    i.participants_count >= i.max_participants,
            })),
        [filteredSortedInitiatives],
    );

    /** Clicking a pin on the map selects that initiative and switches the panel. */
    function handleMapInitiativeSelect(id: number) {
        const initiative = filteredSortedInitiatives.find((i) => i.id === id);

        if (!initiative) {
return;
}

        const city = initiative.city?.toLowerCase() ?? null;
        setSelectedCity(city);
        setSelectedInitiativeId(id);
        setJoinConfirming(false);
    }

    const hasActiveFilters =
        selectedCity !== null || genderFilter !== 'all' || ageFilter !== 'all';

    function handleCitySelect(city: string | null) {
        setSelectedCity(city);
        setSelectedInitiativeId(null);
        setJoinConfirming(false);
    }

    function handleInitiativeSelect(initiative: FeaturedInitiative) {
        setSelectedInitiativeId(initiative.id);
        setJoinConfirming(false);
    }

    function handleBack() {
        setSelectedInitiativeId(null);
        setJoinConfirming(false);
    }

    function handleJoin(initiativeId: number) {
        setProcessing(true);
        router.post(
            store(initiativeId).url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => setJoinConfirming(false),
                onFinish: () => setProcessing(false),
            },
        );
    }

    function handleLeave(initiativeId: number) {
        setProcessing(true);
        router.delete(destroy(initiativeId).url, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    }

    function clearFilters() {
        setSelectedCity(null);
        setGenderFilter('all');
        setAgeFilter('all');
        setSelectedInitiativeId(null);
        setJoinConfirming(false);
    }

    return (
        <section
            id="initiatives"
            className="scroll-mt-20 border-b border-border bg-muted/40"
        >
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
                {/* الترويسة */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        مبادرات مميزة
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                        اختر محافظة على الخريطة لاستعراض مبادراتها، وصفّح
                        بالفلاتر للعثور على ما يناسبك.
                    </p>
                </div>

                {/* شريط الفلاتر */}
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
                    {/* فلتر المدينة */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            المحافظة
                        </span>
                        <div className="relative">
                            <select
                                value={selectedCity ?? ''}
                                onChange={(e) =>
                                    handleCitySelect(e.target.value || null)
                                }
                                className="appearance-none rounded-lg border border-border bg-background py-1.5 pr-3 pl-7 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            >
                                <option value="">الكل</option>
                                {JORDAN_CITIES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>

                    <div className="h-5 w-px bg-border" />

                    {/* فلتر الجنس */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            الجنس
                        </span>
                        <div className="flex overflow-hidden rounded-lg border border-border">
                            {GENDER_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setGenderFilter(opt.value)}
                                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        genderFilter === opt.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-5 w-px bg-border" />

                    {/* فلتر العمر */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                            الفئة العمرية
                        </span>
                        <div className="flex overflow-hidden rounded-lg border border-border">
                            {AGE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setAgeFilter(opt.value)}
                                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        ageFilter === opt.value
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-5 w-px bg-border" />

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <ArrowDownWideNarrow className="size-3.5 shrink-0" />
                            الترتيب
                        </span>
                        <div className="relative">
                            <select
                                value={sortKey}
                                onChange={(e) =>
                                    setSortKey(e.target.value as InitiativeSortKey)
                                }
                                className="appearance-none rounded-lg border border-border bg-background py-1.5 pr-3 pl-7 text-sm font-medium text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            >
                                {INITIATIVE_SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        </div>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <X className="size-3.5" />
                            مسح الفلاتر
                        </button>
                    )}

                    <span className="mr-auto text-xs text-muted-foreground">
                        {filteredInitiatives.length} مبادرة
                    </span>
                </div>

                {/* الخريطة + اللوحة الجانبية */}
                <div className="flex h-150 overflow-hidden rounded-2xl border border-border shadow-md">
                    {/* اللوحة اليسرى — قائمة ترند (Mock Data) */}
                    <div className="w-80 shrink-0 overflow-y-auto border-e border-border bg-card xl:w-96">
                        <TrendingInitiativesPanel />
                    </div>

                    {/* اللوحة الوسطية للمحافظة/المبادرة (تظهر فقط بعد اختيار دبوس) */}
                    {selectedCity ? (
                        <div className="w-80 shrink-0 overflow-y-auto border-e border-border bg-card xl:w-96">
                            <InitiativesPanel
                                selectedCity={selectedCity}
                                cityInitiatives={cityInitiatives}
                                selectedInitiative={selectedInitiative}
                                onInitiativeSelect={handleInitiativeSelect}
                                onBack={handleBack}
                                joinConfirming={joinConfirming}
                                onJoinConfirm={() =>
                                    selectedInitiative &&
                                    handleJoin(selectedInitiative.id)
                                }
                                onJoinRequest={() => setJoinConfirming(true)}
                                onJoinCancel={() => setJoinConfirming(false)}
                                onLeave={() =>
                                    selectedInitiative &&
                                    handleLeave(selectedInitiative.id)
                                }
                                withdrawalPenaltyPoints={withdrawalPenaltyPoints}
                                isAuthed={isAuthed}
                                canRegister={canRegister}
                                processing={processing}
                            />
                        </div>
                    ) : null}

                    {/* الخريطة */}
                    <div className="min-w-0 flex-1">
                        <Suspense
                            fallback={
                                <div className="flex h-full w-full animate-pulse items-center justify-center bg-muted">
                                    <MapPin className="size-10 text-muted-foreground/30" />
                                </div>
                            }
                        >
                            <JordanMap
                                cityCounts={filteredCityCounts}
                                selectedCity={selectedCity}
                                onCitySelect={handleCitySelect}
                                initiatives={initiativePins}
                                selectedInitiativeId={selectedInitiativeId}
                                onInitiativeSelect={handleMapInitiativeSelect}
                            />
                        </Suspense>
                    </div>
                </div>

                {/* حالة فارغة كاملة */}
                {initiatives.length === 0 && (
                    <div className="mt-6">
                        <EmptyInitiatives
                            isAuthed={isAuthed}
                            canRegister={canRegister}
                        />
                    </div>
                )}

                {/* زر إنشاء مبادرة */}
                <CreateInitiativeCTA
                    isAuthed={isAuthed}
                    canRegister={canRegister}
                />
            </div>
        </section>
    );
}

function TrendingInitiativesPanel() {
    return (
        <div className="flex h-full flex-col">
            <div className="border-b border-border bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Flame className="size-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                        المبادرات الأكثر رواجًا
                    </span>
                    <span className="mr-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        Top 5
                    </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                    بيانات تجريبية لعرض الترند.
                </p>
            </div>

            <ul className="divide-y divide-border">
                {TRENDING_INITIATIVES.map((item, index) => (
                    <li key={item.id} className="p-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {index + 1}. {item.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {item.city} · {item.category}
                                </p>
                            </div>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                {item.growth}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function InitiativesPanel({
    selectedCity,
    cityInitiatives,
    selectedInitiative,
    onInitiativeSelect,
    onBack,
    joinConfirming,
    onJoinRequest,
    onJoinConfirm,
    onJoinCancel,
    onLeave,
    withdrawalPenaltyPoints,
    isAuthed,
    canRegister,
    processing,
}: {
    selectedCity: string | null;
    cityInitiatives: FeaturedInitiative[];
    selectedInitiative: FeaturedInitiative | null;
    onInitiativeSelect: (i: FeaturedInitiative) => void;
    onBack: () => void;
    joinConfirming: boolean;
    onJoinRequest: () => void;
    onJoinConfirm: () => void;
    onJoinCancel: () => void;
    onLeave: () => void;
    withdrawalPenaltyPoints: number;
    isAuthed: boolean;
    canRegister: boolean;
    processing: boolean;
}) {
    if (!selectedCity) {
return null;
}

    const cityLabel =
        JORDAN_CITIES.find((c) => c.value === selectedCity)?.label ??
        selectedCity;

    if (selectedInitiative) {
        return (
            <InitiativeDetail
                initiative={selectedInitiative}
                cityLabel={cityLabel}
                onBack={onBack}
                joinConfirming={joinConfirming}
                onJoinRequest={onJoinRequest}
                onJoinConfirm={onJoinConfirm}
                onJoinCancel={onJoinCancel}
                onLeave={onLeave}
                withdrawalPenaltyPoints={withdrawalPenaltyPoints}
                isAuthed={isAuthed}
                canRegister={canRegister}
                processing={processing}
            />
        );
    }

    return (
        <div className="flex flex-col">
            <div className="border-b border-border bg-initiative-surface/50 px-4 py-3">
                <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">
                        {cityLabel}
                    </span>
                    <span className="mr-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {cityInitiatives.length} مبادرة
                    </span>
                </div>
            </div>

            {cityInitiatives.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        لا توجد مبادرات في هذه المحافظة تطابق الفلاتر.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-border">
                    {cityInitiatives.map((initiative) => (
                        <li key={initiative.id}>
                            <button
                                onClick={() => onInitiativeSelect(initiative)}
                                className="w-full p-4 text-start transition-colors hover:bg-accent"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm leading-snug font-semibold text-foreground">
                                        {initiative.name}
                                    </span>
                                    {initiative.is_joined && (
                                        <UserCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
                                    )}
                                </div>
                                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarDays className="size-3" />
                                        {formatArabicDate(initiative.starts_at)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="size-3" />
                                        {formatNumber(
                                            initiative.participants_count,
                                        )}
                                        {initiative.max_participants
                                            ? `/${formatNumber(initiative.max_participants)}`
                                            : ''}
                                    </span>
                                    <span className="flex items-center gap-1 text-primary">
                                        <Trophy className="size-3" />
                                        {formatNumber(
                                            initiative.creation_points,
                                        )}{' '}
                                        نقطة
                                    </span>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function InitiativeDetail({
    initiative,
    cityLabel,
    onBack,
    joinConfirming,
    onJoinRequest,
    onJoinConfirm,
    onJoinCancel,
    onLeave,
    withdrawalPenaltyPoints,
    isAuthed,
    canRegister,
    processing,
}: {
    initiative: FeaturedInitiative;
    cityLabel: string;
    onBack: () => void;
    joinConfirming: boolean;
    onJoinRequest: () => void;
    onJoinConfirm: () => void;
    onJoinCancel: () => void;
    onLeave: () => void;
    withdrawalPenaltyPoints: number;
    isAuthed: boolean;
    canRegister: boolean;
    processing: boolean;
}) {
    const max = initiative.max_participants ?? 0;
    const joined = initiative.participants_count;
    const isFull = max > 0 && joined >= max;
    const progress =
        max > 0 ? Math.min(100, Math.round((joined / max) * 100)) : 0;

    return (
        <div className="flex flex-col">
            {/* الهيدر مع زر الرجوع */}
            <div className="flex items-center gap-2 border-b border-border bg-initiative-surface/50 px-4 py-3">
                <button
                    onClick={onBack}
                    className="grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    title="رجوع"
                >
                    <ArrowRight className="size-4" />
                </button>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 text-primary" />
                    {cityLabel}
                </span>
            </div>

            {/* المحتوى */}
            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h3 className="text-base leading-snug font-bold text-foreground">
                        {initiative.name}
                    </h3>
                    {initiative.is_joined && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            <UserCheck className="size-3" />
                            أنت منضم
                        </span>
                    )}
                </div>

                {/* الوصف */}
                {initiative.description ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {initiative.description}
                    </p>
                ) : null}

                {/* معلومات المبادرة */}
                <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 text-primary" />
                        <span>{formatArabicDate(initiative.starts_at)}</span>
                    </div>

                    {/* النقاط */}
                    <div className="flex items-center gap-2">
                        <Trophy className="size-3.5 text-primary" />
                        <span>
                            <span className="font-bold text-foreground">
                                {formatNumber(initiative.creation_points)}
                            </span>{' '}
                            نقطة للحضور
                        </span>
                    </div>

                    {initiative.reviews_count > 0 &&
                    initiative.reviews_average !== null ? (
                        <div className="flex items-center gap-2">
                            <Star className="size-3.5 shrink-0 fill-primary/25 text-primary" />
                            <span>
                                <span className="font-bold tabular-nums text-foreground">
                                    {Number(initiative.reviews_average).toFixed(
                                        1,
                                    )}
                                </span>{' '}
                                — {formatNumber(initiative.reviews_count)}{' '}
                                تقييم
                            </span>
                        </div>
                    ) : null}

                    {/* المشاركون */}
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                                <Users className="size-3.5 text-primary" />
                                {formatNumber(joined)}
                                {max > 0 ? ` / ${formatNumber(max)}` : ''} مشارك
                            </span>
                            {isFull && (
                                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                                    مكتملة
                                </span>
                            )}
                        </div>
                        {max > 0 && (
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* الحد الأدنى للمشاركين */}
                    {initiative.min_participants ? (
                        <div className="flex items-center gap-2">
                            <Users className="size-3.5 text-muted-foreground" />
                            <span>
                                الحد الأدنى:{' '}
                                <span className="font-medium text-foreground">
                                    {formatNumber(initiative.min_participants)}{' '}
                                    مشارك
                                </span>
                            </span>
                        </div>
                    ) : null}

                    {/* الجنس والعمر */}
                    <div className="flex flex-wrap gap-1.5">
                        {initiative.target_gender ? (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {initiative.target_gender === 'male'
                                    ? '👨 ذكور'
                                    : '👩 إناث'}
                            </span>
                        ) : null}
                        {initiative.min_age ? (
                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {formatNumber(initiative.min_age)}+ سنة
                            </span>
                        ) : null}
                    </div>

                    {/* المنشئ */}
                    {initiative.creator_username ? (
                        <Link
                            href={showUser(initiative.creator_username).url}
                            className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                        >
                            <Avatar className="size-5 shrink-0 border border-border/60">
                                <AvatarImage
                                    src={initiative.creator_avatar_url ?? undefined}
                                    alt={initiative.creator_username}
                                />
                                <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
                                    {initiative.creator_username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] text-muted-foreground">
                                بإشراف{' '}
                                <span className="font-semibold text-foreground">
                                    @{initiative.creator_username}
                                </span>
                            </span>
                        </Link>
                    ) : null}
                </div>

                {/* أزرار الانضمام / الانسحاب */}
                <div className="mt-2">
                    {!isAuthed ? (
                        <div className="space-y-2">
                            <Link
                                href={login()}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                <LogIn className="size-4" />
                                سجّل دخولك للانضمام
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                                >
                                    أنشئ حسابًا جديدًا
                                </Link>
                            )}
                        </div>
                    ) : initiative.is_joined ? (
                        <div className="space-y-2">
                            <button
                                onClick={onLeave}
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
                            >
                                <UserMinus className="size-4" />
                                {processing
                                    ? 'جارٍ الانسحاب…'
                                    : 'الانسحاب من المبادرة'}
                            </button>
                            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
                                يُنفَّذ الخصم على الخادم: حتى{' '}
                                <span className="font-semibold text-foreground">
                                    {formatNumber(withdrawalPenaltyPoints)}
                                </span>{' '}
                                نقاط من رصيدك (لا يُنقص الرصيد عن الصفر).
                            </p>
                        </div>
                    ) : joinConfirming ? (
                        /* تأكيد الانضمام — تحذير النقاط */
                        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                            <div className="flex gap-2">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <div className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                                    <p className="font-bold">
                                        تنبيه قبل الانضمام
                                    </p>
                                    <p className="mt-1">
                                        ستكسب{' '}
                                        <span className="font-bold">
                                            {formatNumber(
                                                initiative.creation_points,
                                            )}{' '}
                                            نقطة
                                        </span>{' '}
                                        عند تسجيل حضورك.
                                    </p>
                                    <p className="mt-0.5">
                                        إذا انسحبت لاحقًا، سيُخصم حتى{' '}
                                        <span className="font-bold">
                                            {formatNumber(
                                                withdrawalPenaltyPoints,
                                            )}{' '}
                                            نقاط
                                        </span>{' '}
                                        من رصيدك.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={onJoinConfirm}
                                    disabled={processing}
                                    className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                                >
                                    {processing
                                        ? 'جارٍ الانضمام…'
                                        : 'تأكيد الانضمام'}
                                </button>
                                <button
                                    onClick={onJoinCancel}
                                    disabled={processing}
                                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={onJoinRequest}
                            disabled={isFull}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <UserCheck className="size-4" />
                            {isFull ? 'المبادرة مكتملة' : 'انضم إلى المبادرة'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function RewardsHomeTeaser({
    total,
    isAuthed,
    canRegister,
}: {
    total: number;
    isAuthed: boolean;
    canRegister: boolean;
}) {
    const { auth } = usePage().props;
    const userPoints = auth.user?.points ?? 0;

    return (
        <section
            id="rewards"
            className="scroll-mt-20 border-b border-border bg-background"
            aria-labelledby="rewards-home-heading"
        >
            <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
                <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-10">
                    <div className="relative isolate flex min-h-[18rem] flex-col justify-center overflow-hidden rounded-[var(--radius)] border border-border p-6 text-right shadow-sm ring-1 ring-primary/5 sm:min-h-[20rem] sm:p-8">
                        <img
                            alt=""
                            src="/images/himma/community-food-service.jpg"
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-40"
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 z-[1] bg-linear-to-t from-background/97 via-background/88 to-background/55 dark:from-background/98 dark:via-background/93 dark:to-background/70"
                        />
                        <div className="relative z-10 flex flex-col">
                            <div className="text-xs font-semibold text-primary">
                                لمحة سريعة
                            </div>
                            <h2
                                id="rewards-home-heading"
                                className="mt-2 text-[clamp(1.5rem,3.5vw,2.35rem)] font-extrabold leading-tight tracking-tight text-foreground drop-shadow-sm"
                            >
                                مكافآت الشركاء — التفاصيل كاملة في صفحة مستقلة
                            </h2>
                            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed font-bold text-muted-foreground sm:text-base">
                                الاستبدال والترقيم كاملان على صفحة «المكافآت» بمستوى
                                تنظيم مماثل لتجربة «شركاؤنا»؛ من الرابط أدناه تنتقل
                                مباشرة للمتجر.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    href={rewardsIndex()}
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                                >
                                    صفحة المكافآت والاستبدال
                                </Link>
                                <a
                                    href="#initiatives"
                                    className="inline-flex items-center justify-center rounded-md border border-border bg-background/92 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
                                >
                                    اكسب نقاط الآن
                                </a>
                                <Link
                                    href={collaborations()}
                                    className="inline-flex items-center justify-center rounded-md border border-border bg-background/85 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
                                >
                                    عن الشراكات والمنصة
                                </Link>
                                {!isAuthed && canRegister ? (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-md border border-border bg-background/92 px-5 py-2.5 text-sm font-semibold text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent"
                                    >
                                        أنشئ حسابًا
                                    </Link>
                                ) : null}
                            </div>
                            <div
                                className="mt-4 inline-flex w-fit flex-col rounded-2xl border border-border bg-card/82 px-4 py-3 text-xs font-semibold leading-relaxed text-muted-foreground shadow-md backdrop-blur-md"
                                style={{
                                    boxShadow:
                                        '0 10px 24px hsl(var(--primary) / 0.06)',
                                }}
                            >
                                <span>رصيدك الحالي</span>
                                {isAuthed ? (
                                    <span className="mt-1 tabular-nums text-base font-black text-primary">
                                        {formatNumber(userPoints)} نقطة
                                    </span>
                                ) : (
                                    <span className="mt-1 text-[0.8rem] font-bold">
                                        <Link
                                            href={login()}
                                            className="text-primary underline underline-offset-2 hover:opacity-90"
                                        >
                                            سجّل الدخول
                                        </Link>
                                        لمتابعة الرصيد والاستبدال.
                                    </span>
                                )}
                            </div>
                            {total > 0 ? (
                                <p className="mt-3 text-xs font-bold tabular-nums text-muted-foreground">
                                    إجمالي المكافآت المعروضة في المتجر مؤخرًا:
                                    <span className="mx-1 text-foreground">
                                        {formatNumber(total)}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="relative isolate flex min-h-[220px] items-center overflow-hidden rounded-3xl border border-border p-6 sm:min-h-[260px] sm:p-7">
                        <img
                            alt=""
                            src="/images/himma/community-cleanup-team.jpg"
                            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[0.42]"
                        />
                        <div
                            aria-hidden
                            className="absolute inset-0 z-[1] bg-linear-to-br from-background/96 via-background/78 to-background/65 dark:from-background/98 dark:via-background/88 dark:to-background/72"
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_35%_30%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(ellipse_at_70%_70%,hsl(var(--initiative-highlight)/0.08),transparent_50%)]"
                        />
                        <div className="relative z-10 mx-auto grid w-full max-w-[16rem] gap-2 rounded-[1.1rem] border border-primary/15 bg-muted/85 p-5 text-center shadow-md backdrop-blur-sm">
                            <Gift className="mx-auto size-9 text-primary" />
                            <p className="text-sm font-extrabold text-foreground">
                                استبدال منظم
                            </p>
                            <p className="text-[0.8rem] leading-relaxed font-semibold text-muted-foreground">
                                انتقل إلى صفحة المكافآت لقراءة الشروط وللاستبدال
                                بطريقة واحدة متسقة.
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    dir="rtl"
                    className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch sm:gap-2"
                >
                    <article className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 text-right shadow-sm sm:p-5">
                        <strong className="block text-sm font-bold text-foreground">
                            كيف تجمع النقاط؟
                        </strong>
                        <span className="mt-2 block text-sm leading-relaxed font-semibold text-muted-foreground">
                            من خلال مشاركاتك الموثقة وحضورك داخل المبادرات
                            المعتمدة.
                        </span>
                    </article>
                    <div
                        className="flex shrink-0 items-center justify-center py-0.5 sm:w-10 sm:py-0"
                        aria-hidden
                    >
                        <ChevronDown className="size-7 text-primary/55 sm:hidden" />
                        <ChevronLeft
                            className="hidden size-8 text-primary/55 sm:block"
                            strokeWidth={2.25}
                        />
                    </div>
                    <article className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 text-right shadow-sm sm:p-5">
                        <strong className="block text-sm font-bold text-foreground">
                            ما فائدتها؟
                        </strong>
                        <span className="mt-2 block text-sm leading-relaxed font-semibold text-muted-foreground">
                            تحوّل نشاطك إلى مكافآت واضحة من شركاء المنصة في مكان
                            واحد.
                        </span>
                    </article>
                    <div
                        className="flex shrink-0 items-center justify-center py-0.5 sm:w-10 sm:py-0"
                        aria-hidden
                    >
                        <ChevronDown className="size-7 text-primary/55 sm:hidden" />
                        <ChevronLeft
                            className="hidden size-8 text-primary/55 sm:block"
                            strokeWidth={2.25}
                        />
                    </div>
                    <article className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 text-right shadow-sm sm:p-5">
                        <strong className="block text-sm font-bold text-foreground">
                            متى تستخدمها؟
                        </strong>
                        <span className="mt-2 block text-sm leading-relaxed font-semibold text-muted-foreground">
                            عند ظهور مكافأة مناسبة زُرْ صفحة المكافآت واستبدل
                            نقاطك مباشرة.
                        </span>
                    </article>
                </div>
            </div>
        </section>
    );
}

function CreateInitiativeCTA({
    isAuthed,
    canRegister,
}: {
    isAuthed: boolean;
    canRegister: boolean;
}) {
    if (isAuthed) {
        return (
            <div className="relative mt-10 overflow-hidden rounded-3xl bg-primary px-8 py-12 text-center shadow-lg">
                {/* خلفية ديكورية */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-10"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-white/10 blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-white/10 blur-3xl"
                />

                <div className="relative mx-auto max-w-xl">
                    <span className="mx-auto mb-5 grid size-16 place-items-center rounded-2xl bg-white/20 text-white shadow-inner">
                        <Plus className="size-8" />
                    </span>

                    <h3 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        لديك فكرة مبادرة؟
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/80">
                        أطلق مبادرتك الخاصة، واجمع المتطوعين حولك، واكسب نقاط
                        إضافية عند اعتمادها.
                    </p>

                    <Link
                        href={initiativesIndex()}
                        className="mt-8 inline-flex cursor-pointer items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                    >
                        <Plus className="size-4.5" />
                        أنشئ مبادرتك الآن
                        <ArrowRight className="size-4 rtl:rotate-180" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="grid gap-0 md:grid-cols-2">
                {/* الجانب الأيمن — نص */}
                <div className="flex flex-col justify-center px-8 py-10 text-center md:text-right">
                    <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-initiative-surface text-primary md:mx-0">
                        <Sparkles className="size-6" />
                    </span>

                    <h3 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                        أنشئ مبادرتك الخاصة
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                        انضم إلى همة وابدأ رحلتك التطوعية — أطلق مبادراتك،
                        اكسب نقاطًا، واحصل على مكافآت حقيقية.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                        {canRegister && (
                            <Link
                                href={register()}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all duration-200 hover:opacity-90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            >
                                <Plus className="size-4" />
                                أنشئ حسابك مجانًا
                            </Link>
                        )}
                        <Link
                            href={login()}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                            <LogIn className="size-4" />
                            تسجيل الدخول
                        </Link>
                    </div>
                </div>

                {/* الجانب الأيسر — مزايا مرئية */}
                <div className="hidden items-center justify-center bg-muted/50 px-8 py-10 md:flex">
                    <ul className="w-full max-w-xs space-y-4">
                        {[
                            {
                                icon: HandHeart,
                                title: 'أطلق مبادراتك',
                                desc: 'صمّم مبادرتك وحدّد المكان والزمان والفئة المستهدفة',
                            },
                            {
                                icon: Trophy,
                                title: 'اكسب نقاطًا',
                                desc: 'نقاط إضافية عند اعتماد مبادرتك وحضور المتطوعين',
                            },
                            {
                                icon: Gift,
                                title: 'استبدل بمكافآت',
                                desc: 'حوّل نقاطك إلى مكافآت حقيقية من شركائنا',
                            },
                        ].map(({ icon: Icon, title, desc }) => (
                            <li key={title} className="flex items-start gap-3">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-initiative-surface text-primary">
                                    <Icon className="size-4.5" />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {title}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                        {desc}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function EmptyInitiatives({
    isAuthed,
    canRegister,
}: {
    isAuthed: boolean;
    canRegister: boolean;
}) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-initiative-surface text-primary">
                <HandHeart className="size-6" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-foreground">
                لا توجد مبادرات معتمدة بعد
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                كن أول من يطلق مبادرة في مجتمعك. أنشئ حسابك وأرسل مبادرتك
                للاعتماد.
            </p>
            {!isAuthed && canRegister ? (
                <Link
                    href={register()}
                    className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                    أنشئ حسابك الآن
                </Link>
            ) : null}
        </div>
    );
}

function SiteFooter() {
    return (
        <footer className="border-t border-border bg-card text-card-foreground">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-3 sm:px-6">
                <div>
                    <div className="flex items-center gap-2 text-lg font-extrabold">
                        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                            <HandHeart className="size-4" />
                        </span>
                        همة
                    </div>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                        منصة العمل التطوعي للشباب في الأردن — مبادرات، نقاط،
                        ومكافآت في مكان واحد.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-foreground">
                        روابط سريعة
                    </h4>
                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {NAV_LINKS.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={getNavLinkHref(link, true)}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-foreground">
                        تواصل معنا
                    </h4>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        لأي استفسار أو شراكة، تواصل معنا عبر البريد الرسمي
                        للمنصة. نسعد بانضمام المؤسسات الراغبة بدعم الشباب
                        المتطوع.
                    </p>
                </div>
            </div>

            <div className="border-t border-border">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6">
                    <span>همة — منصة العمل التطوعي</span>
                    <span>
                        © {formatNumber(new Date().getFullYear())} جميع الحقوق
                        محفوظة
                    </span>
                </div>
            </div>
        </footer>
    );
}
