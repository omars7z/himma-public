<?php

namespace App\Http\Controllers;

use App\Models\Initiative;
use App\Models\Participation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InitiativesController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $initiatives = Initiative::query()
            ->where('status', 'approved')
            ->where('starts_at', '>=', now())
            ->withCount('participations')
            ->with('creator:id,username,image')
            ->orderBy('starts_at')
            ->limit(50)
            ->get();

        $joinedIds = array_flip(
            Participation::query()
                ->where('user_id', $user->id)
                ->whereIn('initiative_id', $initiatives->pluck('id'))
                ->pluck('initiative_id')
                ->all()
        );

        $featuredInitiatives = $initiatives
            ->map(fn (Initiative $i): array => self::formatInitiative($i, isset($joinedIds[$i->id])))
            ->all();

        $myParticipations = Participation::query()
            ->where('user_id', $user->id)
            ->with(['initiative' => fn ($q) => $q->withCount('participations')->with('creator:id,username,image')])
            ->orderByDesc('created_at')
            ->get()
            ->filter(fn (Participation $p): bool => $p->initiative !== null)
            ->map(fn (Participation $p): array => [
                'participation_id' => $p->id,
                'status' => $p->status,
                'points_awarded' => $p->points_awarded,
                'enrolled_at' => $p->created_at->toIso8601String(),
                'initiative' => self::formatInitiative($p->initiative, true),
            ])
            ->values()
            ->all();

        return Inertia::render('initiatives/index', [
            'withdrawalPenaltyPoints' => Participation::WITHDRAWAL_PENALTY_POINTS,
            'featuredInitiatives' => $featuredInitiatives,
            'myParticipations' => $myParticipations,
        ]);
    }

    public function show(Initiative $initiative): Response
    {
        $user = Auth::user();

        $initiative->loadCount('participations')->load('creator:id,username,image');

        $isJoined = Participation::query()
            ->where('user_id', $user->id)
            ->where('initiative_id', $initiative->id)
            ->exists();

        return Inertia::render('initiatives/show', [
            'withdrawalPenaltyPoints' => Participation::WITHDRAWAL_PENALTY_POINTS,
            'initiative' => self::formatInitiative($initiative, $isJoined),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'starts_at' => ['required', 'date', 'after:now'],
            'city' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'min_participants' => ['nullable', 'integer', 'min:2'],
            'max_participants' => ['nullable', 'integer', 'min:2', 'gte:min_participants'],
            'target_gender' => ['nullable', 'in:male,female'],
            'min_age' => ['nullable', 'integer', 'min:13', 'max:100'],
        ]);

        Initiative::create([
            ...$validated,
            'created_by' => Auth::id(),
            'status' => 'pending',
            'creation_points' => 0,
        ]);

        return back()->with('success', 'تم إرسال مبادرتك للمراجعة. سيتم إشعارك عند الموافقة عليها.');
    }

    public function update(Request $request, Initiative $initiative): RedirectResponse
    {
        abort_if($initiative->created_by !== Auth::id(), 403);

        if ($initiative->status === 'pending') {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:5000'],
                'starts_at' => ['required', 'date', 'after:now'],
                'city' => ['nullable', 'string', 'max:100'],
                'min_participants' => ['nullable', 'integer', 'min:2'],
                'max_participants' => ['nullable', 'integer', 'min:2', 'gte:min_participants'],
                'target_gender' => ['nullable', 'in:male,female'],
                'min_age' => ['nullable', 'integer', 'min:13', 'max:100'],
            ]);
        } else {
            $validated = $request->validate([
                'description' => ['nullable', 'string', 'max:5000'],
            ]);
        }

        $initiative->update($validated);

        return back()->with('success', 'تم تحديث المبادرة بنجاح.');
    }

    public function destroy(Initiative $initiative): RedirectResponse
    {
        abort_if($initiative->created_by !== Auth::id(), 403);
        abort_if($initiative->status !== 'pending', 403, 'لا يمكن حذف المبادرة بعد الموافقة عليها.');

        $initiative->delete();

        return back()->with('success', 'تم حذف المبادرة.');
    }

    /**
     * @return array{id: int, name: string, starts_at: string|null, city: string|null, latitude: float|null, longitude: float|null, description: string|null, min_participants: int|null, max_participants: int|null, participants_count: int, creator_username: string|null, creator_avatar_url: string|null, target_gender: string|null, min_age: int|null, creation_points: int, is_joined: bool}
     */
    private static function formatInitiative(Initiative $initiative, bool $isJoined): array
    {
        return [
            'id' => $initiative->id,
            'name' => $initiative->name,
            'starts_at' => $initiative->starts_at?->toIso8601String(),
            'city' => $initiative->city,
            'latitude' => $initiative->latitude,
            'longitude' => $initiative->longitude,
            'description' => $initiative->description,
            'min_participants' => $initiative->min_participants,
            'max_participants' => $initiative->max_participants,
            'participants_count' => $initiative->participations_count ?? 0,
            'creator_username' => $initiative->creator?->username,
            'creator_avatar_url' => $initiative->creator?->avatar_url,
            'target_gender' => $initiative->target_gender,
            'min_age' => $initiative->min_age,
            'creation_points' => $initiative->creation_points,
            'is_joined' => $isJoined,
        ];
    }
}
