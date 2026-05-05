<?php

namespace App\Support;

/**
 * Builds public image URLs for reward cards (trusted remote or deterministic fallback).
 */
final class RewardImageUrl
{
    /**
     * @var list<int>
     */
    private const FALLBACK_PICSUM_IDS = [
        292, 429, 431, 593, 668, 742, 829, 865, 988, 1019,
    ];

    public static function resolve(?string $stored, int $rewardId): string
    {
        if (filled($stored) && self::isTrustedRemoteImageUrl($stored)) {
            return $stored;
        }

        return self::fallbackForId($rewardId);
    }

    private static function fallbackForId(int $rewardId): string
    {
        $ids = self::FALLBACK_PICSUM_IDS;
        $picsumId = $ids[$rewardId % count($ids)];

        return sprintf('https://picsum.photos/id/%d/800/600.jpg', $picsumId);
    }

    private static function isTrustedRemoteImageUrl(string $url): bool
    {
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $scheme = parse_url($url, PHP_URL_SCHEME);

        return in_array($scheme, ['http', 'https'], true);
    }
}
