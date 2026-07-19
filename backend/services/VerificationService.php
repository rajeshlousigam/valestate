<?php

declare(strict_types=1);

namespace app\services;

use app\components\Uuid;
use app\models\Listing;
use app\models\Property;
use app\models\User;
use app\models\VerificationCase;
use Yii;
use yii\helpers\Inflector;

/**
 * Single source of truth for verification state changes (docs/07).
 * Used by BOTH the REST API and the Yii2 admin console so the critical
 * publish-after-verify path (invariant I-2), conflict-of-interest guard and
 * audit trail can never diverge.
 */
final class VerificationService
{
    public const REASSIGN_ROLES = ['ops_manager', 'admin', 'super_admin'];

    /** Assigned verifier, or an ops/admin who may act on any case. */
    public static function assertCanAct(VerificationCase $case, User $actor): void
    {
        $assigned = (string) $case->assigned_verifier_id === (string) $actor->id;
        if (!$assigned && count(array_intersect(self::REASSIGN_ROLES, $actor->getRoleKeys())) === 0) {
            throw new ServiceException(ServiceException::FORBIDDEN, 'Not assigned to this case');
        }
    }

    /** Overturn/appeal + re-verification are ops-manager+ only (docs/07 §10, docs/12). */
    private static function requireReassign(User $actor): void
    {
        if (count(array_intersect(self::REASSIGN_ROLES, $actor->getRoleKeys())) === 0) {
            throw new ServiceException(ServiceException::FORBIDDEN, 'Requires Ops Manager or Admin');
        }
    }

