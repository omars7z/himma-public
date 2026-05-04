<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'username' => $this->usernameRules($userId),
        ];
    }

    /**
     * Get the validation rules used during registration (profile + extra required fields).
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function registrationProfileRules(): array
    {
        return [
            'username' => $this->usernameRules(),
            'city' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/^[0-9]{7,10}$/'],
            'gender' => ['required', 'string', Rule::in(['male', 'female'])],
            'birthdate' => [
                'required',
                'date',
                'before_or_equal:'.now()->subYears(18)->toDateString(),
                'after_or_equal:'.now()->subYears(30)->toDateString(),
            ],
        ];
    }

    /**
     * Get the validation rules used to validate usernames.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function usernameRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'min:3',
            'max:30',
            'regex:/^[a-zA-Z0-9_]+$/',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
