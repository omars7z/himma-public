import { useGSAP } from '@gsap/react';
import { Head } from '@inertiajs/react';
import gsap from 'gsap';
import {
    Banknote,
    BarChart3,
    BookOpenCheck,
    Building2,
    Factory,
    GraduationCap,
    Handshake,
    HeartHandshake,
    Landmark,
    Leaf,
    LibraryBig,
    MapPin,
    Palette,
    Rocket,
    ShieldCheck,
    Sparkles,
    TreePine,
    Users,
    Wifi,
} from 'lucide-react';
import { useRef } from 'react';
import { SiteHeader } from '@/components/site-header';

gsap.registerPlugin(useGSAP);

type Collaborator = {
    id: number;
    name: string;
    description: string | null;
    website_url: string | null;
    logo_url: string | null;
};

type Section = {
    sector: string;
    label: string;
    collaborators: Collaborator[];
};

type DisplayCollaborator = Collaborator & {
    area: string;
    badge: string;
    impact: string;
};

type DisplaySection = {
    sector: string;
    label: string;
    kicker: string;
    summary: string;
    metric: string;
    collaborators: DisplayCollaborator[];
};

const SECTOR_LABELS: Record<string, string> = {
    university: 'الجامعات الأردنية',
    government: 'الشركاء الحكوميون',
    public_sector: 'القطاع العام',
    private_sector: 'القطاع الخاص',
    b2b: 'شراكات الأعمال',
};

const SECTION_COPY: Record<
    string,
    Pick<DisplaySection, 'kicker' | 'summary' | 'metric'>
> = {
    university: {
        kicker: 'Campus network',
        summary:
            'مساحات تعاون مع جامعات أردنية لتفعيل الطلبة داخل المبادرات المجتمعية والبحثية.',
        metric: 'حرم جامعي متصل',
    },
    government: {
        kicker: 'National alignment',
        summary:
            'جهات وطنية تساعد على ربط المبادرات بالاحتياجات المحلية ومسارات الخدمة العامة.',
        metric: 'مسار خدمة وطني',
    },
    public_sector: {
        kicker: 'Civic reach',
        summary:
            'مؤسسات عامة وبلديات ومراكز مجتمعية تفتح أبوابها للمتطوعين والمبادرات.',
        metric: 'قناة وصول مجتمعي',
    },
    private_sector: {
        kicker: 'Shared value',
        summary:
            'شركات محلية تدعم المبادرات عبر الرعاية، الخبرات، والمساحات التشغيلية.',
        metric: 'فرصة دعم وتشغيل',
    },
    b2b: {
        kicker: 'Partner ecosystem',
        summary:
            'مزودو خدمات ومنصات أعمال تساعد همة على التوسع بعمليات وشراكات أكثر نضجاً.',
        metric: 'حل تكاملي للشركاء',
    },
};

