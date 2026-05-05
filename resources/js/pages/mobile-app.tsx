import { Head } from '@inertiajs/react';
import { Apple, Bell, Smartphone, Star, Zap } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';

const FEATURES = [
    {
        icon: Zap,
        title: 'تسجيل سريع',
        description: 'انضم للمبادرات وتابع نقاطك بنقرة واحدة من أي مكان.',
    },
    {
        icon: Bell,
        title: 'إشعارات فورية',
        description: 'لا تفوّت أي مبادرة — نُعلمك فور بدء التسجيل.',
    },
    {
        icon: Star,
        title: 'تجربة مخصصة',
        description: 'اقتراحات مبادرات حسب اهتماماتك وموقعك في الأردن.',
    },
    {
        icon: Smartphone,
        title: 'متاح دون إنترنت',
        description: 'اطّلع على تفاصيل مبادراتك حتى بدون اتصال.',
    },
];

function PhoneMockup() {
    return (
        <div className="relative mx-auto w-56 sm:w-64" aria-hidden="true">
            <div className="relative rounded-[2.8rem] border-4 border-foreground/10 bg-card shadow-2xl ring-1 ring-primary/10">
                <div className="absolute top-0 left-1/2 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-foreground/8" />
                <div className="flex min-h-[500px] flex-col overflow-hidden rounded-[2.4rem] bg-linear-to-b from-primary/20 via-background to-background px-4 pb-6 pt-10">
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                            <span className="h-2 w-3 rounded-sm bg-foreground/30" />
                            <span className="h-2 w-1 rounded-sm bg-foreground/20" />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-2 text-center">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                            <Smartphone className="size-6" />
                        </span>
                        <p className="text-base font-black tracking-tight text-foreground">
                            همة
                        </p>
                    </div>

                    <div className="mt-6 space-y-2.5">
                        {[
                            { label: 'مبادرات قريبة منك', color: 'bg-primary/15' },
                            { label: 'نقاطك: ١٢٠ نقطة', color: 'bg-secondary' },
                            { label: 'مبادرة تشجير — الزرقاء', color: 'bg-accent' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className={`rounded-xl ${item.color} px-3 py-2.5`}
                            >
                                <p className="text-xs font-semibold text-foreground">
                                    {item.label}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto rounded-2xl bg-primary px-3 py-2.5 text-center">
                        <p className="text-xs font-bold text-primary-foreground">
                            انضم الآن
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-1.5 left-1/2 h-1 w-20 -translate-x-1/2 rounded-full bg-foreground/15" />
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-[2.8rem] bg-linear-to-t from-background/10 via-transparent to-transparent" />
        </div>
    );
}

export default function MobileApp() {
    return (
        <>
            <Head title="تطبيق همة — قريباً" />
            <div
                className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground"
                dir="rtl"
            >
                <SiteHeader />

                <main className="relative flex flex-1 flex-col">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_65%)]" />

                    {/* Hero */}
                    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:pt-24">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="space-y-8">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                                    <Smartphone className="size-4" />
                                    قريباً على متجر التطبيقات
                                </div>

                                <div className="space-y-5">
                                    <h1 className="max-w-xl text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                        همة في جيبك،
                                        <br />
                                        <span className="text-primary">
                                            في كل مكان
                                        </span>
                                    </h1>
                                    <p className="max-w-lg text-lg leading-9 text-muted-foreground">
                                        نعمل على تطبيق همة لأجهزة Android وiOS
                                        — ليتمكن كل متطوع من المشاركة وتتبّع
                                        نقاطه وإدارة مبادراته بسهولة تامة من
                                        هاتفه.
                                    </p>
                                </div>

                                {/* Store Badges */}
                                <div className="flex flex-wrap gap-3">
                                    <div
                                        className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 opacity-60 shadow-sm"
                                        title="قريباً"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="size-7 shrink-0 fill-foreground"
                                            aria-hidden="true"
                                        >
                                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                                        </svg>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">
                                                قريباً على
                                            </p>
                                            <p className="text-sm font-bold text-foreground">
                                                App Store
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className="flex cursor-not-allowed items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 opacity-60 shadow-sm"
                                        title="قريباً"
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="size-7 shrink-0 fill-foreground"
                                            aria-hidden="true"
                                        >
                                            <path d="M3.18 23.76c.3.17.64.22.98.14l12.08-6.98-2.5-2.5-10.56 9.34zM.32 1.1C.12 1.42 0 1.83 0 2.33v19.34c0 .5.12.91.32 1.23l.07.06 10.83-10.83v-.26L.38 1.04l-.06.06zM20.33 10.22l-2.89-1.67-2.8 2.8 2.8 2.8 2.91-1.68c.83-.48.83-1.27-.02-1.75zM4.16.24L16.25 7.2l-2.5 2.5L3.18.36C3.49.2 3.87.25 4.16.44z" />
                                        </svg>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">
                                                قريباً على
                                            </p>
                                            <p className="text-sm font-bold text-foreground">
                                                Google Play
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notify CTA */}
                                <div className="rounded-3xl border border-primary/20 bg-primary/8 p-5">
                                    <p className="mb-3 text-sm font-semibold text-foreground">
                                        أبلغني عند الإطلاق
                                    </p>
                                    <form
                                        className="flex gap-2"
                                        onSubmit={(e) => e.preventDefault()}
                                        dir="ltr"
                                    >
                                        <input
                                            type="email"
                                            placeholder="بريدك الإلكتروني"
                                            dir="rtl"
                                            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                                        />
                                        <button
                                            type="submit"
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                                        >
                                            <Bell className="size-4" />
                                            أبلغني
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Phone mockup */}
                            <div className="hidden justify-center lg:flex">
                                <div className="relative z-10">
                                    <img
                                        alt=""
                                        src="/images/himma/community-cleanup-hills.jpg"
                                        loading="lazy"
                                        decoding="async"
                                        className="pointer-events-none absolute inset-y-10 -start-24 z-0 h-[min(100%,380px)] w-56 rounded-3xl object-cover opacity-[0.28] shadow-xl ring-1 ring-primary/20"
                                    />
                                    <div className="absolute -inset-8 z-1 rounded-full bg-primary/8 blur-3xl" />
                                    <div className="relative z-2">
                                    <PhoneMockup />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="relative z-10 bg-card/50 border-y border-border">
                        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
                            <div className="mb-10 text-center">
                                <p className="text-sm font-bold tracking-widest text-primary uppercase">
                                    ما ستجده في التطبيق
                                </p>
                                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                                    تجربة تطوع متكاملة
                                </h2>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {FEATURES.map((feature) => {
                                    const Icon = feature.icon;

                                    return (
                                        <div
                                            key={feature.title}
                                            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
                                        >
                                            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                                <Icon className="size-6" />
                                            </span>
                                            <h3 className="mt-4 text-base font-black text-foreground">
                                                {feature.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* Platform strip */}
                    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-foreground/6 ring-1 ring-border">
                                    <Apple className="size-8 text-foreground/70" />
                                </span>
                                <div>
                                    <p className="text-base font-black text-foreground">
                                        iOS — iPhone & iPad
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        يتطلب iOS 16 أو أحدث
                                    </p>
                                    <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                        قريباً
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-foreground/6 ring-1 ring-border">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="size-8 fill-foreground/70"
                                        aria-hidden="true"
                                    >
                                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4483-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4483.9993.9993 0 .5511-.4483.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.2439 13.8533 7.8508 12 7.8508s-3.5902.3931-5.1367 1.0989L4.841 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3435-4.1021-2.6892-7.5743-6.1185-9.4396" />
                                    </svg>
                                </span>
                                <div>
                                    <p className="text-base font-black text-foreground">
                                        Android
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        يتطلب Android 8.0 أو أحدث
                                    </p>
                                    <span className="mt-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                        قريباً
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} همة. كل الحقوق محفوظة.
                </footer>
            </div>
        </>
    );
}
