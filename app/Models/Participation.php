<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

#[Fillable([
    'user_id',
    'initiative_id',
    'status',
    'points_awarded',
])]
class Participation extends Model
{
    /** نقاط تُخصم من رصيد المستخدم عند الانسحاب قبل تسجيل الحضور (لا يُنقص الرصيد عن الصفر). */
    public const WITHDRAWAL_PENALTY_POINTS = 10;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'points_awarded' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function initiative(): BelongsTo
    {
        return $this->belongsTo(Initiative::class);
    }

    /**
     * Marks this participation as attended, credits the user's balance from the
     * initiative's {@see Initiative::$creation_points}, and stores a snapshot in
     * {@see Participation::$points_awarded}. Idempotent when points were already awarded.
     */
    public function recordAttendance(): bool
    {
        return DB::transaction(function (): bool {
            /** @var self|null $locked */
            $locked = static::query()->whereKey($this->getKey())->lockForUpdate()->first();

            if ($locked === null || $locked->points_awarded !== null) {
                return false;
            }

            $initiative = $locked->initiative()->lockForUpdate()->firstOrFail();
            $points = $initiative->creation_points;

            $user = $locked->user()->lockForUpdate()->firstOrFail();

            if ($points > 0) {
                $user->increment('points', $points);
            }

            $locked->forceFill([
                'status' => 'attended',
                'points_awarded' => $points,
            ])->save();

            $this->setRawAttributes($locked->getAttributes());

            return true;
        });
    }
}
