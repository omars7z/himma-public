<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class JordanianPeopleSeeder extends Seeder
{
    /**
     * مستخدمون تجريبيون بصفات شبيهة بمتطوعين من المملكة؛ يحمِّل تعريفات طويلة من
     * Database\Seeders\Data\jordanian_volunteers.php
     *
     * كلمة المرور الافتراضية قبل التجميع: كلمة المرور المعقّمة — نفس المعيار المتّبع في UserFactory («password»).
     */
    public function run(): void
    {
        /** @var list<array{username: string, password: string, birthdate: string, city: string, gender: string, phone: string, bio: string, points: int, role: string}> $profiles */
        $profiles = require __DIR__.'/Data/jordanian_volunteers.php';

        $reserved = ['admin'];

        DB::transaction(function () use ($profiles, $reserved): void {
            foreach ($profiles as $attributes) {
                if (in_array(strtolower($attributes['username']), $reserved, true)) {
                    continue;
                }

                $plain = $attributes['password'];

                unset($attributes['password']);

                User::query()->updateOrCreate(
                    ['username' => $attributes['username']],
                    [
                        ...$attributes,
                        'password' => Hash::make($plain),
                    ],
                );
            }
        });

        $this->command?->info('تم تهيئة/تحديث '.count($profiles).' مستخدمًا من بيانات الأردن التجريبية.');
    }
}
