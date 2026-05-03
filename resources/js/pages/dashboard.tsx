import { Head, usePage } from '@inertiajs/react';
import { dashboard } from '@/routes';
import type { Auth } from '@/types/auth';

export default function Dashboard() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { user } = auth;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">
                        Welcome back, {user.username}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Here&apos;s an overview of your points and activity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground">
                            Total Points
                        </p>
                        <p className="mt-1 text-4xl font-bold text-foreground">
                            {user.points.toLocaleString()}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground">
                            Rank
                        </p>
                        <p className="mt-1 text-4xl font-bold text-foreground">
                            &mdash;
                        </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <p className="text-sm font-medium text-muted-foreground">
                            Rewards Unlocked
                        </p>
                        <p className="mt-1 text-4xl font-bold text-foreground">
                            0
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-base font-semibold">
                        Recent Activity
                    </h2>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            No activity yet. Start earning points!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
