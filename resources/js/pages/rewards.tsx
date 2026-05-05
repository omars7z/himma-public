import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronLeft, Gift, LogIn, Trophy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { redeem } from '@/actions/App/Http/Controllers/RewardsController';
import { RewardCoverImage } from '@/components/reward-cover-image';
import { SiteHeader } from '@/components/site-header';
import { collaborations, login, register } from '@/routes';
import { index as initiativesIndex } from '@/routes/initiatives';

/** Latin digits (0–9) for numeric display — consistent with القائمة العامة. */
const formatNumber = (value: number): string =>
    new Intl.NumberFormat('en-US').format(value);

type RewardSummary = {
    id: number;
    title: string;
    description: string | null;
    points_cost: number;
    image_url: string;
};

type PaginatedRewards = {
    data: RewardSummary[];
    links: { prev: string | null; next: string | null };
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
};

function withRewardsGridHash(url: string): string {
    return url.includes('#')
        ? url.replace(/#.*$/, '#rewards-grid')
        : `${url}#rewards-grid`;
}

export default function RewardsCatalogPage({
    rewards,
}: {
    rewards: PaginatedRewards;
}) {
    const { auth, canRegister } = usePage().props;
    const isAuthed = Boolean(auth.user);
    const userPoints = auth.user?.points ?? 0;

    const { data: rewardRows, links, meta } = rewards;
    const [redeemingId, setRedeemingId] = useState<number | null>(null);

    function handleRedeem(rewardId: number) {
        setRedeemingId(rewardId);
        router.post(
            redeem(rewardId).url,
            {},
            {
                preserveScroll: true,
                onFinish: () => setRedeemingId(null),
                onSuccess: () =>
                    toast.success('تم استرداد المكافأة وخصم النقاط من رصيدك.'),
                onError: (errors) => {
                    const raw = errors.reward;
                    const message = Array.isArray(raw)
                        ? (raw[0] ?? 'تعذّر إتمام الاسترداد.')
                        : (raw ?? 'تعذّر إتمام الاسترداد.');
                    toast.error(message);
                },
            },
        );
    }

    return (
        <>
            <Head title="استبدال النقاط — همة" />
            <div
                className="flex min-h-screen flex-col bg-background text-foreground"
                dir="rtl"
            >
                <SiteHeader />
                <main className="flex-1 scroll-mt-20">
                    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-9 px-4 py-12 sm:px-6 sm:py-16">
                        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-10">
                            <div className="flex flex-col justify-center rounded-[var(--radius)] border border-border bg-card p-6 text-right shadow-sm sm:p-8">
                                <div className="text-xs font-semibold text-primary">
                                    المكافآت
                                </div>
                                <h1
                                    className="mt-3 text-[clamp(1.75rem,4vw,2.85rem)] font-extrabold leading-tight tracking-tight text-foreground"
                                >
                                    استبدل نقاطك بمكافآت أوضح وأقرب
                                </h1>
                                <p className="mt-3 max-w-xl text-[0.9375rem] leading-[1.85] font-bold text-muted-foreground sm:text-base">
                                    نقاطك تعكس تأثيرك، واستبدالها يصير من مكان
                                    واحد واضح ومرتب مع متابعة مباشرة لرصيدك
                                    الحالي.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={initiativesIndex()}
                                        className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                                    >
                                        اكسب نقاط الآن
                                    </Link>
                                    <Link
                                        href={collaborations()}
                                        className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                                    >
                                        اعرف كيف تعمل المنصة
                                    </Link>
                                    {!isAuthed && canRegister ? (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-md border border-border bg-secondary/80 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                                        >
                                            أنشئ حسابًا
                                        </Link>
                                    ) : null}
                                </div>
                                <div
                                    className="mt-5 inline-flex w-fit flex-col rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-xs font-semibold leading-relaxed text-muted-foreground shadow-sm max-sm:max-w-full"
                                    style={{
                                        boxShadow:
                                            '0 10px 24px hsl(var(--primary) / 0.06)',
                                    }}
                                >
                                    <span className="text-muted-foreground">
                                        رصيدك الحالي
                                    </span>
                                    {isAuthed ? (
                                        <span className="mt-1 tabular-nums text-base font-black text-primary">
                                            {formatNumber(userPoints)} نقطة
                                        </span>
                                    ) : (
                                        <span className="mt-1 text-[0.8rem] font-bold">
                                            سجّل الدخول لعرض الرصيد والاستبدال —
                                            <Link
                                                href={login()}
                                                className="ms-1 text-primary underline underline-offset-2 hover:opacity-90"
                                            >
                                                تسجيل الدخول
                                            </Link>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="relative isolate min-h-[260px] overflow-hidden rounded-3xl border border-border bg-card p-6 sm:min-h-[300px] sm:p-8">
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(var(--primary)/0.12),transparent_55%),radial-gradient(ellipse_at_75%_80%,hsl(var(--initiative-highlight)/0.1),transparent_50%)]"
                                />
                                <div
                                    aria-hidden
                                    className="absolute top-1/2 left-1/2 size-[min(100%,380px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15 sm:size-[340px]"
                                />
                                <div
                                    aria-hidden
                                    className="absolute top-1/2 left-1/2 size-[min(88%,280px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 sm:size-[260px]"
                                />

                                <span className="absolute start-[10%] top-[14%] rounded-full border border-border bg-background/92 px-2.5 py-1 text-[0.72rem] font-bold text-foreground shadow-sm backdrop-blur-sm sm:text-xs">
                                    رصيدك
                                </span>
                                <span className="absolute end-[12%] top-[22%] rounded-full border border-border bg-background/92 px-2.5 py-1 text-[0.72rem] font-bold text-primary shadow-sm backdrop-blur-sm sm:text-xs">
                                    مكافآت
                                </span>
                                <span className="absolute bottom-[18%] start-[14%] rounded-full border border-border bg-background/92 px-2.5 py-1 text-[0.72rem] font-bold text-muted-foreground shadow-sm backdrop-blur-sm sm:text-xs">
                                    شركاء
                                </span>

                                <div className="relative z-10 mx-auto flex max-w-[17.5rem] flex-col gap-2 rounded-[1.15rem] border border-primary/15 bg-muted/85 p-5 text-center shadow-md backdrop-blur-sm sm:p-6">
                                    <strong className="text-sm font-extrabold text-foreground">
                                        رصيدك الحالي
                                    </strong>
                                    {isAuthed ? (
                                        <span className="text-[0.8rem] leading-relaxed font-bold text-muted-foreground">
                                            <span className="tabular-nums text-lg font-black text-primary">
                                                {formatNumber(userPoints)}
                                            </span>{' '}
                                            نقطة جاهزة للاستخدام داخل صفحة
                                            المكافآت.
                                        </span>
                                    ) : (
                                        <span className="text-[0.8rem] leading-relaxed font-bold text-muted-foreground">
                                            سجّل الدخول لمتابعة رصيدك واستبدال
                                            المكافآت من هنا.
                                        </span>
                                    )}
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
                                    من خلال مشاركاتك الموثقة وحضورك داخل
                                    المبادرات المعتمدة.
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
                                    تحوّل نشاطك إلى مكافآت واضحة من شركاء
                                    المنصة في مكان واحد.
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
                                    عند ظهور مكافأة مناسبة لاحتياجك الحالي
                                    تستطيع استبدالها مباشرة.
                                </span>
                            </article>
                        </div>

                        <section
                            className="scroll-mt-24 rounded-[var(--radius)] border border-border bg-card p-4 shadow-sm sm:p-6 lg:mx-auto lg:max-w-[1120px]"
                            aria-labelledby="rewards-grid-heading"
                        >
                            <div className="mb-6 max-w-none text-right">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary/70 px-3 py-1 text-xs font-bold text-primary">
                                    <Gift className="size-3.5" />
                                    المتجر
                                </span>
                                <h2
                                    id="rewards-grid-heading"
                                    className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl"
                                >
                                    المكافآت المتاحة
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed font-bold text-muted-foreground sm:text-base">
                                    استبدل نقاطك بواحدة من هذه المكافآت داخل
                                    تجربة أوضح ومنظمة مثل باقي صفحات المنصة.
                                </p>
                            </div>

                            {meta.total === 0 ? (
                                <div className="grid min-h-[9rem] place-items-center rounded-[1.35rem] border border-dashed border-border bg-muted/35 p-6 text-center shadow-sm">
                                    <div>
                                        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                                            <Gift className="size-6" />
                                        </span>
                                        <p className="mt-3 text-base font-bold text-foreground">
                                            لا توجد مكافآت متاحة حاليًا
                                        </p>
                                        <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-muted-foreground">
                                            نعمل مع شركائنا لإضافة عروض جديدة
                                            قريبًا.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <ul
                                    id="rewards-grid"
                                    className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                >
                                    {rewardRows.map((reward) => {
                                        const canAfford =
                                            userPoints >= reward.points_cost;
                                        const busy = redeemingId === reward.id;

                                        return (
                                            <li key={reward.id}>
                                                <article className="flex h-full translate-y-0 flex-col overflow-hidden rounded-[1.35rem] border border-border bg-card/95 shadow-[0_16px_34px_rgba(23,57,51,0.08)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_22px_42px_rgba(23,57,51,0.11)]">
                                                    <div className="relative aspect-4/3 overflow-hidden bg-muted">
                                                        <RewardCoverImage
                                                            src={
                                                                reward.image_url
                                                            }
                                                            alt={reward.title}
                                                        />
                                                        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-foreground/35 via-transparent to-transparent" />
                                                        <span className="absolute inset-e-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-bold text-foreground shadow-sm backdrop-blur-sm">
                                                            <Trophy className="size-3 text-primary" />
                                                            {formatNumber(
                                                                reward.points_cost,
                                                            )}{' '}
                                                            نقطة
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-1 flex-col p-4 text-right">
                                                        <h3 className="text-base font-bold leading-snug text-foreground">
                                                            {reward.title}
                                                        </h3>
                                                        {reward.description ? (
                                                            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-relaxed text-muted-foreground">
                                                                {
                                                                    reward.description
                                                                }
                                                            </p>
                                                        ) : null}
                                                        <div className="mt-auto pt-4">
                                                            {isAuthed ? (
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        !canAfford ||
                                                                        busy
                                                                    }
                                                                    onClick={() =>
                                                                        handleRedeem(
                                                                            reward.id,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                                                                >
                                                                    {busy ? (
                                                                        <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                                                                    ) : null}
                                                                    استرداد
                                                                </button>
                                                            ) : (
                                                                <Link
                                                                    href={login()}
                                                                    className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                                                                >
                                                                    <LogIn className="size-4" />
                                                                    سجّل الدخول
                                                                    للاسترداد
                                                                </Link>
                                                            )}
                                                            {isAuthed &&
                                                            !canAfford ? (
                                                                <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
                                                                    تحتاج{' '}
                                                                    {formatNumber(
                                                                        reward.points_cost -
                                                                            userPoints,
                                                                    )}{' '}
                                                                    نقطة
                                                                    إضافية
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </article>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}

                            {meta.total > 0 && meta.last_page > 1 ? (
                                <nav
                                    className="mt-10 flex flex-col items-center gap-4 border-t border-border pt-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6"
                                    aria-label="ترقيم صفحات المكافآت"
                                >
                                    {links.prev ? (
                                        <Link
                                            href={withRewardsGridHash(
                                                links.prev,
                                            )}
                                            preserveScroll={false}
                                            className="inline-flex min-w-28 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                                        >
                                            السابق
                                        </Link>
                                    ) : (
                                        <span className="inline-flex min-w-28 cursor-not-allowed items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground opacity-40">
                                            السابق
                                        </span>
                                    )}

                                    <p className="text-center text-sm text-muted-foreground">
                                        <span className="font-semibold tabular-nums text-foreground">
                                            صفحة{' '}
                                            {formatNumber(meta.current_page)}{' '}
                                            من {formatNumber(meta.last_page)}
                                        </span>
                                        {meta.from !== null &&
                                        meta.to !== null ? (
                                            <span className="mt-1 block text-xs tabular-nums">
                                                عرض{' '}
                                                {formatNumber(meta.from)}–
                                                {formatNumber(meta.to)} من{' '}
                                                {formatNumber(meta.total)}
                                            </span>
                                        ) : null}
                                    </p>

                                    {links.next ? (
                                        <Link
                                            href={withRewardsGridHash(
                                                links.next,
                                            )}
                                            preserveScroll={false}
                                            className="inline-flex min-w-28 items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
                                        >
                                            التالي
                                        </Link>
                                    ) : (
                                        <span className="inline-flex min-w-28 cursor-not-allowed items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-semibold text-muted-foreground opacity-40">
                                            التالي
                                        </span>
                                    )}
                                </nav>
                            ) : null}
                        </section>
                    </div>
                </main>
                <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} همة. كل الحقوق محفوظة.
                </footer>
            </div>
        </>
    );
}
