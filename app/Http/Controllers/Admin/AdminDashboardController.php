<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Initiative;
use App\Models\Participation;
use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\User;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function show(): Response
    {
        $stats = [
            'users_total' => User::count(),
            'users_this_month' => User::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count(),
            'initiatives_pending' => Initiative::where('status', 'pending')->count(),
            'initiatives_approved' => Initiative::where('status', 'approved')->count(),
            'initiatives_rejected' => Initiative::where('status', 'rejected')->count(),
            'initiatives_total' => Initiative::count(),
            'participations_total' => Participation::count(),
            'rewards_total' => Reward::count(),
            'redemptions_total' => RewardRedemption::count(),
        ];

        /** Initiatives count per month (last 6 months). */
        $initiativesByMonth = $this->fillMonthlyGaps(
            Initiative::query()
                ->selectRaw("strftime('%Y-%m', created_at) as month, count(*) as total")
                ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month')
                ->all(),
            6,
        );

        /** Participations count per month (last 6 months). */
        $participationsByMonth = $this->fillMonthlyGaps(
            Participation::query()
                ->selectRaw("strftime('%Y-%m', created_at) as month, count(*) as total")
                ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month')
                ->all(),
            6,
        );

        /** New user registrations per month (last 6 months). */
        $usersByMonth = $this->fillMonthlyGaps(
            User::query()
                ->selectRaw("strftime('%Y-%m', created_at) as month, count(*) as total")
                ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('total', 'month')
                ->all(),
            6,
        );

        /** Approved initiatives grouped by city (top 12). */
        $initiativesByCity = Initiative::query()
            ->where('status', 'approved')
            ->whereNotNull('city')
            ->selectRaw('city, count(*) as total')
            ->groupBy('city')
            ->orderByDesc('total')
            ->limit(12)
            ->pluck('total', 'city')
            ->all();

        /** Daily initiative creation for the last 30 days. */
        $initiativesByDay = $this->fillDailyGaps(
            Initiative::query()
                ->selectRaw("strftime('%Y-%m-%d', created_at) as day, count(*) as total")
                ->where('created_at', '>=', now()->subDays(29)->startOfDay())
                ->groupBy('day')
                ->orderBy('day')
                ->pluck('total', 'day')
                ->all(),
            30,
        );

        $topContributors = User::query()
            ->select('id', 'username', 'image', 'points', 'city')
            ->orderByDesc('points')
            ->limit(5)
            ->get()
            ->map(fn (User $u) => [
                'username' => $u->username,
                'avatar_url' => $u->avatar_url,
                'points' => $u->points,
                'city' => $u->city,
            ]);

        return Inertia::render('admin/analytics', [
            'stats' => $stats,
            'initiativesByMonth' => $initiativesByMonth,
            'participationsByMonth' => $participationsByMonth,
            'usersByMonth' => $usersByMonth,
            'initiativesByCity' => $initiativesByCity,
            'initiativesByDay' => $initiativesByDay,
            'topContributors' => $topContributors,
        ]);
    }

    /**
     * Fill missing months with zero counts so charts have continuous X axes.
     *
     * @param  array<string, int>  $data
     * @return array<string, int>
     */
    private function fillMonthlyGaps(array $data, int $months): array
    {
        $filled = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $key = now()->subMonths($i)->format('Y-m');
            $filled[$key] = $data[$key] ?? 0;
        }

        return $filled;
    }

    /**
     * Fill missing days with zero counts for the last N days.
     *
     * @param  array<string, int>  $data
     * @return array<string, int>
     */
    private function fillDailyGaps(array $data, int $days): array
    {
        $filled = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $key = Carbon::today()->subDays($i)->toDateString();
            $filled[$key] = $data[$key] ?? 0;
        }

        return $filled;
    }
}
