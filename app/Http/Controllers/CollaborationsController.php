<?php

namespace App\Http\Controllers;

use App\Enums\CollaborationSector;
use App\Models\Collaboration;
use Inertia\Inertia;
use Inertia\Response;

class CollaborationsController extends Controller
{
    public function collaborations(): Response
    {
        $collaborations = Collaboration::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $sections = collect(CollaborationSector::cases())
            ->map(function (CollaborationSector $sector) use ($collaborations): array {
                $items = $collaborations
                    ->filter(fn (Collaboration $c): bool => $c->sector === $sector)
                    ->values()
                    ->map(fn (Collaboration $c): array => [
                        'id' => $c->id,
                        'name' => $c->name,
                        'description' => $c->description,
                        'website_url' => $c->website_url,
                        'logo_url' => $c->logo_url,
                    ])
                    ->all();

                return [
                    'sector' => $sector->value,
                    'label' => $sector->label(),
                    'collaborators' => $items,
                ];
            })
            ->all();

        return Inertia::render('collaborations', [
            'sections' => $sections,
        ]);
    }
}
