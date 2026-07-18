<?php

declare(strict_types=1);

namespace app\models;

use yii\db\ActiveRecord;

/**
 * VerificationCase aggregate (docs/04 §8.3, docs/07 §6).
 *
 * @property int $id
 * @property int $property_id
 * @property int $owner_id
 * @property string $state
 * @property int|null $assigned_verifier_id
 * @property string|null $decision
 */
class VerificationCase extends ActiveRecord
{
    // states (docs/07 §6.1)
    public const UNCLAIMED = 'UNCLAIMED';
    public const CLAIMED = 'CLAIMED';
    public const DOC_REVIEW = 'DOC_REVIEW';
    public const ID_CHECK = 'ID_CHECK';
    public const OWNER_CALL = 'OWNER_CALL';
    public const INFO_REQUESTED = 'INFO_REQUESTED';
    public const DECIDED = 'DECIDED';

    public const OPEN_STATES = [
        self::UNCLAIMED, self::CLAIMED, self::DOC_REVIEW,
        self::ID_CHECK, self::OWNER_CALL, self::INFO_REQUESTED,
    ];

    /** Baseline checklist per property type (docs/07 §6.3). item_key => mandatory. */
    public const CHECKLIST = [
        'RESIDENTIAL' => [
            'ownership_doc_present' => true,
            'ownership_doc_name_match' => true,
            'identity_verified' => true,
            'address_matches_docs' => true,
            'photos_match' => true,
            'price_sanity' => true,
            'owner_reachable_confirmed' => true,
            'no_duplicate_conflict' => true,
        ],
        'COMMERCIAL' => [
            'ownership_doc_present' => true,
            'ownership_doc_name_match' => true,
            'identity_verified' => true,
            'address_matches_docs' => true,
            'photos_match' => true,
            'price_sanity' => true,
            'owner_reachable_confirmed' => true,
            'usage_permission' => true,
            'no_duplicate_conflict' => true,
        ],
        'LAND' => [
            'ownership_doc_present' => true,
            'ownership_doc_name_match' => true,
            'identity_verified' => true,
            'address_matches_docs' => true,
            'price_sanity' => true,
            'owner_reachable_confirmed' => true,
            'title_encumbrance_indication' => true,
            'no_duplicate_conflict' => true,
        ],
    ];

    public static function tableName(): string
    {
        return 'verification_cases';
    }

    public static function checklistFor(string $type): array
    {
        return self::CHECKLIST[$type] ?? self::CHECKLIST['RESIDENTIAL'];
    }
}
