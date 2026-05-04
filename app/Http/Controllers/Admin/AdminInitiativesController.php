<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Initiative;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminInitiativesController extends Controller
{
    public function index(): Response
    {
        $pending = Initiative::query()
            ->where('status', 'pending')
            ->with('creator:id,username,image')
            ->withCount('participations')
            ->orderBy('created_at')
            ->get()
            ->map(fn (Initiative $i): array => $this->formatInitiative($i));

        $recent = Initiative::query()
            ->whereIn('status', ['approved', 'rejected'])
            ->with('creator:id,username,image')
            ->withCount('participations')
            ->orderByDesc('updated_at')
            ->limit(20)
            ->get()
            ->map(fn (Initiative $i): array => $this->formatInitiative($i));

        return Inertia::render('admin/initiatives', [
            'pendingInitiatives' => $pending,
            'recentInitiatives' => $recent,
        ]);
    }

    public function approve(Request $request, Initiative $initiative): RedirectResponse
    {
        abort_if($initiative->status !== 'pending', 422, 'هذه المبادرة ليست في انتظار المراجعة.');

        $validated = $request->validate([
            'creation_points' => ['required', 'integer', 'min:0', 'max:1000'],
        ]);

        $initiative->update([
            'status' => 'approved',
            'creation_points' => $validated['creation_points'],
        ]);

        return back()->with('success', 'تمت الموافقة على المبادرة.');
    }

    public function reject(Initiative $initiative): RedirectResponse
    {
        abort_if($initiative->status !== 'pending', 422, 'هذه المبادرة ليست في انتظار المراجعة.');

        $initiative->update(['status' => 'rejected']);

        return back()->with('success', 'تم رفض المبادرة.');
    }

    /**
     * @return array{id: int, name: string, description: string|null, starts_at: string|null, city: string|null, status: string, creation_points: int, min_participants: int|null, max_participants: int|null, target_gender: string|null, min_age: int|null, participants_count: int, creator_username: string|null, creator_avatar_url: string|null, created_at: string}
     */
    private function formatInitiative(Initiative $initiative): array
    {
        return [
            'id' => $initiative->id,
            'name' => $initiative->name,
            'description' => $initiative->description,
            'starts_at' => $initiative->starts_at?->toIso8601String(),
            'city' => $initiative->city,
            'status' => $initiative->status,
            'creation_points' => $initiative->creation_points,
            'min_participants' => $initiative->min_participants,
            'max_participants' => $initiative->max_participants,
            'target_gender' => $initiative->target_gender,
            'min_age' => $initiative->min_age,
            'participants_count' => $initiative->participations_count ?? 0,
            'creator_username' => $initiative->creator?->username,
            'creator_avatar_url' => $initiative->creator?->avatar_url,
            'created_at' => $initiative->created_at->toIso8601String(),
        ];
    }
}