const FALLBACK_SECTIONS: DisplaySection[] = [
    {
        sector: 'university',
        label: 'الجامعات الأردنية',
        ...SECTION_COPY.university,
        collaborators: [
            {
                id: 101,
                name: 'الجامعة الأردنية',
                description:
                    'حاضنة طلابية للمبادرات البحثية والتطوعية في عمّان.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'جامعة رسمية',
                impact: 'فرق تطوع طلابية',
            },
            {
                id: 102,
                name: 'جامعة اليرموك',
                description:
                    'شريك تعليمي لتوسيع المشاركة الشبابية في شمال الأردن.',
                website_url: null,
                logo_url: null,
                area: 'إربد',
                badge: 'جامعة رسمية',
                impact: 'برامج خدمة مجتمع',
            },
            {
                id: 103,
                name: 'جامعة العلوم والتكنولوجيا الأردنية',
                description: 'مسار جامعي للمبادرات التقنية والصحية ذات الأثر.',
                website_url: null,
                logo_url: null,
                area: 'الرمثا',
                badge: 'جامعة رسمية',
                impact: 'مبادرات تقنية وصحية',
            },
            {
                id: 104,
                name: 'جامعة مؤتة',
                description: 'شبكة طلبة ومرشدين للمبادرات في محافظات الجنوب.',
                website_url: null,
                logo_url: null,
                area: 'الكرك',
                badge: 'جامعة رسمية',
                impact: 'وصول لمحافظات الجنوب',
            },
            {
                id: 105,
                name: 'الجامعة الهاشمية',
                description:
                    'تعاون طلابي في المبادرات البيئية والصحية والمجتمعية.',
                website_url: null,
                logo_url: null,
                area: 'الزرقاء',
                badge: 'جامعة رسمية',
                impact: 'مجموعات طلابية نشطة',
            },
            {
                id: 106,
                name: 'جامعة البلقاء التطبيقية',
                description:
                    'مظلة تطبيقية تربط المهارات المهنية بالعمل التطوعي.',
                website_url: null,
                logo_url: null,
                area: 'السلط',
                badge: 'جامعة تطبيقية',
                impact: 'مهارات ميدانية',
            },
        ],
    },
    {
        sector: 'government',
        label: 'الشركاء الحكوميون',
        ...SECTION_COPY.government,
        collaborators: [
            {
                id: 201,
                name: 'وزارة الشباب',
                description: 'تنسيق فرص شبابية ومراكز نشاط في مختلف المحافظات.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'جهة وطنية',
                impact: 'فرص للشباب',
            },
            {
                id: 202,
                name: 'وزارة البيئة',
                description: 'دعم مبادرات التشجير والنظافة والتوعية البيئية.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'استدامة',
                impact: 'مبادرات خضراء',
            },
            {
                id: 203,
                name: 'وزارة التنمية الاجتماعية',
                description:
                    'ربط المبادرات بالفئات والمراكز المجتمعية الأكثر احتياجاً.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'أثر اجتماعي',
                impact: 'وصول للفئات المستهدفة',
            },
            {
                id: 204,
                name: 'أمانة عمّان الكبرى',
                description:
                    'مساحات حضرية ومجتمعية لأنشطة التطوع داخل العاصمة.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'مدينة',
                impact: 'تنفيذ ميداني',
            },
        ],
    },
    {
        sector: 'public_sector',
        label: 'القطاع العام',
        ...SECTION_COPY.public_sector,
        collaborators: [
            {
                id: 301,
                name: 'مركز زها الثقافي',
                description:
                    'برامج للأطفال واليافعين ومساحات آمنة للأنشطة التطوعية.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'ثقافة ومجتمع',
                impact: 'أنشطة يافعين',
            },
            {
                id: 302,
                name: 'مكتبة شومان العامة',
                description:
                    'مساحة معرفة تستضيف ورش القراءة والتعليم المجتمعي.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'معرفة',
                impact: 'ورش تعليمية',
            },
            {
                id: 303,
                name: 'بلدية إربد الكبرى',
                description:
                    'نقاط تنفيذ محلية للمبادرات البيئية والخدمية في الشمال.',
                website_url: null,
                logo_url: null,
                area: 'إربد',
                badge: 'بلدية',
                impact: 'حملات محلية',
            },
            {
                id: 304,
                name: 'مراكز الأميرة بسمة',
                description: 'شبكة مجتمعية تساعد على وصول المبادرات للأحياء.',
                website_url: null,
                logo_url: null,
                area: 'محافظات',
                badge: 'مراكز مجتمعية',
                impact: 'انتشار محلي',
            },
        ],
    },
    {
        sector: 'private_sector',
        label: 'القطاع الخاص',
        ...SECTION_COPY.private_sector,
        collaborators: [
            {
                id: 401,
                name: 'زين الأردن',
                description:
                    'دعم تقني ومجتمعي للمبادرات الشبابية واسعة الوصول.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'اتصالات',
                impact: 'دعم رقمي',
            },
            {
                id: 402,
                name: 'أمنية',
                description: 'شراكة في التمكين الرقمي والمسؤولية المجتمعية.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'اتصالات',
                impact: 'تمكين رقمي',
            },
            {
                id: 403,
                name: 'البنك العربي',
                description:
                    'مسارات دعم للمبادرات المالية والتعليمية والمجتمعية.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'مصارف',
                impact: 'رعاية مجتمعية',
            },
            {
                id: 404,
                name: 'مجموعة المناصير',
                description: 'إسناد لوجستي ورعاية لأنشطة ميدانية في المحافظات.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'صناعة وخدمات',
                impact: 'دعم تشغيلي',
            },
        ],
    },
    {
        sector: 'b2b',
        label: 'شراكات الأعمال',
        ...SECTION_COPY.b2b,
        collaborators: [
            {
                id: 501,
                name: 'مسرّعة أعمال أردنية',
                description:
                    'إرشاد ونمذجة تشغيلية لتحويل المبادرات إلى برامج قابلة للتوسع.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'نمو أعمال',
                impact: 'إرشاد وشبكات',
            },
            {
                id: 502,
                name: 'مزود حلول دفع محلي',
                description:
                    'تجربة نقاط ومكافآت أكثر سلاسة للشركاء والمشاركين.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'Fintech',
                impact: 'تكامل نقاط',
            },
            {
                id: 503,
                name: 'وكالة تجربة رقمية',
                description: 'تصميم حملات رقمية للشركاء وواجهات تسجيل أفضل.',
                website_url: null,
                logo_url: null,
                area: 'عمّان',
                badge: 'تجربة رقمية',
                impact: 'حملات وشاشات',
            },
            {
                id: 504,
                name: 'شركة بيانات مجتمعية',
                description:
                    'لوحات قياس أثر تساعد الشركاء على رؤية نتائج المبادرات.',
                website_url: null,
                logo_url: null,
                area: 'الأردن',
                badge: 'بيانات',
                impact: 'تقارير أثر',
            },
        ],
    },
];

