<?php

namespace Database\Factories;

use App\Models\Initiative;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Initiative>
 */
class InitiativeFactory extends Factory
{
    private const INITIATIVE_NAMES = [
        'تنظيف شاطئ العقبة',
        'زراعة أشجار في جرش',
        'توزيع وجبات إفطار رمضاني',
        'حملة التبرع بالدم',
        'دعم ذوي الاحتياجات الخاصة',
        'تعليم الأطفال في المخيمات',
        'إعادة تأهيل الحدائق العامة',
        'توزيع الملابس الشتوية',
        'زيارة دور المسنين',
        'تنظيف المدارس الحكومية',
        'حملة توعية بيئية',
        'دعم المرأة الريفية',
        'مبادرة القراءة للجميع',
        'الرياضة من أجل الصحة',
        'حملة لا للتدخين',
        'توزيع أدوات مدرسية للطلاب',
        'ترميم المساجد والمرافق العامة',
        'تنظيف شوارع وسط البلد',
        'برنامج تدريب الشباب على المهارات',
        'حملة دعم مرضى السرطان',
        'مبادرة الزواج الجماعي',
        'تشجير المناطق الجرداء',
        'دعم أسر الشهداء',
        'برنامج الإفطار الرمضاني للعمال',
        'توزيع سلال غذائية على الأسر',
        'مشروع تعليم الكبار',
        'حملة نظافة الأودية والمحميات',
        'دعم أطفال الأيتام',
        'مبادرة صحة الأسنان للأطفال',
        'حملة الوقاية من المخدرات',
        'توزيع أجهزة لوحية للطلاب المحتاجين',
        'برنامج التوجيه المهني للشباب',
        'دعم المشاريع الصغيرة للمرأة',
        'حملة توعية بحقوق الطفل',
        'مبادرة بيئة خضراء لمدارسنا',
    ];

    /**
     * Approximate bounding boxes (lat_min, lat_max, lng_min, lng_max) per city.
     *
     * @var array<string, array{float, float, float, float}>
     */
    private const CITY_BOUNDS = [
        'amman' => [31.90, 32.07, 35.83, 36.05],
        'zarqa' => [32.03, 32.14, 36.04, 36.16],
        'irbid' => [32.50, 32.62, 35.79, 35.93],
        'aqaba' => [29.48, 29.58, 34.95, 35.05],
        'madaba' => [31.67, 31.77, 35.74, 35.85],
        'alblat' => [31.98, 32.09, 35.68, 35.80],
        'mafraq' => [32.29, 32.40, 36.18, 36.30],
        'jerash' => [32.25, 32.35, 35.87, 35.97],
        'ajloun' => [32.30, 32.38, 35.72, 35.80],
        'karak' => [31.15, 31.25, 35.66, 35.76],
        'tafilah' => [30.79, 30.89, 35.57, 35.67],
        'maan' => [30.16, 30.26, 35.69, 35.79],
    ];

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cities = array_keys(self::CITY_BOUNDS);
        $city = fake()->randomElement($cities);
        [$latMin, $latMax, $lngMin, $lngMax] = self::CITY_BOUNDS[$city];
        $min = fake()->numberBetween(5, 20);

        return [
            'name' => fake()->unique()->randomElement(self::INITIATIVE_NAMES),
            'starts_at' => fake()->dateTimeBetween('now', '+6 months'),
            'city' => $city,
            'latitude' => fake()->randomFloat(6, $latMin, $latMax),
            'longitude' => fake()->randomFloat(6, $lngMin, $lngMax),
            'description' => fake()->paragraph(3),
            'min_participants' => $min,
            'max_participants' => fake()->numberBetween($min + 5, 100),
            'created_by' => User::factory(),
            'creation_points' => fake()->randomElement([10, 20, 30, 50]),
            'status' => fake()->randomElement(['pending', 'active', 'approved', 'completed']),
            'target_gender' => fake()->optional(0.5)->randomElement(['male', 'female']),
            'min_age' => fake()->optional(0.4)->numberBetween(16, 35),
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'starts_at' => fake()->dateTimeBetween('now', '+3 months'),
        ]);
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'starts_at' => fake()->dateTimeBetween('now', '+3 months'),
        ]);
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'starts_at' => fake()->dateTimeBetween('-6 months', '-1 day'),
        ]);
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'created_by' => $user->id,
        ]);
    }
}
