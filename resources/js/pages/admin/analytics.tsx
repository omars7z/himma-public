import { Head, Link } from '@inertiajs/react';
import { showUser } from '@/actions/App/Http/Controllers/ProfileController';
import {
    BarChart2,
    CheckCircle2,
    CircleDashed,
    Gift,
    MapPin,
    Trophy,
    TrendingUp,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { JORDAN_CITIES } from '@/constants/jordan-cities';

/* ── colours ──────────────────────────────────────────────── */
const C = {
    primary: 'hsl(152, 58%, 36%)',
    primaryLight: 'hsl(152, 48%, 52%)',
    blue: 'hsl(217, 91%, 60%)',
    amber: 'hsl(38, 92%, 50%)',
    red: 'hsl(0, 72%, 51%)',
    purple: 'hsl(270, 67%, 58%)',
    muted: 'hsl(160, 12%, 70%)',
} as const;

/* ── types ─────────────────────────────────────────────────── */
type Stats = {
    users_total: number;
    users_this_month: number;
    initiatives_pending: number;
    initiatives_approved: number;
    initiatives_rejected: number;
    initiatives_total: number;
    participations_total: number;
    rewards_total: number;
    redemptions_total: number;
};

type Props = {
    stats: Stats;
    initiativesByMonth: Record<string, number>;
    participationsByMonth: Record<string, number>;
    usersByMonth: Record<string, number>;
    initiativesByCity: Record<string, number>;
    initiativesByDay: Record<string, number>;
    topContributors: {
        username: string;
        avatar_url: string;
        points: number;
        city: string | null;
    }[];
};

/* ── helpers ────────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat('ar-JO').format(n);

function monthLabel(key: string) {
    const [y, m] = key.split('-');
    return new Intl.DateTimeFormat('ar-JO', {
        month: 'short',
        year: '2-digit',
    }).format(new Date(Number(y), Number(m) - 1));
}

function dayLabel(key: string) {
    const d = new Date(key);
    return new Intl.DateTimeFormat('ar-JO', {
        day: 'numeric',
        month: 'short',
    }).format(d);
}

function cityLabel(value: string) {
    return (
        JORDAN_CITIES.find((c) => c.value === value.toLowerCase())?.label ??
        value
    );
}

/* ── merge monthly series ────────────────────────────────────── */
function mergeMonthly(
    initiatives: Record<string, number>,
    participations: Record<string, number>,
    users: Record<string, number>,
) {
    const keys = Array.from(
        new Set([
            ...Object.keys(initiatives),
            ...Object.keys(participations),
            ...Object.keys(users),
        ]),
    ).sort();

    return keys.map((k) => ({
        month: monthLabel(k),
        مبادرات: initiatives[k] ?? 0,
        مشاركات: participations[k] ?? 0,
        مستخدمون: users[k] ?? 0,
    }));
}

/* ── group daily into weekly ─────────────────────────────────── */
function toWeekly(daily: Record<string, number>) {
    const days = Object.entries(daily).sort(([a], [b]) => a.localeCompare(b));
    const weeks: { week: string; مبادرات: number }[] = [];
    for (let i = 0; i < days.length; i += 7) {
        const slice = days.slice(i, i + 7);
        const total = slice.reduce((s, [, v]) => s + v, 0);
        const label = dayLabel(slice[0][0]);
        weeks.push({ week: label, مبادرات: total });
    }
    return weeks;
}

/* ─────────────────────────────────────────────────────────────
   KPI Card
──────────────────────────────────────────────────────────── */
function KpiCard({
    label,
    value,
    sub,
    icon: Icon,
    accent,
}: {
    label: string;
    value: number;
    sub?: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
}) {
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="p-5">
                <div className="flex items-start gap-3">
                    <div
                        className="grid size-10 shrink-0 place-items-center rounded-xl"
                        style={{ background: `${accent}18`, color: accent }}
                    >
                        <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1 text-right">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                            {fmt(value)}
                        </p>
                        {sub && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {sub}
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────────────────────
   Custom Tooltip
──────────────────────────────────────────────────────────── */
function ChartTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { name: string; value: number; color: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg" dir="rtl">
            {label && (
                <p className="mb-1.5 text-xs font-semibold text-muted-foreground">
                    {label}
                </p>
            )}
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-sm">
                    <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: p.color }}
                    />
                    <span className="text-muted-foreground">{p.name}:</span>
                    <span className="font-semibold text-foreground">
                        {fmt(p.value)}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Growth Trends Chart
──────────────────────────────────────────────────────────── */
function GrowthChart({
    data,
}: {
    data: ReturnType<typeof mergeMonthly>;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="size-4 text-primary" />
                    النمو خلال ٦ أشهر
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    يقارن هذا الرسم بين معدل إنشاء المبادرات وعدد المشاركات الجديدة
                    وتسجيلات المستخدمين شهرًا بشهر — ارتفاع المنحنيات يعكس تناميًا
                    حقيقيًا في النشاط.
                </p>
            </CardHeader>
            <CardContent className="pt-1">
                <ResponsiveContainer width="100%" height={240}>
                    <AreaChart
                        data={data}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="gInit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.primary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={C.primary} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="gPart" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={C.blue} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="gUser" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={C.amber} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={C.amber} stopOpacity={0.02} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(150 16% 88%)" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11, fill: 'hsl(160 12% 38%)' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'hsl(160 12% 38%)' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="مبادرات"
                            stroke={C.primary}
                            strokeWidth={2}
                            fill="url(#gInit)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="مشاركات"
                            stroke={C.blue}
                            strokeWidth={2}
                            fill="url(#gPart)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="مستخدمون"
                            stroke={C.amber}
                            strokeWidth={2}
                            fill="url(#gUser)"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="mt-3 flex justify-center gap-5" dir="rtl">
                    {[
                        { label: 'مبادرات', color: C.primary },
                        { label: 'مشاركات', color: C.blue },
                        { label: 'مستخدمون', color: C.amber },
                    ].map(({ label, color }) => (
                        <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span
                                className="size-2.5 rounded-full"
                                style={{ background: color }}
                            />
                            {label}
                        </span>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────────────────────
   City Hotspot Chart
──────────────────────────────────────────────────────────── */
function CityHotspotChart({
    data,
}: {
    data: { city: string; مبادرات: number }[];
}) {
    const maxVal = Math.max(...data.map((d) => d.مبادرات), 1);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="size-4 text-primary" />
                    البقع الساخنة — المبادرات بالمحافظات
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    تُظهر كل شريط عدد المبادرات <span className="font-medium text-foreground">المعتمدة</span> لكل محافظة — اللون الأغمق
                    يعني تركيزًا أعلى. استخدم هذه البيانات لتحديد المحافظات التي
                    تحتاج تحفيزًا أو دعمًا إضافيًا.
                </p>
            </CardHeader>
            <CardContent className="pt-1">
                {data.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        لا توجد بيانات
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="hsl(150 16% 88%)"
                            />
                            <XAxis
                                type="number"
                                tick={{ fontSize: 11, fill: 'hsl(160 12% 38%)' }}
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="city"
                                tick={{ fontSize: 12, fill: 'hsl(160 28% 12%)' }}
                                axisLine={false}
                                tickLine={false}
                                width={68}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(152 58% 36% / 0.06)' }} />
                            <Bar
                                dataKey="مبادرات"
                                radius={[0, 6, 6, 0]}
                                maxBarSize={22}
                            >
                                {data.map((entry, i) => {
                                    const intensity = entry.مبادرات / maxVal;
                                    const lightness = Math.round(36 + (1 - intensity) * 30);
                                    return (
                                        <Cell
                                            key={i}
                                            fill={`hsl(152, 58%, ${lightness}%)`}
                                        />
                                    );
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────────────────────
   Status Donut
──────────────────────────────────────────────────────────── */
function StatusDonut({ stats }: { stats: Stats }) {
    const slices = [
        { name: 'معتمدة', value: stats.initiatives_approved, color: C.primary },
        { name: 'بانتظار المراجعة', value: stats.initiatives_pending, color: C.amber },
        { name: 'مرفوضة', value: stats.initiatives_rejected, color: C.red },
    ].filter((s) => s.value > 0);

    const total = stats.initiatives_total;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart2 className="size-4 text-primary" />
                    توزيع حالة المبادرات
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    نسب المبادرات بين معتمدة ومعلّقة ومرفوضة من أصل{' '}
                    <span className="font-medium text-foreground">{fmt(total)}</span>{' '}
                    مبادرة. نسبة القبول المرتفعة تعكس جودة تقديمات المستخدمين.
                </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-1">
                {total === 0 ? (
                    <p className="py-8 text-sm text-muted-foreground">
                        لا توجد بيانات
                    </p>
                ) : (
                    <>
                        <div className="relative">
                            <ResponsiveContainer width={200} height={200}>
                                <PieChart>
                                    <Pie
                                        data={slices}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={88}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {slices.map((s) => (
                                            <Cell key={s.name} fill={s.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (!active || !payload?.length) return null;
                                            const p = payload[0];
                                            const pct = Math.round(
                                                ((p.value as number) / total) * 100,
                                            );
                                            return (
                                                <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg" dir="rtl">
                                                    <p className="text-xs font-semibold text-foreground">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-sm font-bold text-foreground">
                                                        {fmt(p.value as number)}{' '}
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            ({pct}%)
                                                        </span>
                                                    </p>
                                                </div>
                                            );
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* centre label */}
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-foreground">
                                    {fmt(total)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    مبادرة
                                </span>
                            </div>
                        </div>

                        <div className="mt-3 flex flex-col gap-2 w-full px-2" dir="rtl">
                            {slices.map((s) => (
                                <div key={s.name} className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="size-2.5 rounded-full"
                                            style={{ background: s.color }}
                                        />
                                        <span className="text-muted-foreground">
                                            {s.name}
                                        </span>
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {fmt(s.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────────────────────
   Activity Chart (day / week)
──────────────────────────────────────────────────────────── */
type Period = 'day' | 'week';

function ActivityChart({
    daily,
    monthly,
}: {
    daily: Record<string, number>;
    monthly: Record<string, number>;
}) {
    const [period, setPeriod] = useState<Period>('week');

    const dailyData = Object.entries(daily)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ date: dayLabel(k), مبادرات: v }));

    const weeklyData = toWeekly(daily);

    const monthlyData = Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ date: monthLabel(k), مبادرات: v }));

    const data =
        period === 'day'
            ? dailyData
            : period === 'week'
              ? weeklyData.map((d) => ({ date: d.week, مبادرات: d.مبادرات }))
              : monthlyData;

    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3" dir="rtl">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Zap className="size-4 text-primary" />
                            نشاط إنشاء المبادرات
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {period === 'day'
                                ? 'إجمالي المبادرات المُنشأة يوميًا في آخر ٣٠ يومًا — تكشف الأيام ذات الأعمدة المرتفعة عن ذروات النشاط'
                                : period === 'week'
                                  ? 'تجميع أسبوعي لآخر ٤ أسابيع — يُسهّل رؤية الاتجاه العام بعيدًا عن تذبذب الأيام الفردية'
                                  : 'مقارنة شهرية لآخر ٦ أشهر — مفيد لتقييم نمو المنصة على المدى المتوسط'}
                        </p>
                    </div>

                    <div className="flex overflow-hidden rounded-lg border border-border text-xs font-semibold">
                        {(
                            [
                                ['day', 'يوم'],
                                ['week', 'أسبوع'],
                                ['month', 'شهر'],
                            ] as [Period, string][]
                        ).map(([v, label]) => (
                            <button
                                key={v}
                                onClick={() => setPeriod(v)}
                                className={`cursor-pointer px-3 py-1.5 transition-colors ${
                                    period === v
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-1">
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                        data={data}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(150 16% 88%)"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: 'hsl(160 12% 38%)' }}
                            axisLine={false}
                            tickLine={false}
                            interval={period === 'day' ? 4 : 0}
                        />
                        <YAxis
                            tick={{ fontSize: 11, fill: 'hsl(160 12% 38%)' }}
                            axisLine={false}
                            tickLine={false}
                            allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(152 58% 36% / 0.06)' }} />
                        <Bar
                            dataKey="مبادرات"
                            fill={C.primary}
                            radius={[4, 4, 0, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────────────────────
   Top Contributors
──────────────────────────────────────────────────────────── */
function TopContributors({
    contributors,
}: {
    contributors: Props['topContributors'];
}) {
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Trophy className="size-4 text-primary" />
                    أعلى المساهمين نقاطًا
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                    أكثر ٥ مستخدمين نشاطًا بالنقاط المتراكمة من الحضور — يمكن
                    الاستفادة منهم كسفراء للمنصة أو تكريمهم بمكافآت مميزة.
                </p>
            </CardHeader>
            <CardContent>
                {contributors.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                        لا توجد بيانات
                    </p>
                ) : (
                    <ul className="space-y-3" dir="rtl">
                        {contributors.map((c, i) => (
                            <li key={c.username}>
                                <Link
                                    href={showUser(c.username).url}
                                    className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                                        i === 0
                                            ? 'bg-amber-50 hover:bg-amber-100/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/30'
                                            : 'hover:bg-muted/50'
                                    }`}
                                >
                                    <span className="w-6 shrink-0 text-center text-base">
                                        {medals[i] ?? (
                                            <span className="text-sm font-bold text-muted-foreground">
                                                {i + 1}
                                            </span>
                                        )}
                                    </span>
                                    <Avatar className="size-9 border border-border">
                                        <AvatarImage
                                            src={c.avatar_url}
                                            alt={c.username}
                                        />
                                        <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                            {c.username.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-foreground">
                                            {c.username}
                                        </p>
                                        {c.city && (
                                            <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                                                <MapPin className="size-3" />
                                                {cityLabel(c.city)}
                                            </p>
                                        )}
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                                            i === 0
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                                : 'border border-primary/20 bg-primary/8 text-primary'
                                        }`}
                                    >
                                        {fmt(c.points)} نقطة
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}

/* ─────────────────────────────────────────────────────────────
   Page
──────────────────────────────────────────────────────────── */
export default function AdminAnalyticsPage({
    stats,
    initiativesByMonth,
    participationsByMonth,
    usersByMonth,
    initiativesByCity,
    initiativesByDay,
    topContributors,
}: Props) {
    const growthData = mergeMonthly(
        initiativesByMonth,
        participationsByMonth,
        usersByMonth,
    );

    const cityData = Object.entries(initiativesByCity)
        .map(([k, v]) => ({ city: cityLabel(k), مبادرات: v }))
        .sort((a, b) => b.مبادرات - a.مبادرات);

    const approvalRate =
        stats.initiatives_total > 0
            ? Math.round((stats.initiatives_approved / stats.initiatives_total) * 100)
            : 0;

    const redemptionRate =
        stats.rewards_total > 0
            ? Math.round((stats.redemptions_total / stats.rewards_total) * 100)
            : 0;

    return (
        <AdminLayout pageTitle="التحليلات">
            <Head title="التحليلات — الإدارة" />

            <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6" dir="rtl">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                        <BarChart2 className="size-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            التحليلات
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            نظرة شاملة على نشاط المنصة
                        </p>
                    </div>
                </div>

                {/* KPI grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <KpiCard
                        label="إجمالي المستخدمين"
                        value={stats.users_total}
                        sub={`+${fmt(stats.users_this_month)} هذا الشهر`}
                        icon={Users}
                        accent={C.blue}
                    />
                    <KpiCard
                        label="مبادرات معتمدة"
                        value={stats.initiatives_approved}
                        sub={`معدل القبول ${approvalRate}%`}
                        icon={CheckCircle2}
                        accent={C.primary}
                    />
                    <KpiCard
                        label="إجمالي المشاركات"
                        value={stats.participations_total}
                        icon={Zap}
                        accent={C.purple}
                    />
                    <KpiCard
                        label="بانتظار المراجعة"
                        value={stats.initiatives_pending}
                        icon={CircleDashed}
                        accent={C.amber}
                    />
                    <KpiCard
                        label="إجمالي المبادرات"
                        value={stats.initiatives_total}
                        icon={BarChart2}
                        accent={C.primaryLight}
                    />
                    <KpiCard
                        label="مبادرات مرفوضة"
                        value={stats.initiatives_rejected}
                        icon={XCircle}
                        accent={C.red}
                    />
                    <KpiCard
                        label="المكافآت المتاحة"
                        value={stats.rewards_total}
                        icon={Gift}
                        accent={C.amber}
                    />
                    <KpiCard
                        label="عمليات الاسترداد"
                        value={stats.redemptions_total}
                        sub={`معدل الاسترداد ${redemptionRate}%`}
                        icon={Trophy}
                        accent={C.purple}
                    />
                </div>

                {/* Growth trends (full width) */}
                <GrowthChart data={growthData} />

                {/* City hotspot + Status donut */}
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <CityHotspotChart data={cityData} />
                    <StatusDonut stats={stats} />
                </div>

                {/* Activity chart + Top contributors */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <ActivityChart
                        daily={initiativesByDay}
                        monthly={initiativesByMonth}
                    />
                    <TopContributors contributors={topContributors} />
                </div>
            </div>
        </AdminLayout>
    );
}
