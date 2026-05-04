<?php

namespace App\Enums;

enum CollaborationSector: string
{
    case University = 'university';
    case Government = 'government';
    case PublicSector = 'public_sector';
    case PrivateSector = 'private_sector';
    case B2b = 'b2b';

    public function label(): string
    {
        return match ($this) {
            self::University => 'Universities',
            self::Government => 'Government',
            self::PublicSector => 'Public sector',
            self::PrivateSector => 'Private sector',
            self::B2b => 'B2B',
        };
    }
}
