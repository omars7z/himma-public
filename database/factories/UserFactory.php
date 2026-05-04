<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $cities = ['amman', 'zarqa', 'irbid', 'aqaba', 'madaba', 'alblat', 'mafraq', 'jerash', 'ajloun', 'karak', 'tafilah', 'maan'];

        return [
            'username' => fake()->unique()->userName(),
            'password' => Hash::make('password'),
            'birthdate' => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
            'city' => fake()->randomElement($cities),
            'gender' => fake()->randomElement(['male', 'female']),
            'phone' => fake()->numerify('07########'),
            'bio' => fake()->optional(0.7)->sentence(),
            'image' => null,
            'points' => fake()->numberBetween(0, 500),
            'role' => 'user',
        ];
    }

    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'admin',
        ]);
    }

    public function withPoints(int $points): static
    {
        return $this->state(fn (array $attributes) => [
            'points' => $points,
        ]);
    }
}
