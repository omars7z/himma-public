<?php

namespace App\Models;

use App\Enums\CollaborationSector;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'name',
    'sector',
    'description',
    'website_url',
    'logo_url',
    'sort_order',
])]
class Collaboration extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sector' => CollaborationSector::class,
            'sort_order' => 'integer',
        ];
    }
}