const ICONS = [GraduationCap, Landmark, Users, Building2, Handshake];

const COLLABORATOR_ICONS = {
    university: [
        GraduationCap,
        BookOpenCheck,
        ShieldCheck,
        Landmark,
        TreePine,
        LibraryBig,
    ],
    government: [Landmark, Leaf, HeartHandshake, Building2],
    public_sector: [Users, LibraryBig, Building2, HeartHandshake],
    private_sector: [Wifi, Wifi, Banknote, Factory],
    b2b: [Rocket, Banknote, Palette, BarChart3],
};

const getCollaboratorIcon = (sector: string, index: number) => {
    const icons =
        COLLABORATOR_ICONS[sector as keyof typeof COLLABORATOR_ICONS] ?? ICONS;

    return icons[index % icons.length];
};

const getSectionCopy = (
    sector: string,
): Pick<DisplaySection, 'kicker' | 'summary' | 'metric'> =>
    SECTION_COPY[sector] ?? {
        kicker: 'Collaborative network',
        summary:
            'شركاء يساعدون همة على بناء شبكة مبادرات أكثر اتساعاً وتأثيراً.',
        metric: 'شريك جاهز للتفعيل',
    };

const getFallbackSection = (sector: string): DisplaySection | undefined =>
    FALLBACK_SECTIONS.find((section) => section.sector === sector);

const toDisplayCollaborator = (
    collaborator: Collaborator,
    sector: string,
    index: number,
): DisplayCollaborator => ({
    ...collaborator,
    area: getFallbackSection(sector)?.collaborators[index]?.area ?? 'الأردن',
    badge: getFallbackSection(sector)?.collaborators[index]?.badge ?? 'شريك',
    impact:
        getFallbackSection(sector)?.collaborators[index]?.impact ??
        'تعاون قابل للتفعيل',
});

