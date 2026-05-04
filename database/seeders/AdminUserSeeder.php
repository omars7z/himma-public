<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'password' => Hash::make('Qw12as34zx56?'),
                'role' => 'admin',
                'points' => 0,
            ]
        );

        $this->command->info('تم إنشاء/تحديث حساب المدير: admin');
    }
}
