import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { collaborators, home, mobileApp } from '@/routes';
import { index as initiativesIndex } from '@/routes/initiatives';
import { index as rewardsCatalogIndex } from '@/routes/rewards';

export type NavLinkItem =
    | { label: string; kind: 'home'; section: 'top' | 'leaderboard' }
    | { label: string; kind: 'route'; href: string };

export const NAV_LINKS: NavLinkItem[] = [
    { label: 'الرئيسية', kind: 'home', section: 'top' },
    { label: 'المبادرات', kind: 'route', href: initiativesIndex().url },
    { label: 'شركاؤنا', kind: 'route', href: collaborators().url },
    { label: 'لوحة المتصدرين', kind: 'home', section: 'leaderboard' },
    {
        label: 'المكافآت',
        kind: 'route',
        href: rewardsCatalogIndex.url(),
    },
    { label: 'التطبيق', kind: 'route', href: mobileApp().url },
];

/**
 * على الرئيسية: روابط أقسام الرئيسية (#top / #leaderboard) أو مسارات خارجية كما هي.
 * خارج الرئيسية: مسار القسم على الرئيسية مع الهاش (مثل /#leaderboard).
 */
export function getNavLinkHref(item: NavLinkItem, isHomePage: boolean): string {
    if (item.kind === 'home') {
        const hash = item.section === 'top' ? '#top' : '#leaderboard';

        if (isHomePage) {
            return hash;
        }

        const base = home().url;

        return `${base}${hash}`;
    }

    return item.href;
}

export type ResolvedNavLink = {
    label: string;
    href: string;
    key: string;
};

/**
 * تنقّل موحّد: يضبط روابط أقسام الرئيسية حسب صفحة Inertia الحالية.
 */
export function useUnionNav(): {
    isHomePage: boolean;
    links: ResolvedNavLink[];
} {
    const page = usePage();
    const isHomePage = page.component === 'home';

    const links = useMemo(
        () =>
            NAV_LINKS.map((item) => ({
                label: item.label,
                href: getNavLinkHref(item, isHomePage),
                key:
                    item.kind === 'home'
                        ? `home:${item.section}`
                        : `route:${item.href}`,
            })),
        [isHomePage],
    );

    return { isHomePage, links };
}
