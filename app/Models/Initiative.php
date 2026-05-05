<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'starts_at',
    'city',
    'latitude',
    'longitude',
    'description',
    'min_participants',
    'max_participants',
    'created_by',
    'creation_points',
    'reviews_count',
    'reviews_average',
    'status',
])]
class Initiative extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'min_participants' => 'integer',
            'max_participants' => 'integer',
            'creation_points' => 'integer',
            'reviews_count' => 'integer',
            'reviews_average' => 'float',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participations(): HasMany
    {
        return $this->hasMany(Participation::class);
    }
}
