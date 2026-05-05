import { Link, usePage } from '@inertiajs/react';
import { Award, Leaf, MapPin, Sparkles, Users } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const features = [
    { icon: Sparkles, label: 'مبادرات مجتمعية فعّالة تُحدث فرقاً حقيقياً' },
    { icon: Users, label: 'تواصل مع مئات المتطوعين في مجتمعك' },
    { icon: MapPin, label: 'مشاريع محلية قريبة منك دائماً' },
    { icon: Award, label: 'اكسب مكافآت على كل مساهمة' },
];

const stats = [
    { value: '+120', label: 'مبادرة نشطة' },
    { value: '+800', label: 'متطوع' },
    { value: '12', label: 'مدينة' },
];

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="grid min-h-dvh lg:grid-cols-2">
            {/* ===== اللوحة اليسرى - الهيرو ===== */}
            <div className="relative hidden overflow-hidden lg:flex lg:flex-col">
                <img
                    alt=""
                    src="/images/himma/community-food-service.jpg"
                    className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 z-1 bg-linear-to-br from-[hsl(152_65%_18%)]/92 via-[hsl(160_55%_12%)]/90 to-[hsl(152_60%_7%)]/95"
                />
                {/* زخارف خلفية */}
                <div className="absolute -top-40 -left-40 z-2 h-112 w-md rounded-full bg-white/5 blur-3xl" />
                <div className="absolute top-1/2 -right-28 z-2 h-80 w-80 rounded-full bg-white/[0.07] blur-2xl" />
                <div className="absolute -bottom-28 left-1/3 z-2 h-96 w-96 rounded-full bg-[hsl(95,42%,44%)]/20 blur-3xl" />

                {/* أيقونة ورقة مائية ضخمة */}
                <Leaf
                    className="absolute right-4 -bottom-6 z-2 h-72 w-72 rotate-12 text-white/4"
                    strokeWidth={0.75}
                />

                <div className="relative z-10 flex flex-1 flex-col justify-between p-12">
                    {/* الشعار العلوي */}
                    <Link
                        href={home()}
                        className="flex w-fit items-center gap-3 text-white/80 transition-colors hover:text-white"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                            <Leaf
                                className="h-5 w-5 text-white"
                                strokeWidth={1.75}
                            />
                        </div>
                        <span className="text-xl font-bold tracking-wide">
                            {name}
                        </span>
                    </Link>

                    {/* المحتوى الرئيسي */}
                    <div className="space-y-10" dir="rtl">
                        <div className="space-y-5">
                            {/* شارة حيّة */}
                            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/75 backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(95,60%,65%)] opacity-75" />
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[hsl(95,60%,65%)]" />
                                </span>
                                منصة حيّة ومتنامية
                            </div>

                            <h2 className="text-[2.6rem] leading-[1.15] font-black text-white">
                                كن جزءاً من
                                <br />
                                <span className="text-[hsl(95,62%,70%)]">
                                    التغيير الحقيقي
                                </span>
                            </h2>

                            <p className="max-w-xs text-lg leading-relaxed text-white/60">
                                همّة تربطك بمبادرات مجتمعية تستحق وقتك وطاقتك.
                            </p>
                        </div>

                        {/* قائمة المميزات */}
                        <div className="space-y-2.5">
                            {features.map(({ icon: Icon, label }) => (
                                <div
                                    key={label}
                                    className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.07] px-4 py-3 backdrop-blur-sm"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(95,42%,38%)]/40">
                                        <Icon
                                            className="h-4 w-4 text-[hsl(95,62%,72%)]"
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <span className="text-sm leading-snug text-white/75">
                                        {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* الإحصائيات السفلية */}
                    <div
                        className="flex gap-8 border-t border-white/10 pt-6"
                        dir="rtl"
                    >
                        {stats.map(({ value, label }) => (
                            <div key={label} className="space-y-0.5">
                                <div className="text-2xl font-bold text-white tabular-nums">
                                    {value}
                                </div>
                                <div className="text-xs text-white/45">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ===== اللوحة اليمنى - النموذج ===== */}
            <div className="flex flex-col bg-background">
                <SiteHeader />

                {/* محتوى النموذج */}
                <div className="flex flex-1 items-start justify-center overflow-y-auto px-6 py-8 md:px-10">
                    <div className="w-full max-w-sm space-y-6 pb-10">
                        {(title || description) && (
                            <div className="space-y-1 text-right" dir="rtl">
                                {title && (
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
