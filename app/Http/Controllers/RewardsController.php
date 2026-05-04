<?php

namespace App\Http\Controllers;

use App\Models\Reward;
use App\Models\RewardRedemption;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RewardsController extends Controller
{
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
