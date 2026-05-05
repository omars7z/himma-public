<?php

namespace Database\Seeders;

use App\Models\Initiative;
use App\Models\Reward;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::factory()->admin()->create([
            'username' => 'admin',
            'password' => Hash::make('Qw12as34zx56?'),
            'points' => 0,
        ]);

        $this->call(JordanianPeopleSeeder::class);

        $allUsers = User::query()->get();

        Initiative::factory(15)->approved()->recycle($allUsers)->create();
        Initiative::factory(15)->recycle($allUsers)->create();

        Reward::factory(10)->create();
    }
}
