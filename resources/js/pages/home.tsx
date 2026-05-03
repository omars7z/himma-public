import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Home({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    return (
        <>
            <Head title="Home" />
            <div className="flex min-h-screen flex-col bg-background text-foreground">
                <header className="border-b border-border">
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                        <span className="text-xl font-bold tracking-tight">
                            Himma
                        </span>
                        <nav className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                        >
                                            Get started
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
                    <div className="mx-auto max-w-2xl text-center">
                        <div className="mb-6 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                            Points &amp; Rewards System
                        </div>
                        <h1 className="mb-4 text-5xl font-bold tracking-tight">
                            Earn points,
                            <br />
                            unlock rewards.
                        </h1>
                        <p className="mb-10 text-lg text-muted-foreground">
                            Join Himma, complete challenges, and climb the
                            leaderboard. Every action earns you points.
                        </p>
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    Create an account
                                </Link>
                            )}
                            <Link
                                href={login()}
                                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-accent"
                            >
                                Log in
                            </Link>
                        </div>
                    </div>

                    <div className="mt-24 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
                        {[
                            {
                                title: 'Earn Points',
                                description:
                                    'Complete actions and challenges to accumulate points in your account.',
                            },
                            {
                                title: 'Track Progress',
                                description:
                                    'Watch your balance grow and see your rank on the leaderboard.',
                            },
                            {
                                title: 'Unlock Rewards',
                                description:
                                    'Spend your points on exclusive rewards and perks.',
                            },
                        ].map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-xl border border-border bg-card p-6 text-left shadow-sm"
                            >
                                <h3 className="mb-2 font-semibold text-card-foreground">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>

                <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} Himma. All rights
                    reserved.
                </footer>
            </div>
        </>
    );
}
