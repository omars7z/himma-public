import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDownWideNarrow,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock,
    HandHeart,
    MapPin,
    Plus,
    Star,
    Trophy,
    UserCheck,
    UserMinus,
    Users,
    X,
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { store as storeInitiative } from '@/actions/App/Http/Controllers/InitiativesController';
import {
    show as showInitiative,
    index as indexInitiatives,
} from '@/actions/App/Http/Controllers/InitiativesController';
import {
    store,
    destroy,
} from '@/actions/App/Http/Controllers/ParticipationsController';
import { showUser } from '@/actions/App/Http/Controllers/ProfileController';
import type { InitiativePin } from '@/components/jordan-map';
import { SiteHeader } from '@/components/site-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { JORDAN_CITIES } from '@/constants/jordan-cities';
import {
    INITIATIVE_SORT_OPTIONS,
    sortInitiatives
    
} from '@/lib/initiative-sort';
import type {InitiativeSortKey} from '@/lib/initiative-sort';

const JordanMap = lazy(async () => {
    if (typeof window === 'undefined') {
return { default: () => <></> };
}

    return import('@/components/jordan-map').then((m) => ({ default: m.JordanMap }));
});

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

type MyParticipation = {
    participation_id: number;
    status: string;
    points_awarded: number | null;
    enrolled_at: string;
    initiative: Initiative;
};

type PageProps = {
    withdrawalPenaltyPoints: number;
    featuredInitiatives: Initiative[];
    myParticipations: MyParticipation[];
};

type GenderFilter = 'all' | 'male' | 'female';
type AgeFilter = 'all' | '13' | '18' | '25';

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

const formatArabicDateTime = (iso: string): string =>
    new Intl.DateTimeFormat('ar-JO-u-nu-latn', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date(iso));

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

export default function InitiativesIndex({
    withdrawalPenaltyPoints,
    featuredInitiatives,
    myParticipations,
}: PageProps) {
    const [activeTab, setActiveTab] = useState<'browse' | 'mine'>('browse');
    const [createOpen, setCreateOpen] = useState(false);

    return (
        <>
            <Head title="المبادرات" />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <SiteHeader />
                <main className="flex-1">
                    {/* Hero شريط صغير */}
                    <div className="border-b border-border bg-linear-to-b from-initiative-surface/70 via-background to-background">
                        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-6">
                            <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-6">
                                <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                    المبادرات
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    استكشف مبادرات تطوعية أو أنشئ مبادرتك الخاصة
                                </p>
                                </div>
                                <div className="hidden shrink-0 overflow-hidden rounded-2xl border border-border shadow-md sm:block sm:h-28 sm:w-44 md:h-32 md:w-52">
                                    <img
                                        alt=""
                                        src="/images/himma/community-cleanup-team.jpg"
                                        loading="lazy"
                                        decoding="async"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>

                            <div className="relative shrink-0 sm:max-w-[min(100%,20rem)]">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -inset-1 rounded-3xl bg-linear-to-br from-initiative-highlight/25 via-primary/15 to-transparent opacity-90 blur-sm"
                                />
                                <div className="relative overflow-hidden rounded-2xl border-2 border-primary/35 bg-card/90 p-4 shadow-xl ring-1 shadow-primary/15 ring-initiative-highlight/25 backdrop-blur-sm dark:bg-card/70">
                                    <div
                                        aria-hidden
                                        className="absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,hsl(var(--initiative-highlight)_/_0.12),transparent_55%)]"
                                    />
                                    <div className="relative flex flex-col gap-3">
                                        <p className="text-xs font-semibold tracking-wide text-initiative-highlight">
                                            ابدأ التأثير
                                        </p>
                                        <p className="text-sm leading-snug text-muted-foreground">
                                            أنشئ مبادرة واحصل على نقاط عند
                                            الموافقة عليها.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setCreateOpen(true)}
                                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-[transform,box-shadow] hover:shadow-lg hover:shadow-primary/25 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.98] sm:w-auto sm:self-start"
                                        >
                                            <Plus
                                                className="size-5 shrink-0"
                                                strokeWidth={2.5}
                                            />
                                            <span className="hidden sm:inline">
                                                إنشاء مبادرة
                                            </span>
                                            <span className="sm:hidden">
                                                إنشاء مبادرة جديدة
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* التبويبات */}
                    <div className="border-b border-border bg-card">
                        <div className="mx-auto max-w-6xl px-4 sm:px-6">
                            <div className="flex gap-0">
                                <TabButton
                                    active={activeTab === 'browse'}
                                    onClick={() => setActiveTab('browse')}
                                    icon={<MapPin className="size-4" />}
                                    label="استكشف المبادرات"
                                    badge={featuredInitiatives.length}
                                />
                                <TabButton
                                    active={activeTab === 'mine'}
                                    onClick={() => setActiveTab('mine')}
                                    icon={<UserCheck className="size-4" />}
                                    label="مشاركاتي"
                                    badge={myParticipations.length}
                                />
                            </div>
                        </div>
                    </div>

                    {activeTab === 'browse' ? (
                        <BrowseSection
                            initiatives={featuredInitiatives}
                            withdrawalPenaltyPoints={withdrawalPenaltyPoints}
                            onRequestCreateInitiative={() =>
                                setCreateOpen(true)
                            }
                        />
                    ) : (
                        <MyParticipationsSection
                            participations={myParticipations}
                            withdrawalPenaltyPoints={withdrawalPenaltyPoints}
                        />
                    )}
                </main>

                <CreateInitiativeDialog
                    open={createOpen}
                    onClose={() => setCreateOpen(false)}
                />
            </div>
        </>
    );
}

