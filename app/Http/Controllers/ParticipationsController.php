<?php

namespace App\Http\Controllers;

use App\Models\Initiative;
use App\Models\Participation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ParticipationsController extends Controller
{
    public function store(Initiative $initiative): RedirectResponse
    {
        $user = Auth::user();

        $alreadyJoined = Participation::query()
            ->where('user_id', $user->id)
            ->where('initiative_id', $initiative->id)
            ->exists();

        if ($alreadyJoined) {
            return back()->with('error', 'أنت منضم بالفعل لهذه المبادرة.');
        }

        if ($initiative->max_participants !== null) {
            if ($initiative->participations()->count() >= $initiative->max_participants) {
                return back()->with('error', 'المبادرة مكتملة، لا تتوفر أماكن.');
            }
        }

        Participation::create([
            'user_id' => $user->id,
            'initiative_id' => $initiative->id,
            'status' => 'registered',
        ]);

        return back()->with('success', 'انضممت إلى المبادرة بنجاح!');
    }

    public function destroy(Initiative $initiative): RedirectResponse
    {
        $user = Auth::user();

        $participation = Participation::query()
            ->where('user_id', $user->id)
            ->where('initiative_id', $initiative->id)
            ->whereNull('points_awarded')
            ->firstOrFail();

        $penaltyApplied = 0;

        DB::transaction(function () use ($participation, &$penaltyApplied): void {
            /** @var Participation|null $locked */
            $locked = Participation::query()
                ->whereKey($participation->getKey())
                ->whereNull('points_awarded')
                ->lockForUpdate()
                ->first();

            abort_if($locked === null, 404);

            $lockedUser = User::query()
                ->whereKey($locked->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $penaltyApplied = min(
                Participation::WITHDRAWAL_PENALTY_POINTS,
                max(0, (int) $lockedUser->points)
            );

            if ($penaltyApplied > 0) {
                $lockedUser->decrement('points', $penaltyApplied);
            }

            $locked->delete();
        });

        if ($penaltyApplied > 0) {
            return back()->with('success', sprintf(
                'تم الانسحاب من المبادرة. تم خصم %d نقاط من رصيدك.',
                $penaltyApplied
            ));
        }

        return back()->with('success', 'تم الانسحاب من المبادرة.');
    }

    public function confirmAttendance(Initiative $initiative, Participation $participation): RedirectResponse
    {
        abort_if($initiative->created_by !== Auth::id(), 403);
        abort_if($participation->initiative_id !== $initiative->id, 404);

        $recorded = $participation->recordAttendance();

        if (! $recorded) {
            return back()->with('info', 'تم تسجيل الحضور مسبقًا لهذا المشارك.');
        }

        $allAttended = $initiative->participations()->whereNull('points_awarded')->doesntExist();
        $hasParticipants = $initiative->participations()->exists();

        if ($allAttended && $hasParticipants) {
            $initiative->update(['status' => 'completed']);
        }

        return back()->with('success', 'تم تأكيد حضور المشارك.');
    }
}
