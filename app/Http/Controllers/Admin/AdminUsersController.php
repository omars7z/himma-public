<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminUsersController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->withCount(['createdInitiatives', 'participations'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (User $u) => $this->formatUser($u));

        return Inertia::render('admin/users', [
            'users' => $users,
            'authId' => Auth::id(),
        ]);
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->id === Auth::id(), 403, 'لا يمكنك حذف حسابك الخاص.');
        abort_if($user->role === 'admin', 403, 'لا يمكن حذف حساب مدير.');

        $user->delete();

        return back()->with('success', 'تم حذف المستخدم بنجاح.');
    }

    public function toggleRole(User $user): RedirectResponse
    {
        abort_if($user->id === Auth::id(), 403, 'لا يمكنك تغيير دورك الخاص.');

        $user->update(['role' => $user->role === 'admin' ? null : 'admin']);

        $label = $user->role === 'admin' ? 'مدير' : 'مستخدم';

        return back()->with('success', "تم تغيير دور {$user->username} إلى {$label}.");
    }

    public function adjustPoints(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'delta' => ['required', 'integer', 'min:-10000', 'max:10000'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $user->points = max(0, $user->points + $validated['delta']);
        $user->save();

        $sign = $validated['delta'] >= 0 ? '+' : '';

        return back()->with('success', "تم تعديل نقاط {$user->username}: {$sign}{$validated['delta']} نقطة.");
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $u): array
    {
        return [
            'id' => $u->id,
            'username' => $u->username,
            'avatar_url' => $u->avatar_url,
            'city' => $u->city,
            'gender' => $u->gender,
            'points' => $u->points,
            'role' => $u->role,
            'status' => $u->status,
            'initiatives_count' => $u->created_initiatives_count,
            'participations_count' => $u->participations_count,
            'created_at' => $u->created_at->toIso8601String(),
        ];
    }
}
