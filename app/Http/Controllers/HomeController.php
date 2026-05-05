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

    private const MOCK_CREATION_POINTS = 30;

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

        if ($featuredInitiatives === []) {
            $featuredInitiatives = self::mockFeaturedInitiatives();
        }

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
                'initiatives_count' => max(
                    Initiative::query()->where('status', 'approved')->count(),
                    count($featuredInitiatives)
                ),
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

    /**
     * @return list<array{
     *     id: int,
     *     name: string,
     *     starts_at: string,
     *     city: string,
     *     latitude: float,
     *     longitude: float,
     *     description: string,
     *     min_participants: int,
     *     max_participants: int,
     *     participants_count: int,
     *     creator_username: string,
     *     target_gender: 'male'|'female'|null,
     *     min_age: int,
     *     creation_points: int,
     *     is_joined: bool
     * }>
     */
    private static function mockFeaturedInitiatives(): array
    {
        return [
            [
                'id' => 10001,
                'name' => 'تنظيف مسارات جبل القلعة',
                'starts_at' => now()->addDays(2)->setTime(9, 0)->toIso8601String(),
                'city' => 'amman',
                'latitude' => 31.9544,
                'longitude' => 35.9349,
                'description' => 'فعالية شبابية لتنظيف المسارات التاريخية وتعزيز الوعي البيئي.',
                'min_participants' => 10,
                'max_participants' => 40,
                'participants_count' => 18,
                'creator_username' => 'himma_team',
                'target_gender' => null,
                'min_age' => 18,
                'creation_points' => self::MOCK_CREATION_POINTS,
                'is_joined' => false,
            ],
            [
                'id' => 10002,
                'name' => 'دعم طلاب التوجيهي - إربد',
                'starts_at' => now()->addDays(4)->setTime(16, 30)->toIso8601String(),
                'city' => 'irbid',
                'latitude' => 32.5556,
                'longitude' => 35.8500,
                'description' => 'جلسات إرشاد أكاديمي ومهارات دراسية لطلاب المدارس.',
                'min_participants' => 8,
                'max_participants' => 30,
                'participants_count' => 14,
                'creator_username' => 'study_circle',
                'target_gender' => null,
                'min_age' => 18,
                'creation_points' => self::MOCK_CREATION_POINTS,
                'is_joined' => false,
            ],
            [
                'id' => 10003,
                'name' => 'حملة تشجير أحياء الزرقاء',
                'starts_at' => now()->addDays(6)->setTime(8, 30)->toIso8601String(),
                'city' => 'zarqa',
                'latitude' => 32.0728,
                'longitude' => 36.0880,
                'description' => 'غرس أشجار محلية وتحسين المساحات العامة بمشاركة الشباب.',
                'min_participants' => 12,
                'max_participants' => 50,
                'participants_count' => 22,
                'creator_username' => 'green_jordan',
                'target_gender' => null,
                'min_age' => 18,
                'creation_points' => self::MOCK_CREATION_POINTS,
                'is_joined' => false,
            ],
            [
                'id' => 10004,
                'name' => 'ترميم مرافق شبابية - الكرك',
                'starts_at' => now()->addDays(8)->setTime(10, 0)->toIso8601String(),
                'city' => 'karak',
                'latitude' => 31.1854,
                'longitude' => 35.7048,
                'description' => 'صيانة وتجهيز مساحات شبابية لخدمة المجتمع المحلي.',
                'min_participants' => 6,
                'max_participants' => 25,
                'participants_count' => 9,
                'creator_username' => 'youth_hub',
                'target_gender' => null,
                'min_age' => 18,
                'creation_points' => self::MOCK_CREATION_POINTS,
                'is_joined' => false,
            ],
            [
                'id' => 10005,
                'name' => 'تنظيم شاطئ العقبة التطوعي',
                'starts_at' => now()->addDays(10)->setTime(7, 30)->toIso8601String(),
                'city' => 'aqaba',
                'latitude' => 29.5321,
                'longitude' => 35.0063,
                'description' => 'تنظيف الشاطئ وفرز النفايات مع نشاط توعوي للزوار.',
                'min_participants' => 15,
                'max_participants' => 60,
                'participants_count' => 31,
                'creator_username' => 'redsea_volunteers',
                'target_gender' => null,
                'min_age' => 18,
                'creation_points' => self::MOCK_CREATION_POINTS,
                'is_joined' => false,
            ],
        ];
    }
}
