import { usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAppearance  } from '@/hooks/use-appearance';
import type {Appearance} from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type Props = {
    className?: string;
};

/**
 * Toggles light/dark theme. Uses shared Inertia `appearance` for SSR-safe
 * initial state, then syncs with {@link useAppearance} after hydration.
 */
export function AppearanceToggle({ className }: Props) {
    const { appearance: sharedAppearance } = usePage().props;
    const { updateAppearance, resolvedAppearance } = useAppearance();
    const [mode, setMode] = useState<Appearance>(sharedAppearance);

    useEffect(() => {
        setMode(resolvedAppearance);
    }, [resolvedAppearance]);

    const isDark = mode === 'dark';

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground',
                className,
            )}
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={
                isDark
                    ? 'التبديل إلى الوضع الفاتح'
                    : 'التبديل إلى الوضع الداكن'
            }
        >
            {isDark ? (
                <Sun className="size-5" aria-hidden />
            ) : (
                <Moon className="size-5" aria-hidden />
            )}
        </Button>
    );
}
