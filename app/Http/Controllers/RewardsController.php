<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\User;
use App\Support\RewardImageUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RewardsController extends Controller
{
    private const PUBLIC_REWARDS_PER_PAGE = 8;

    public function index(): Response
    {
        $rewardsPaginator = Reward::query()
            ->orderBy('points_cost')
            ->paginate(self::PUBLIC_REWARDS_PER_PAGE)
            ->withQueryString();

        $rewardsData = collect($rewardsPaginator->items())
            ->map(fn (Reward $reward): array => [
                'id' => $reward->id,
                'title' => $reward->title,
                'description' => $reward->description,
                'points_cost' => $reward->points_cost,
                'image_url' => RewardImageUrl::resolve($reward->image, $reward->id),
            ])
            ->values()
            ->all();

        return Inertia::render('rewards', [
            'rewards' => [
                'data' => $rewardsData,
                'links' => [
                    'prev' => $rewardsPaginator->previousPageUrl(),
                    'next' => $rewardsPaginator->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $rewardsPaginator->currentPage(),
                    'last_page' => $rewardsPaginator->lastPage(),
                    'per_page' => $rewardsPaginator->perPage(),
                    'total' => $rewardsPaginator->total(),
                    'from' => $rewardsPaginator->firstItem(),
                    'to' => $rewardsPaginator->lastItem(),
                ],
            ],
        ]);
    }

    public function redeem(Reward $reward): RedirectResponse
    {
        $user = Auth::user();

        $redeemed = false;

        DB::transaction(function () use ($user, $reward, &$redeemed): void {
            /** @var User $lockedUser */
            $lockedUser = User::query()
                ->whereKey($user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $lockedReward = Reward::query()
                ->whereKey($reward->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedUser->points < $lockedReward->points_cost) {
                return;
            }

            $lockedUser->decrement('points', $lockedReward->points_cost);

            RewardRedemption::create([
                'user_id' => $lockedUser->id,
                'reward_id' => $lockedReward->id,
                'points_spent' => $lockedReward->points_cost,
            ]);

            $redeemed = true;
        });

        if (! $redeemed) {
            return back()->withErrors([
                'reward' => 'رصيد النقاط غير كافٍ لاسترداد هذه المكافأة.',
            ]);
        }

        return back()->with('success', sprintf('تم استرداد «%s» بنجاح!', $reward->title));
    }
}
