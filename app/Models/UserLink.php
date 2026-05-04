<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'platform', 'url'])]
class UserLink extends Model
{
    public const PLATFORMS = ['linkedin', 'youtube', 'facebook', 'github'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
