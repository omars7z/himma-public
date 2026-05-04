<?php

namespace App\Http\Controllers;

use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\UserLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    use ProfileValidationRules;

    public function show(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        return redirect()->route('users.show', $user->username);
    }

    public function showUser(string $username): Response
    {
        $profileUser = User::query()
            ->where('username', $username)
            ->withCount(['createdInitiatives', 'participations'])
            ->with('links')
            ->firstOrFail();

        return Inertia::render('profile', [
            'profileUser' => $this->formatUser($profileUser),
            'isOwn' => Auth::check() && Auth::id() === $profileUser->id,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'bio' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'birthdate' => [
                'nullable',
                'date',
                'before_or_equal:'.now()->subYears(18)->toDateString(),
                'after_or_equal:'.now()->subYears(30)->toDateString(),
            ],
            'phone' => ['nullable', 'string', 'regex:/^\+?[0-9][0-9\-\s]{5,17}$/'],
        ]);

        $user->fill($validated)->save();

        return back()->with('success', 'تم تحديث ملفك الشخصي بنجاح.');
    }

    public function updateLinks(Request $request): RedirectResponse
    {
        $usernameRule = ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z0-9_.\-]+$/'];

        $request->validate([
            'linkedin' => $usernameRule,
            'youtube' => $usernameRule,
            'facebook' => $usernameRule,
            'github' => $usernameRule,
        ]);

        /** @var User $user */
        $user = Auth::user();

        foreach (UserLink::PLATFORMS as $platform) {
            $handle = trim((string) $request->input($platform, ''));

            if (filled($handle)) {
                $user->links()->updateOrCreate(
                    ['platform' => $platform],
                    ['url' => $handle],
                );
            } else {
                $user->links()->where('platform', $platform)->delete();
            }
        }

        return back()->with('success', 'تم تحديث روابطك بنجاح.');
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:8192', 'mimes:jpeg,jpg,png,gif,webp'],
        ]);

        /** @var User $user */
        $user = Auth::user();

        if (filled($user->image) && ! str_starts_with($user->image, 'http') && Storage::disk('public')->exists($user->image)) {
            Storage::disk('public')->delete($user->image);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->image = $path;
        $user->save();

        return back()->with('success', 'تم تحديث صورتك الشخصية بنجاح.');
    }

    public function updateCover(Request $request): RedirectResponse
    {
        $request->validate([
            'cover' => ['required', 'image', 'max:8192', 'mimes:jpeg,jpg,png,gif,webp'],
        ]);

        /** @var User $user */
        $user = Auth::user();

        if (filled($user->cover_image) && ! str_starts_with($user->cover_image, 'http') && Storage::disk('public')->exists($user->cover_image)) {
            Storage::disk('public')->delete($user->cover_image);
        }

        $path = $request->file('cover')->store('covers', 'public');
        $user->cover_image = $path;
        $user->save();

        return back()->with('success', 'تم تحديث صورة الغلاف بنجاح.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        /** @var User $user */
        $user = Auth::user();
        $user->update([
            'password' => Hash::make($request->string('password')->value()),
        ]);

        return back()->with('success', 'تم تغيير كلمة المرور بنجاح.');
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        /** @var array<string, string> $linksMap */
        $linksMap = $user->links
            ->pluck('url', 'platform')
            ->all();

        return [
            'id' => $user->id,
            'username' => $user->username,
            'bio' => $user->bio,
            'avatar_url' => $user->avatar_url,
            'cover_url' => $user->cover_url,
            'city' => $user->city,
            'gender' => $user->gender,
            'birthdate' => $user->birthdate?->toDateString(),
            'phone' => $user->phone,
            'points' => $user->points,
            'created_at' => $user->created_at->toIso8601String(),
            'created_initiatives_count' => $user->created_initiatives_count ?? 0,
            'participations_count' => $user->participations_count ?? 0,
            'links' => $linksMap,
        ];
    }
}
