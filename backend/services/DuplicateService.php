<?php

declare(strict_types=1);

namespace app\services;

use app\models\Property;

/**
 * On-demand duplicate detection (docs/07 §8, Trust context). Heuristic scoring —
 * no ML/tables yet; surfaces likely duplicates for a human to adjudicate.
 */
final class DuplicateService
{
    public const THRESHOLD = 55;

    private const EXCLUDE = [Property::REJECTED, Property::ARCHIVED, Property::DRAFT];

    /** @return array<int,array{property:Property,score:int,reasons:string[]}> */
    public static function candidates(Property $p, int $limit = 8): array
    {
        $pool = Property::find()
            ->where(['locality_id' => $p->locality_id])
            ->andWhere(['not in', 'status', self::EXCLUDE])
            ->andWhere(['<>', 'id', $p->id])
            ->limit(80)->all();

        $out = [];
        foreach ($pool as $q) {
            [$score, $reasons] = self::score($p, $q);
            if ($score >= self::THRESHOLD) {
                $out[] = ['property' => $q, 'score' => $score, 'reasons' => $reasons];
            }
        }
        usort($out, static fn ($a, $b) => $b['score'] <=> $a['score']);
        return array_slice($out, 0, $limit);
    }

    /** @return array<int,array{a:Property,b:Property,score:int,reasons:string[]}> */
    public static function scanAll(int $limit = 40): array
    {
        $props = Property::find()->where(['not in', 'status', self::EXCLUDE])->limit(250)->all();
        $pairs = [];
        $n = count($props);
        for ($i = 0; $i < $n; $i++) {
            for ($k = $i + 1; $k < $n; $k++) {
                $a = $props[$i];
                $b = $props[$k];
                if ($a->locality_id === null || $a->locality_id !== $b->locality_id) {
                    continue;
                }
                [$score, $reasons] = self::score($a, $b);
                if ($score >= self::THRESHOLD) {
                    $pairs[] = ['a' => $a, 'b' => $b, 'score' => $score, 'reasons' => $reasons];
                }
            }
        }
        usort($pairs, static fn ($x, $y) => $y['score'] <=> $x['score']);
        return array_slice($pairs, 0, $limit);
    }

    /** @return array{0:int,1:string[]} */
    private static function score(Property $a, Property $b): array
    {
        $score = 0;
        $reasons = [];

        if ($a->locality_id !== null && $a->locality_id === $b->locality_id) {
            $score += 25;
            $reasons[] = 'same locality';
        }
        $t = 0.0;
        similar_text(strtolower($a->title), strtolower($b->title), $t);
        if ($t >= 45) {
            $score += (int) round($t * 0.35);
            $reasons[] = 'similar title (' . round($t) . '%)';
        }
        $ad = 0.0;
        similar_text(strtolower((string) $a->address_line), strtolower((string) $b->address_line), $ad);
        if ($ad >= 55 && $a->address_line) {
            $score += (int) round($ad * 0.15);
            $reasons[] = 'similar address';
        }
        if ($a->area_value && $b->area_value) {
            $diff = abs((float) $a->area_value - (float) $b->area_value) / max((float) $a->area_value, 1);
            if ($diff <= 0.12) {
                $score += 12;
                $reasons[] = 'area within 12%';
            }
        }
        if ($a->price_minor && $b->price_minor) {
            $pd = abs((int) $a->price_minor - (int) $b->price_minor) / max((int) $a->price_minor, 1);
            if ($pd <= 0.15) {
                $score += 15;
                $reasons[] = 'price within 15%';
            }
        }
        if ($a->property_type === $b->property_type && $a->intent === $b->intent) {
            $score += 10;
            $reasons[] = 'same type & intent';
        }
        if ($a->pincode && $a->pincode === $b->pincode) {
            $score += 8;
            $reasons[] = 'same pincode';
        }

        return [min(100, $score), $reasons];
    }
}
