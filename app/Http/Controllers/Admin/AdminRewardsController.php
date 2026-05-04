<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminRewardsController extends Controller
{
    public function index(): Response
    {
        $rewards = Reward::query()
            ->withCount('redemptions')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Reward $r) => $this->formatReward($r));

        return Inertia::render('admin/rewards', [
            'rewards' => $rewards,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'url', 'max:2048'],
            'points_cost' => ['required', 'integer', 'min:1', 'max:100000'],
        ]);

        Reward::create($validated);

        return back()->with('success', 'تمت إضافة المكافأة بنجاح.');
    }

    public function update(Request $request, Reward $reward): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'image' => ['nullable', 'url', 'max:2048'],
            'points_cost' => ['required', 'integer', 'min:1', 'max:100000'],
        ]);

        $reward->update($validated);

        return back()->with('success', 'تم تحديث المكافأة بنجاح.');
    }

    public function destroy(Reward $reward): RedirectResponse
    {
        $reward->delete();

        return back()->with('success', 'تم حذف المكافأة بنجاح.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatReward(Reward $r): array
    {
        return [
            'id' => $r->id,
            'title' => $r->title,
            'description' => $r->description,
            'image' => $r->image,
            'points_cost' => $r->points_cost,
            'redemptions_count' => $r->redemptions_count,
            'created_at' => $r->created_at->toIso8601String(),
        ];
    }
}