function TabButton({
    active,
    onClick,
    icon,
    label,
    badge,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    badge: number;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 border-b-2 px-5 py-3.5 text-sm font-semibold transition-colors ${
                active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
            {icon}
            {label}
            <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    active
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                }`}
            >
                {badge}
            </span>
        </button>
    );
}

/* ─────────────────────────────────────────────
   قسم الاستكشاف — مطابق لقسم home.tsx
───────────────────────────────────────────── */
function BrowseSection({
    initiatives,
    withdrawalPenaltyPoints,
    onRequestCreateInitiative,
}: {
    initiatives: Initiative[];
    withdrawalPenaltyPoints: number;
    onRequestCreateInitiative: () => void;
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

    const filteredSortedInitiatives = useMemo(
        () => sortInitiatives(filteredInitiatives, sortKey),
        [filteredInitiatives, sortKey],
    );

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

    const hasActiveFilters =
        selectedCity !== null || genderFilter !== 'all' || ageFilter !== 'all';

    function handleMapInitiativeSelect(id: number) {
        const initiative = filteredSortedInitiatives.find((i) => i.id === id);

        if (!initiative) {
return;
}

        setSelectedCity(initiative.city?.toLowerCase() ?? null);
        setSelectedInitiativeId(id);
        setJoinConfirming(false);
    }

    function handleCitySelect(city: string | null) {
        setSelectedCity(city);
        setSelectedInitiativeId(null);
        setJoinConfirming(false);
    }

    function handleInitiativeSelect(initiative: Initiative) {
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
        <section className="border-b border-border bg-muted/40">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
                {/* شريط الفلاتر */}
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
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
                <div className="flex h-[580px] overflow-hidden rounded-2xl border border-border shadow-md">
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
                            processing={processing}
                        />
                    </div>
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

                {initiatives.length === 0 && (
                    <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/30 bg-initiative-surface/40 p-10 text-center shadow-inner shadow-primary/5 dark:bg-initiative-surface/10">
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary ring-2 ring-primary/20">
                            <HandHeart className="size-6" />
                        </span>
                        <p className="mt-4 text-sm font-semibold text-foreground">
                            لا توجد مبادرات معتمدة حاليًا
                        </p>
                        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                            كن أول من يطلق مبادرة — أنشئ مبادرتك وأرسلها
                            للمراجعة.
                        </p>
                        <button
                            type="button"
                            onClick={onRequestCreateInitiative}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-[transform,box-shadow] hover:shadow-lg hover:shadow-primary/20 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none active:scale-[0.98]"
                        >
                            <Plus
                                className="size-4 shrink-0"
                                strokeWidth={2.5}
                            />
                            إنشاء مبادرة الآن
                        </button>
                    </div>
                )}
            </div>
        </section>
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
    processing,
}: {
    selectedCity: string | null;
    cityInitiatives: Initiative[];
    selectedInitiative: Initiative | null;
    onInitiativeSelect: (i: Initiative) => void;
    onBack: () => void;
    joinConfirming: boolean;
    onJoinRequest: () => void;
    onJoinConfirm: () => void;
    onJoinCancel: () => void;
    onLeave: () => void;
    withdrawalPenaltyPoints: number;
    processing: boolean;
}) {
    if (!selectedCity) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
                    <MapPin className="size-6" />
                </span>
                <p className="text-sm font-semibold text-foreground">
                    اختر محافظة
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    انقر على أي دبوس في الخريطة لاستعراض مبادراتها
                </p>
            </div>
        );
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
                                    {initiative.reviews_count > 0 &&
                                    initiative.reviews_average !== null ? (
                                        <span className="flex items-center gap-0.5 text-primary tabular-nums">
                                            <Star className="size-3 shrink-0 fill-primary/25 text-primary" />
                                            {Number(
                                                initiative.reviews_average,
                                            ).toFixed(1)}
                                        </span>
                                    ) : null}
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
    processing,
}: {
    initiative: Initiative;
    cityLabel: string;
    onBack: () => void;
    joinConfirming: boolean;
    onJoinRequest: () => void;
    onJoinConfirm: () => void;
    onJoinCancel: () => void;
    onLeave: () => void;
    withdrawalPenaltyPoints: number;
    processing: boolean;
}) {
    const max = initiative.max_participants ?? 0;
    const joined = initiative.participants_count;
    const isFull = max > 0 && joined >= max;
    const progress =
        max > 0 ? Math.min(100, Math.round((joined / max) * 100)) : 0;

    return (
        <div className="flex flex-col">
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
                <Link
                    href={showInitiative(initiative.id).url}
                    className="mr-auto flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    صفحة كاملة
                    <ArrowLeft className="size-3" />
                </Link>
            </div>

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

                {initiative.description ? (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {initiative.description}
                    </p>
                ) : null}

                <div className="space-y-2.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 text-primary" />
                        <span>{formatArabicDate(initiative.starts_at)}</span>
                    </div>

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

                <div className="mt-2">
                    {initiative.is_joined ? (
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
                                سيُخصم حتى{' '}
                                <span className="font-semibold text-foreground">
                                    {formatNumber(withdrawalPenaltyPoints)}
                                </span>{' '}
                                نقاط عند الانسحاب.
                            </p>
                        </div>
                    ) : joinConfirming ? (
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

/* ─────────────────────────────────────────────
   قسم مشاركاتي — السجل التاريخي
───────────────────────────────────────────── */
function MyParticipationsSection({
    participations,
    withdrawalPenaltyPoints,
}: {
    participations: MyParticipation[];
    withdrawalPenaltyPoints: number;
}) {
    const [processing, setProcessing] = useState<number | null>(null);

    function handleLeave(initiativeId: number) {
        setProcessing(initiativeId);
        router.delete(destroy(initiativeId).url, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    }

    if (participations.length === 0) {
        return (
            <section className="bg-background">
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-initiative-surface text-primary">
                            <UserCheck className="size-7" />
                        </span>
                        <h3 className="mt-5 text-lg font-bold text-foreground">
                            لم تنضم لأي مبادرة بعد
                        </h3>
                        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                            انتقل إلى تبويب "استكشف المبادرات" واختر مبادرة
                            تناسبك للانضمام إليها.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-background">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground">
                        سجل مشاركاتك
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {participations.length} مشاركة
                    </span>
                </div>

                <ul className="space-y-4">
                    {participations.map(
                        ({
                            participation_id,
                            status,
                            points_awarded,
                            enrolled_at,
                            initiative,
                        }) => (
                            <li key={participation_id}>
                                <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start sm:gap-6">
                                    {/* أيقونة الحالة */}
                                    <div className="shrink-0">
                                        <StatusBadgeIcon status={status} />
                                    </div>

                                    {/* التفاصيل */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
                                            <Link
                                                href={
                                                    showInitiative(
                                                        initiative.id,
                                                    ).url
                                                }
                                                className="text-base font-bold text-foreground transition-colors hover:text-primary"
                                            >
                                                {initiative.name}
                                            </Link>
                                            <ParticipationStatusBadge
                                                status={status}
                                                pointsAwarded={points_awarded}
                                            />
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            {initiative.city && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3 text-primary" />
                                                    {JORDAN_CITIES.find(
                                                        (c) =>
                                                            c.value ===
                                                            initiative.city?.toLowerCase(),
                                                    )?.label ?? initiative.city}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="size-3 text-primary" />
                                                {formatArabicDate(
                                                    initiative.starts_at,
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="size-3" />
                                                انضممت{' '}
                                                {formatArabicDateTime(
                                                    enrolled_at,
                                                )}
                                            </span>
                                            <span className="flex items-center gap-1 text-primary">
                                                <Trophy className="size-3" />
                                                {points_awarded !== null
                                                    ? `${formatNumber(points_awarded)} نقطة مكتسبة`
                                                    : `${formatNumber(initiative.creation_points)} نقطة للحضور`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* أزرار التفاعل */}
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Link
                                            href={
                                                showInitiative(initiative.id)
                                                    .url
                                            }
                                            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                                        >
                                            عرض
                                        </Link>
                                        {status === 'registered' && (
                                            <button
                                                onClick={() =>
                                                    handleLeave(initiative.id)
                                                }
                                                disabled={
                                                    processing === initiative.id
                                                }
                                                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
                                            >
                                                {processing === initiative.id
                                                    ? '…'
                                                    : 'انسحاب'}
                                            </button>
                                        )}
                                    </div>
                                </article>
                            </li>
                        ),
                    )}
                </ul>
            </div>
        </section>
    );
}

function StatusBadgeIcon({ status }: { status: string }) {
    if (status === 'attended') {
        return (
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10">
                <CheckCircle2 className="size-6 text-primary" />
            </span>
        );
    }

    return (
        <span className="grid size-12 place-items-center rounded-xl bg-muted">
            <Clock className="size-6 text-muted-foreground" />
        </span>
    );
}

function ParticipationStatusBadge({
    status,
    pointsAwarded,
}: {
    status: string;
    pointsAwarded: number | null;
}) {
    if (status === 'attended') {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                <CheckCircle2 className="size-3" />
                حضرت ·{' '}
                {pointsAwarded !== null
                    ? `${formatNumber(pointsAwarded)} نقطة`
                    : ''}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Clock className="size-3" />
            مسجّل
        </span>
    );
}

/* ─────────────────────────────────────────────
   حوار إنشاء مبادرة
───────────────────────────────────────────── */
function CreateInitiativeDialog({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        starts_at: '',
        city: '',
        min_participants: '',
        max_participants: '',
        target_gender: '',
        min_age: '',
    });

    useEffect(() => {
        if (!open) {
reset();
}
    }, [open]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(storeInitiative().url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('تم إرسال مبادرتك للمراجعة بنجاح!');
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent
                className="z-500 max-h-[90vh] overflow-y-auto sm:max-w-xl"
                dir="rtl"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <HandHeart className="size-5 text-primary" />
                        إنشاء مبادرة جديدة
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        ستُرسل مبادرتك للمراجعة قبل نشرها. ستُشعَر عند الموافقة
                        عليها.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {/* الاسم */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            اسم المبادرة{' '}
                            <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="مثال: تنظيف شاطئ العقبة"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* الوصف */}
                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-foreground">
                            الوصف
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            rows={3}
                            placeholder="صِف هدف المبادرة وما ستقوم به…"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-destructive">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* التاريخ والمحافظة */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                تاريخ البداية{' '}
                                <span className="text-destructive">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData('starts_at', e.target.value)
                                }
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            />
                            {errors.starts_at && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.starts_at}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                المحافظة
                            </label>
                            <div className="relative">
                                <select
                                    value={data.city}
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                    className="w-full appearance-none rounded-lg border border-border bg-background py-2 pr-3 pl-7 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                                >
                                    <option value="">اختر…</option>
                                    {JORDAN_CITIES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            {errors.city && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.city}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* المشاركون */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                الحد الأدنى للمشاركين
                            </label>
                            <input
                                type="number"
                                min={2}
                                value={data.min_participants}
                                onChange={(e) =>
                                    setData('min_participants', e.target.value)
                                }
                                placeholder="اختياري"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            />
                            {errors.min_participants && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.min_participants}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                الحد الأقصى للمشاركين
                            </label>
                            <input
                                type="number"
                                min={2}
                                value={data.max_participants}
                                onChange={(e) =>
                                    setData('max_participants', e.target.value)
                                }
                                placeholder="اختياري"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            />
                            {errors.max_participants && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.max_participants}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* الجنس والعمر */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                الجنس المستهدف
                            </label>
                            <select
                                value={data.target_gender}
                                onChange={(e) =>
                                    setData('target_gender', e.target.value)
                                }
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            >
                                <option value="">الجميع</option>
                                <option value="male">ذكور</option>
                                <option value="female">إناث</option>
                            </select>
                            {errors.target_gender && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.target_gender}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                الحد الأدنى للعمر
                            </label>
                            <input
                                type="number"
                                min={13}
                                max={100}
                                value={data.min_age}
                                onChange={(e) =>
                                    setData('min_age', e.target.value)
                                }
                                placeholder="13"
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/40 focus:outline-none"
                            />
                            {errors.min_age && (
                                <p className="mt-1 text-xs text-destructive">
                                    {errors.min_age}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* أزرار الإجراء */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                        >
                            {processing ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

