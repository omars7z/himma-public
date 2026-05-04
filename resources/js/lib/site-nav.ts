import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { collaborators, home, mobileApp } from '@/routes';
import { index as initiativesIndex } from '@/routes/initiatives';

export type NavLinkItem =
    | { label: string; kind: 'home'; section: 'top' | 'rewards' }
    | { label: string; kind: 'route'; href: string };

export const NAV_LINKS: NavLinkItem[] = [
    { label: 'الرئيسية', kind: 'home', section: 'top' },
    { label: 'المبادرات', kind: 'route', href: initiativesIndex().url },
    { label: 'شركاؤنا', kind: 'route', href: collaborators().url },
    { label: 'المكافآت', kind: 'home', section: 'rewards' },
    { label: 'التطبيق', kind: 'route', href: mobileApp().url },
];

/**
 * على الرئيسية: روابط الجزء (#top / #rewards) فقط.
 * خارج الرئيسية: نفس المسار مع الهاش (مثل /#top) حتى يفتح الموقع ثم ينتقل للقسم.
 */
export function getNavLinkHref(item: NavLinkItem, isHomePage: boolean): string {
    if (item.kind === 'home') {
        const hash = item.section === 'top' ? '#top' : '#rewards';

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
                        ? `home-${item.section}`
                        : `route:${item.href}`,
            })),
        [isHomePage],
    );

    return { isHomePage, links };
}