const buildDisplaySections = (sections: Section[]): DisplaySection[] => {
    const source = sections.length > 0 ? sections : FALLBACK_SECTIONS;

    return source.map((section) => {
        const fallback = getFallbackSection(section.sector);
        const collaborators =
            section.collaborators.length > 0
                ? section.collaborators.map((collaborator, index) =>
                      toDisplayCollaborator(
                          collaborator,
                          section.sector,
                          index,
                      ),
                  )
                : (fallback?.collaborators ?? []);

        return {
            sector: section.sector,
            label: SECTOR_LABELS[section.sector] ?? section.label,
            ...getSectionCopy(section.sector),
            collaborators,
        };
    });
};

function InfiniteLogoRail({
    section,
    index,
}: {
    section: DisplaySection;
    index: number;
}) {
    const railRef = useRef<HTMLDivElement>(null);
    const Icon = ICONS[index % ICONS.length];
    const repeatedCollaborators = [
        ...section.collaborators,
        ...section.collaborators,
    ];
    const reverse = index % 2 === 1;

    useGSAP(
        () => {
            const rail = railRef.current;

            if (!rail) {
                return;
            }

            let tween: gsap.core.Tween | undefined;

            const stop = (): void => {
                tween?.kill();
                tween = undefined;
            };

            const sync = (): void => {
                stop();

                if (
                    window.matchMedia('(prefers-reduced-motion: reduce)')
                        .matches
                ) {
                    gsap.set(rail, { x: 0, clearProps: 'willChange' });

                    return;
                }

                const halfWidth = rail.scrollWidth / 2;

                if (halfWidth <= 0) {
                    return;
                }

                gsap.set(rail, {
                    x: reverse ? -halfWidth : 0,
                    willChange: 'transform',
                });

                tween = gsap.to(rail, {
                    x: reverse ? 0 : -halfWidth,
                    duration: 18 + index * 1.5,
                    ease: 'none',
                    repeat: -1,
                });
            };

            requestAnimationFrame(() => {
                sync();
            });

            const resizeObserver = new ResizeObserver(() => {
                sync();
            });

            resizeObserver.observe(rail);

            return () => {
                resizeObserver.disconnect();
                stop();
                gsap.set(rail, { clearProps: 'transform,willChange' });
            };
        },
        {
            dependencies: [index, reverse, section.collaborators.length],
            revertOnUpdate: true,
        },
    );

    return (
        <section className="overflow-hidden rounded-4xl border border-border bg-card/80 shadow-sm ring-1 ring-primary/5 backdrop-blur">
            <div className="grid gap-6 p-6 md:grid-cols-[0.9fr_1.4fr] md:p-8">
                <div className="flex flex-col justify-between gap-8">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                <Icon className="size-6" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                                    {section.kicker}
                                </p>
                                <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    {section.label}
                                </h2>
                            </div>
                        </div>

                        <p className="max-w-md text-base leading-8 text-muted-foreground">
                            {section.summary}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-border bg-background/80 p-4">
                            <p className="text-3xl font-black text-primary">
                                {section.collaborators.length}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                شريك افتراضي
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-secondary/70 p-4">
                            <p className="text-sm font-bold text-secondary-foreground">
                                {section.metric}
                            </p>
                            <p className="mt-2 text-xs leading-6 text-muted-foreground">
                                قابل للاستبدال ببيانات الشركاء الفعلية
                            </p>
                        </div>
                    </div>
                </div>

                <div
                    className="relative min-w-0 overflow-hidden rounded-3xl border border-border bg-background/70 py-5"
                    dir="ltr"
                >
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-background/95 to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-background/95 to-transparent" />

                    <div
                        ref={railRef}
                        className="flex w-max flex-row gap-4 will-change-transform"
                        aria-label={`${section.label} المتعاونون`}
                    >
                        {repeatedCollaborators.map(
                            (collaborator, collaboratorIndex) => {
                                const CollaboratorIcon = getCollaboratorIcon(
                                    section.sector,
                                    collaboratorIndex,
                                );

                                return (
                                    <article
                                        key={`${section.sector}-${collaborator.id}-${collaboratorIndex}`}
                                        className="group flex w-72 shrink-0 flex-col justify-between rounded-3xl border border-border bg-card p-5 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-accent/50"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                                                    {collaborator.logo_url ? (
                                                        <img
                                                            src={
                                                                collaborator.logo_url
                                                            }
                                                            alt=""
                                                            className="max-h-10 max-w-10 object-contain"
                                                        />
                                                    ) : (
                                                        <CollaboratorIcon className="size-7" />
                                                    )}
                                                </div>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                                    <CollaboratorIcon className="size-3.5" />
                                                    {collaborator.badge}
                                                </span>
                                            </div>

                                            <div>
                                                <h3 className="inline-flex items-center gap-2 text-lg leading-7 font-black text-card-foreground">
                                                    <CollaboratorIcon className="size-4 text-primary" />
                                                    {collaborator.name}
                                                </h3>
                                                <p className="mt-2 min-h-16 text-sm leading-7 text-muted-foreground">
                                                    {collaborator.description ??
                                                        'مساحة تعاون قابلة للتخصيص عند إضافة بيانات الشريك الفعلية.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs font-semibold text-muted-foreground">
                                            <span className="inline-flex items-center gap-1.5">
                                                <MapPin className="size-3.5 text-primary" />
                                                {collaborator.area}
                                            </span>
                                            <span className="text-primary">
                                                {collaborator.impact}
                                            </span>
                                        </div>
                                    </article>
                                );
                            },
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Collaborations({ sections }: { sections: Section[] }) {
    const displaySections = buildDisplaySections(sections);

    return (
        <>
            <Head title="شراكات همة" />
            <div
                className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground"
                dir="rtl"
            >
                <SiteHeader />
                <main className="relative flex-1 px-4 py-12 sm:px-6 lg:py-16">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-96 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
                    <div className="relative mx-auto max-w-6xl">
                        <section className="grid items-end gap-10 pb-12 lg:grid-cols-[1.15fr_0.85fr] lg:pb-16">
                            <div className="space-y-7">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
                                    <Sparkles className="size-4" />
                                    شبكة شراكات أردنية قابلة للنمو
                                </div>

                                <div className="space-y-5">
                                    <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                                        تعاونات تتحرك مثل نبض المجتمع
                                    </h1>
                                    <p className="max-w-2xl text-lg leading-9 text-muted-foreground">
                                        صفحة حديثة تعرض قطاعات التعاون في همة
                                        كمسارات متكررة وبطيئة الحركة، مع أمثلة
                                        أردنية مؤقتة يمكن استبدالها لاحقاً
                                        بالشركاء الحقيقيين.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-4xl border border-border bg-card/80 p-5 shadow-sm ring-1 ring-primary/5 backdrop-blur">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
                                        <p className="text-4xl font-black">
                                            {displaySections.length}
                                        </p>
                                        <p className="mt-2 text-sm font-medium opacity-90">
                                            قطاعات تعاون
                                        </p>
                                    </div>
                                    <div className="rounded-3xl border border-border bg-background p-5">
                                        <p className="text-4xl font-black text-primary">
                                            {displaySections.reduce(
                                                (total, section) =>
                                                    total +
                                                    section.collaborators
                                                        .length,
                                                0,
                                            )}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-muted-foreground">
                                            بطاقة شريك
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex flex-col gap-8">
                            {displaySections.map((section, index) => (
                                <InfiniteLogoRail
                                    key={section.sector}
                                    section={section}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} همة. كل الحقوق محفوظة.
                </footer>
            </div>
        </>
    );
}
