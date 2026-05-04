<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'username',
    'password',
    'points',
    'birthdate',
    'city',
    'gender',
    'phone',
    'bio',
    'image',
    'cover_image',
    'role',
    'status',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /** @var list<string> */
    protected $appends = ['avatar_url'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'points' => 'integer',
            'birthdate' => 'date',
        ];
    }

    public function createdInitiatives(): HasMany
    {
        return $this->hasMany(Initiative::class, 'created_by');
    }

    public function participations(): HasMany
    {
        return $this->hasMany(Participation::class);
    }

    public function links(): HasMany
    {
        return $this->hasMany(UserLink::class);
    }

    /**
     * Resolved cover URL: stored cover image (local or external URL) or null for default gradient.
     */
    protected function coverUrl(): Attribute
    {
        return Attribute::make(
            get: function (): ?string {
                if (! filled($this->cover_image)) {
                    return null;
                }

                if (str_starts_with($this->cover_image, 'http://') || str_starts_with($this->cover_image, 'https://')) {
                    return $this->cover_image;
                }

                return Storage::disk('public')->url($this->cover_image);
            },
        );
    }

    /**
     * Resolved avatar URL: stored image (local or external URL) or ui-avatars fallback from username.
     */
    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: function (): string {
                if (filled($this->image)) {
                    if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
                        return $this->image;
                    }

                    return Storage::disk('public')->url($this->image);
                }

                return sprintf(
                    'https://ui-avatars.com/api/?name=%s&background=228B22&color=FFFFFF&size=200',
                    rawurlencode($this->username)
                );
            },
        );
    }
}
