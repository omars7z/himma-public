<?php

namespace Database\Factories;

use App\Models\Reward;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reward>
 */
class RewardFactory extends Factory
{
    private const REWARDS = [
        ['title' => 'قسيمة تسوق بـ 10 دنانير', 'points_cost' => 100],
        ['title' => 'قسيمة تسوق بـ 25 دنانير', 'points_cost' => 250],
        ['title' => 'وجبة مجانية في مطعم شريك', 'points_cost' => 80],
        ['title' => 'اشتراك شهري في نادي رياضي', 'points_cost' => 300],
        ['title' => 'كتاب مجاني من مكتبة شريكة', 'points_cost' => 60],
        ['title' => 'دورة تدريبية مجانية أونلاين', 'points_cost' => 200],
        ['title' => 'بطاقة هدية مكتبة بـ 15 دنانير', 'points_cost' => 150],
        ['title' => 'تذكرة سينما لشخصين', 'points_cost' => 120],
        ['title' => 'رحلة يومية مع شريك سياحي', 'points_cost' => 500],
        ['title' => 'شارة متطوع متميز', 'points_cost' => 50],
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $reward = fake()->unique()->randomElement(self::REWARDS);

        return [
            'title' => $reward['title'],
            'description' => fake()->optional(0.8)->sentence(),
            'image' => null,
            'points_cost' => $reward['points_cost'],
        ];
    }
}
