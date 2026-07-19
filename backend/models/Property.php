<?php

declare(strict_types=1);

namespace app\models;

use yii\db\ActiveRecord;

/**
 * Property aggregate (docs/04 §8.1, docs/07 §5). Property = the asset.
 *
 * @property int $id
 * @property string $uuid
 * @property int $owner_id
 * @property string $property_type
 * @property string $intent
 * @property string $status
 * @property string $availability
 */
class Property extends ActiveRecord
{
    public const TYPES = ['RESIDENTIAL', 'COMMERCIAL', 'LAND'];   // D-2
    public const INTENTS = ['SALE', 'RENT'];

    // lifecycle states (docs/07 §5)
    public const DRAFT = 'DRAFT';
    public const SUBMITTED = 'SUBMITTED';
    public const IN_VERIFICATION = 'IN_VERIFICATION';
    public const RE_VERIFICATION = 'RE_VERIFICATION';
    public const INFO_REQUESTED = 'INFO_REQUESTED';
    public const VERIFIED = 'VERIFIED';
    public const REJECTED = 'REJECTED';
    public const PUBLISHED = 'PUBLISHED';
    public const UNPUBLISHED = 'UNPUBLISHED';
    public const CLOSED = 'CLOSED';
    public const ARCHIVED = 'ARCHIVED';

    public static function tableName(): string
    {
        return 'properties';
    }

    public function rules(): array
    {
        return [
            [['property_type', 'intent', 'title'], 'required'],
            [['property_type'], 'in', 'range' => self::TYPES],
            [['intent'], 'in', 'range' => self::INTENTS],
            [['title'], 'string', 'max' => 160],
            [['description', 'address_line'], 'string'],
            [['price_minor', 'deposit_minor', 'locality_id'], 'integer'],
            [['geo_lat', 'geo_lng', 'area_value'], 'number'],
            [['attributes_json'], 'safe'],
        ];
    }

    public function isEditableByOwner(): bool
    {
        return in_array($this->status, [self::DRAFT, self::INFO_REQUESTED, self::REJECTED], true);
    }

    /** Public projection — NEVER includes owner PII or documents (docs/08 BR, docs/10). */
    public function publicView(): array
    {
        return [
            'id' => $this->uuid,
            'type' => $this->property_type,
            'intent' => $this->intent,
            'title' => $this->title,
            'description' => $this->description,
            'localityId' => $this->locality_id,
            'address' => $this->address_line,
            'geo' => ($this->geo_lat !== null) ? ['lat' => (float) $this->geo_lat, 'lng' => (float) $this->geo_lng] : null,
            'price' => $this->price_minor !== null ? ['amountMinor' => (int) $this->price_minor, 'currency' => $this->currency] : null,
            'deposit' => $this->deposit_minor !== null ? ['amountMinor' => (int) $this->deposit_minor, 'currency' => $this->currency] : null,
            'area' => $this->area_value !== null ? ['value' => (float) $this->area_value, 'unit' => $this->area_unit] : null,
            'attributes' => $this->attributes_json,
            'availability' => $this->availability,
        ];
    }

    /** Owner-facing view (adds status; still no docs). */
    public function ownerView(): array
    {
        return $this->publicView() + ['status' => $this->status, 'ownerId' => null];
    }
}
