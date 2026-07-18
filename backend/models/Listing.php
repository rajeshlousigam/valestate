<?php

declare(strict_types=1);

namespace app\models;

use yii\db\ActiveRecord;

/**
 * Listing = publishable offer of a verified Property (docs/04 §8.4).
 * Exists only for a VERIFIED property (invariant I-8, docs/08 §9).
 *
 * @property int $id
 * @property string $uuid
 * @property int $property_id
 * @property string $slug
 * @property string $visibility
 */
class Listing extends ActiveRecord
{
    public const PUBLIC = 'PUBLIC';
    public const HIDDEN = 'HIDDEN';

    public static function tableName(): string
    {
        return 'listings';
    }

    public function getProperty(): \yii\db\ActiveQuery
    {
        return $this->hasOne(Property::class, ['id' => 'property_id']);
    }

    /** Public listing view with trust signals (docs/07 §11, docs/16 §8) — no PII/docs. */
    public function publicView(Property $property): array
    {
        return [
            'slug' => $this->slug,
            'canonicalUrl' => $this->canonical_url,
            'property' => $property->publicView(),
            'trust' => [
                'verified' => true,
                'verifiedAt' => $this->verified_at,
                'tier' => $this->verification_tier,
                'checksPerformed' => $this->checks_performed_json,
            ],
            'publishedAt' => $this->published_at,
        ];
    }
}
