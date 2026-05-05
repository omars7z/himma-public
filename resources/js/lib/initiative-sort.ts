/**
 * ترتيب قوائم المبادرات في الواجهة (بعد تطبيق الفلاتر).
 */

export type InitiativeSortKey =
    | 'starts_at_asc'
    | 'reviews_desc'
    | 'min_age_asc'
    | 'demographic_open_first';

export type SortableInitiative = {
    id: number;
    starts_at: string | null;
    reviews_average: number | null;
    reviews_count: number;
    min_age: number | null;
    target_gender: 'male' | 'female' | null;
    participants_count: number;
};

export const INITIATIVE_SORT_OPTIONS: {
    value: InitiativeSortKey;
    label: string;
}[] = [
    { value: 'starts_at_asc', label: 'الموعد — الأقرب أولًا' },
    { value: 'reviews_desc', label: 'التقييمات — الأعلى' },
    { value: 'min_age_asc', label: 'العمر — شرط أقل أولًا' },
    { value: 'demographic_open_first', label: 'الديموغرافيا — الجميع أولًا' },
];

function demographicRank(targetGender: 'male' | 'female' | null): number {
    if (targetGender === null) {
        return 0;
    }

    return targetGender === 'male' ? 1 : 2;
}

export function sortInitiatives<T extends SortableInitiative>(items: T[], sort: InitiativeSortKey): T[] {
    const copy = [...items];

    copy.sort((a, b) => {
        let cmp = 0;

        switch (sort) {
            case 'starts_at_asc': {
                const ta = a.starts_at ? new Date(a.starts_at).getTime() : Number.POSITIVE_INFINITY;
                const tb = b.starts_at ? new Date(b.starts_at).getTime() : Number.POSITIVE_INFINITY;
                cmp = ta - tb;
                break;
            }
            case 'reviews_desc': {
                const ha = a.reviews_average !== null;
                const hb = b.reviews_average !== null;

                if (!ha && !hb) {
                    cmp = (b.participants_count ?? 0) - (a.participants_count ?? 0);
                    break;
                }

                if (!ha) {
                    cmp = 1;
                    break;
                }

                if (!hb) {
                    cmp = -1;
                    break;
                }

                cmp = (b.reviews_average as number) - (a.reviews_average as number);

                if (cmp === 0) {
                    cmp = (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
                }

                break;
            }
            case 'min_age_asc': {
                const na = a.min_age ?? 999;
                const nb = b.min_age ?? 999;
                cmp = na - nb;
                break;
            }
            case 'demographic_open_first': {
                cmp = demographicRank(a.target_gender) - demographicRank(b.target_gender);
                break;
            }
            default:
                cmp = 0;
        }

        if (cmp !== 0) {
            return cmp;
        }

        return a.id - b.id;
    });

    return copy;
}
