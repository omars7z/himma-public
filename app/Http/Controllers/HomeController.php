<?php

namespace App\Http\Controllers;

use App\Models\Initiative;
use App\Models\Participation;
use App\Models\Reward;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const REWARDS_PER_PAGE = 8;

    /**
     * معرّفات ثابتة من picsum.photos — روابط مباشرة وموثوقة للصور الاحتياطية.
     *
     * @var list<int>
     */
    private const REWARD_FALLBACK_PICSUM_IDS = [
        292, 429, 431, 593, 668, 742, 829, 865, 988, 1019,
    ];

    public function show(): Response
    {
        $initiatives = Initiative::query()
            ->where('status', 'approved')
            ->where('starts_at', '>=', now())
            ->withCount('participations')
            ->with('creator:id,username')
            ->orderBy('starts_at')
            ->limit(50)
            ->get();

        $joinedIds = [];
        if ($userId = auth()->id()) {
            $joinedIds = array_flip(
                Participation::query()
                    ->where('user_id', $userId)
                    ->whereIn('initiative_id', $initiatives->pluck('id'))
                    ->pluck('initiative_id')
                    ->all()
            );
        }

        $featuredInitiatives = $initiatives
            ->map(fn (Initiative $initiative): array => [
                'id' => $initiative->id,
                'name' => $initiative->name,
                'starts_at' => $initiative->starts_at?->toIso8601String(),
                'city' => $initiative->city,
                'latitude' => $initiative->latitude,
                'longitude' => $initiative->longitude,
                'description' => $initiative->description,
                'min_participants' => $initiative->min_participants,
                'max_participants' => $initiative->max_participants,
                'participants_count' => $initiative->participations_count,
                'creator_username' => $initiative->creator?->username,
                'target_gender' => $initiative->target_gender,
                'min_age' => $initiative->min_age,
                'creation_points' => $initiative->creation_points,
                'is_joined' => isset($joinedIds[$initiative->id]),
            ])
            ->all();

        $rewardsPaginator = Reward::query()
            ->orderBy('points_cost')
            ->paginate(self::REWARDS_PER_PAGE, ['*'], 'rewards_page')
            ->withQueryString();

        $rewardsData = collect($rewardsPaginator->items())
            ->map(fn (Reward $reward): array => [
                'id' => $reward->id,
                'title' => $reward->title,
                'description' => $reward->description,
                'points_cost' => $reward->points_cost,
                'image_url' => self::resolveRewardImage($reward->image, $reward->id),
            ])
            ->values()
            ->all();

        return Inertia::render('home', [
            'withdrawalPenaltyPoints' => Participation::WITHDRAWAL_PENALTY_POINTS,
            'stats' => [
                'initiatives_count' => Initiative::query()->where('status', 'approved')->count(),
                'users_count' => User::query()->count(),
            ],
            'featuredInitiatives' => $featuredInitiatives,
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

    private static function resolveRewardImage(?string $stored, int $rewardId): string
    {
        if (filled($stored) && self::isTrustedRemoteImageUrl($stored)) {
            return $stored;
        }

        return self::fallbackRewardImageUrl($rewardId);
    }

    private static function fallbackRewardImageUrl(int $rewardId): string
    {
        $ids = self::REWARD_FALLBACK_PICSUM_IDS;
        $picsumId = $ids[$rewardId % count($ids)];

        return sprintf('https://picsum.photos/id/%d/800/600.jpg', $picsumId);
    }

    private static function isTrustedRemoteImageUrl(string $url): bool
    {
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);

        return in_array($scheme, ['http', 'https'], true);
    }
}