    /** Re-open a DECIDED case (e.g. overturn a rejection) so it can be reviewed again. */
    public static function reopen(VerificationCase $case, User $actor): void
    {
        self::requireReassign($actor);
        if ($case->state !== VerificationCase::DECIDED) {
            throw new ServiceException(ServiceException::CONFLICT, 'Only a decided case can be re-opened');
        }
        $tx = Yii::$app->db->beginTransaction();
        try {
            $case->state = VerificationCase::CLAIMED;
            $case->assigned_verifier_id = $actor->id;
            $case->decision = null;
            $case->reason_code = null;
            $case->decision_note = null;
            $case->decided_at = null;
            $case->claimed_at = gmdate('Y-m-d H:i:s');
            $case->sla_due_at = gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['sla']['decideHours'] * 3600);
            $case->save(false);
            Property::updateAll(['status' => Property::IN_VERIFICATION], ['id' => $case->property_id]);
            self::event($case->id, VerificationCase::DECIDED, VerificationCase::CLAIMED, $actor->uuid, 'REOPENED');
            OutboxService::emit('VerificationCase', (string) $case->id, 'Verification.CaseReopened', ['caseId' => (int) $case->id]);
            AuditService::log($actor->uuid, 'verification.reopen', 'VerificationCase', (string) $case->id);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    /** Re-verify a PUBLISHED property: hide the listing and put it back in the queue (docs/07 §9). */
    public static function reverify(Property $p, User $actor): VerificationCase
    {
        self::requireReassign($actor);
        if (!in_array($p->status, [Property::PUBLISHED, Property::UNPUBLISHED], true)) {
            throw new ServiceException(ServiceException::CONFLICT, 'Only a published property can be re-verified');
        }
        $tx = Yii::$app->db->beginTransaction();
        try {
            $now = gmdate('Y-m-d H:i:s');
            $listing = Listing::findOne(['property_id' => $p->id]);
            if ($listing && $listing->visibility === Listing::PUBLIC) {
                $listing->visibility = Listing::HIDDEN;
                $listing->unpublished_at = $now;
                $listing->save(false);
                OutboxService::emit('Listing', $listing->uuid, 'Publication.ListingUnpublished', ['slug' => $listing->slug, 'reason' => 'RE_VERIFICATION']);
            }
            $p->status = Property::RE_VERIFICATION;
            $p->save(false);

            $case = VerificationCase::find()->where(['property_id' => $p->id])->orderBy(['id' => SORT_DESC])->one();
            if ($case) {
                $case->state = VerificationCase::CLAIMED;
                $case->assigned_verifier_id = $actor->id;
                $case->decision = null;
                $case->reason_code = null;
                $case->decided_at = null;
                $case->claimed_at = $now;
                $case->sla_due_at = gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['sla']['decideHours'] * 3600);
                $case->save(false);
                self::event($case->id, VerificationCase::DECIDED, VerificationCase::CLAIMED, $actor->uuid, 'REVERIFY');
            } else {
                $case = new VerificationCase();
                $case->property_id = $p->id;
                $case->owner_id = $p->owner_id;
                $case->state = VerificationCase::CLAIMED;
                $case->assigned_verifier_id = $actor->id;
                $case->claimed_at = $now;
                $case->sla_due_at = gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['sla']['decideHours'] * 3600);
                $case->save(false);
                foreach (VerificationCase::checklistFor($p->property_type) as $key => $mandatory) {
                    Yii::$app->db->createCommand()->insert('verification_checklist_items', [
                        'case_id' => $case->id, 'item_key' => $key, 'mandatory' => $mandatory ? 1 : 0, 'result' => 'PENDING',
                    ])->execute();
                }
                self::event($case->id, null, VerificationCase::CLAIMED, $actor->uuid, 'REVERIFY');
            }
            OutboxService::emit('VerificationCase', (string) $case->id, 'Verification.ReverificationStarted', ['propertyId' => $p->uuid]);
            AuditService::log($actor->uuid, 'verification.reverify', 'Property', $p->uuid);
            $tx->commit();
            return $case;
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    public static function claim(VerificationCase $case, User $actor): void
    {
        if ($case->state !== VerificationCase::UNCLAIMED) {
            throw new ServiceException(ServiceException::CONFLICT, "Case is {$case->state}, cannot claim");
        }
        if ((string) $case->owner_id === (string) $actor->id) {
            throw new ServiceException(ServiceException::FORBIDDEN, 'Conflict of interest: cannot verify your own property');
        }
        $tx = Yii::$app->db->beginTransaction();
        try {
            $case->state = VerificationCase::CLAIMED;
            $case->assigned_verifier_id = $actor->id;
            $case->claimed_at = gmdate('Y-m-d H:i:s');
            $case->sla_due_at = gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['sla']['decideHours'] * 3600);
            $case->save(false);
            Property::updateAll(['status' => Property::IN_VERIFICATION], ['id' => $case->property_id]);
            self::event($case->id, VerificationCase::UNCLAIMED, VerificationCase::CLAIMED, $actor->uuid);
            OutboxService::emit('VerificationCase', (string) $case->id, 'Verification.CaseClaimed', ['caseId' => (int) $case->id]);
            AuditService::log($actor->uuid, 'verification.claim', 'VerificationCase', (string) $case->id);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    /** @param array<int,array{itemKey?:string,result?:string,note?:string}> $items */
    public static function saveChecklist(VerificationCase $case, array $items, User $actor): void
    {
        self::assertCanAct($case, $actor);
        foreach ($items as $item) {
            if (!isset($item['itemKey'], $item['result'])) {
                continue;
            }
            if (!in_array($item['result'], ['PASS', 'FAIL', 'NA', 'PENDING'], true)) {
                throw new ServiceException(ServiceException::UNPROCESSABLE, 'Invalid checklist result', [['field' => 'result', 'issue' => 'invalid for ' . $item['itemKey']]]);
            }
            Yii::$app->db->createCommand()->update('verification_checklist_items', [
                'result' => $item['result'],
                'note' => $item['note'] ?? null,
                'updated_by' => $actor->id,
                'updated_at' => gmdate('Y-m-d H:i:s'),
            ], ['case_id' => $case->id, 'item_key' => $item['itemKey']])->execute();
        }
    }

    public static function requestInfo(VerificationCase $case, ?string $reason, ?string $note, User $actor): void
    {
        self::assertCanAct($case, $actor);
        $tx = Yii::$app->db->beginTransaction();
        try {
            $from = $case->state;
            $case->state = VerificationCase::INFO_REQUESTED;
            $case->save(false);
            Property::updateAll(['status' => Property::INFO_REQUESTED], ['id' => $case->property_id]);
            self::event($case->id, $from, VerificationCase::INFO_REQUESTED, $actor->uuid, $reason);
            $p = Property::findOne(['id' => $case->property_id]);
            OutboxService::emit('VerificationCase', (string) $case->id, 'Verification.InfoRequested', [
                'propertyId' => $p?->uuid, 'reasonCode' => $reason, 'note' => $note,
            ]);
            AuditService::log($actor->uuid, 'verification.request_info', 'VerificationCase', (string) $case->id, ['reasonCode' => (string) $reason]);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    /**
     * Approve (publishes a Listing) or Reject (with reason code).
     * @return array{decision:string,slug?:string,reasonCode?:string,propertyStatus:string}
     */
    public static function decide(VerificationCase $case, string $decision, ?string $reason, ?string $note, User $actor): array
    {
        self::assertCanAct($case, $actor);
        if ($case->state === VerificationCase::DECIDED) {
            throw new ServiceException(ServiceException::CONFLICT, 'Case already decided');
        }
        if ((string) $case->owner_id === (string) $actor->id) {
            throw new ServiceException(ServiceException::FORBIDDEN, 'Conflict of interest');
        }
        $decision = strtoupper($decision);
        if (!in_array($decision, ['APPROVED', 'REJECTED'], true)) {
            throw new ServiceException(ServiceException::UNPROCESSABLE, 'Invalid decision', [['field' => 'decision', 'issue' => 'must be APPROVED or REJECTED']]);
        }
        $p = Property::findOne(['id' => $case->property_id]);
        if (!$p) {
            throw new ServiceException(ServiceException::NOT_FOUND, 'Property not found');
        }

        if ($decision === 'APPROVED') {
            $pending = (new \yii\db\Query())->from('verification_checklist_items')
                ->where(['case_id' => $case->id, 'mandatory' => 1])
                ->andWhere(['not', ['result' => 'PASS']])->count();
            if ((int) $pending > 0) {
                throw new ServiceException(ServiceException::UNPROCESSABLE, 'Cannot approve', [['field' => 'checklist', 'issue' => "{$pending} mandatory item(s) not PASS"]]);
            }
            return self::approve($case, $p, $note, $actor);
        }

        if (!$reason) {
            throw new ServiceException(ServiceException::UNPROCESSABLE, 'Reason required', [['field' => 'reasonCode', 'issue' => 'required for rejection']]);
        }
        return self::reject($case, $p, $reason, $note, $actor);
    }

    private static function approve(VerificationCase $case, Property $p, ?string $note, User $actor): array
    {
        $tx = Yii::$app->db->beginTransaction();
        try {
            $now = gmdate('Y-m-d H:i:s');
            $case->state = VerificationCase::DECIDED;
            $case->decision = 'APPROVED';
            $case->decision_note = $note;
            $case->decided_at = $now;
            $case->save(false);

            $p->status = Property::VERIFIED;
            $p->verified_at = $now;
            $p->save(false);

            // New listing on first approval; re-publish the existing one on a re-check.
            $listing = Listing::findOne(['property_id' => $p->id]);
            if ($listing === null) {
                $listing = new Listing();
                $listing->uuid = Uuid::v4();
                $listing->property_id = $p->id;
                $listing->slug = self::uniqueSlug($p);
                $listing->verification_tier = 'STANDARD';
                $listing->canonical_url = '/property/' . self::uniqueSlug($p);
            }
            $listing->visibility = Listing::PUBLIC;
            $listing->verified_at = $now;
            $listing->checks_performed_json = ['documents', 'identity', 'owner_call'];
            $listing->published_at = $now;
            $listing->unpublished_at = null;
            $listing->save(false);

            $p->status = Property::PUBLISHED;
            $p->published_at = $now;
            $p->save(false);

            self::event($case->id, VerificationCase::CLAIMED, VerificationCase::DECIDED, $actor->uuid);
            OutboxService::emit('Property', $p->uuid, 'Verification.PropertyVerified', ['propertyId' => $p->uuid]);
            OutboxService::emit('Listing', $listing->uuid, 'Publication.ListingPublished', [
                'slug' => $listing->slug, 'propertyId' => $p->uuid, 'localityId' => $p->locality_id,
            ]);
            AuditService::log($actor->uuid, 'verification.approve', 'VerificationCase', (string) $case->id);
            $tx->commit();
            return ['decision' => 'APPROVED', 'slug' => $listing->slug, 'propertyStatus' => $p->status];
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    private static function reject(VerificationCase $case, Property $p, string $reason, ?string $note, User $actor): array
    {
        $tx = Yii::$app->db->beginTransaction();
        try {
            $now = gmdate('Y-m-d H:i:s');
            $case->state = VerificationCase::DECIDED;
            $case->decision = 'REJECTED';
            $case->reason_code = $reason;
            $case->decision_note = $note;
            $case->decided_at = $now;
            $case->save(false);
            $p->status = Property::REJECTED;
            $p->save(false);
            self::event($case->id, VerificationCase::CLAIMED, VerificationCase::DECIDED, $actor->uuid, $reason);
            OutboxService::emit('Property', $p->uuid, 'Verification.PropertyRejected', ['propertyId' => $p->uuid, 'reasonCode' => $reason]);
            AuditService::log($actor->uuid, 'verification.reject', 'VerificationCase', (string) $case->id, ['reasonCode' => $reason]);
            $tx->commit();
            return ['decision' => 'REJECTED', 'reasonCode' => $reason, 'propertyStatus' => $p->status];
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    public static function uniqueSlug(Property $p): string
    {
        $base = Inflector::slug($p->title . ' ' . strtolower($p->property_type) . ' for ' . strtolower($p->intent));
        return substr($base, 0, 180) . '-' . substr($p->uuid, 0, 8);
    }

    private static function event(int|string $caseId, ?string $from, string $to, string $actorUuid, ?string $reason = null): void
    {
        Yii::$app->db->createCommand()->insert('verification_events', [
            'case_id' => $caseId, 'from_state' => $from, 'to_state' => $to,
            'actor_id' => $actorUuid, 'reason_code' => $reason,
        ])->execute();
    }
}
