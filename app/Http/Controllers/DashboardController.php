<?php

namespace App\Http\Controllers;

use App\Models\Initiative;
use App\Models\Participation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function show(): Response
    {
        $user = Auth::user();

        $createdInitiatives = Initiative::query()
            ->where('created_by', $user->id)
            ->with(['participations.user:id,username,image'])
            ->withCount('participations')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Initiative $initiative): array => [
                'id' => $initiative->id,
                'name' => $initiative->name,
                'description' => $initiative->description,
                'starts_at' => $initiative->starts_at?->toIso8601String(),
                'city' => $initiative->city,
                'status' => $initiative->status,
                'creation_points' => $initiative->creation_points,
                'min_participants' => $initiative->min_participants,
                'max_participants' => $initiative->max_participants,
                'participants_count' => $initiative->participations_count,
                'target_gender' => $initiative->target_gender,
                'min_age' => $initiative->min_age,
                'participants' => $initiative->participations->map(fn (Participation $p): array => [
                    'id' => $p->id,
                    'user_id' => $p->user_id,
                    'username' => $p->user?->username,
                    'avatar_url' => $p->user?->avatar_url,
                    'status' => $p->status,
                    'points_awarded' => $p->points_awarded,
                    'enrolled_at' => $p->created_at->toIso8601String(),
                ])->values()->all(),
            ])
            ->all();

        $joinedParticipations = Participation::query()
            ->where('user_id', $user->id)
            ->with(['initiative:id,name,starts_at,city,status,creation_points,created_by'])
            ->orderByDesc('created_at')
            ->get()
            ->filter(fn (Participation $p): bool => $p->initiative !== null)
            ->map(fn (Participation $p): array => [
                'id' => $p->id,
                'status' => $p->status,
                'points_awarded' => $p->points_awarded,
                'enrolled_at' => $p->created_at->toIso8601String(),
                'initiative' => [
                    'id' => $p->initiative->id,
                    'name' => $p->initiative->name,
                    'starts_at' => $p->initiative->starts_at?->toIso8601String(),
                    'city' => $p->initiative->city,
                    'status' => $p->initiative->status,
                    'creation_points' => $p->initiative->creation_points,
                ],
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'createdInitiatives' => $createdInitiatives,
            'joinedParticipations' => $joinedParticipations,
        ]);
    }
}
