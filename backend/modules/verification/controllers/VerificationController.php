<?php

declare(strict_types=1);

namespace app\modules\verification\controllers;

use app\components\BaseApiController;
use app\components\Uuid;
use app\models\Listing;
use app\models\Property;
use app\models\User;
use app\models\VerificationCase;
use app\services\AuditService;
use app\services\OutboxService;
use app\services\StorageService;
use Yii;
use yii\helpers\Inflector;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\Response;

/**
 * Ops verification console API (docs/07, docs/09 §8.3, docs/18).
 */
class VerificationController extends BaseApiController
{
    private const OPS_ROLES = ['verifier', 'ops_manager', 'admin', 'super_admin'];
    private const REASSIGN_ROLES = ['ops_manager', 'admin', 'super_admin'];

    public function beforeAction($action): bool
    {
        if (!parent::beforeAction($action)) {
            return false;
        }
        $this->requireAnyRole(self::OPS_ROLES);
        return true;
    }

    public function actionQueue(): array
    {
        $rows = (new \yii\db\Query())
            ->select([
                'vc.id', 'vc.state', 'vc.sla_due_at', 'vc.assigned_verifier_id',
                'p.uuid AS propertyUuid', 'p.property_type', 'p.intent', 'p.title',
            ])
            ->from('verification_cases vc')
            ->innerJoin('properties p', 'p.id = vc.property_id')
            ->where(['vc.state' => VerificationCase::OPEN_STATES])
            ->orderBy(['FIELD(vc.state, "UNCLAIMED")' => SORT_DESC, 'vc.sla_due_at' => SORT_ASC])
            ->all();
        return $this->ok(array_map(static fn ($r) => [
            'caseId' => (int) $r['id'],
            'state' => $r['state'],
            'slaDueAt' => $r['sla_due_at'],
            'assignedTo' => $r['assigned_verifier_id'] !== null ? (int) $r['assigned_verifier_id'] : null,
            'property' => [
                'id' => $r['propertyUuid'], 'type' => $r['property_type'],
                'intent' => $r['intent'], 'title' => $r['title'],
            ],
        ], $rows));
    }

    public function actionClaim(int $id): array
    {
        $case = $this->case($id);
        if ($case->state !== VerificationCase::UNCLAIMED) {
            return $this->conflict("Case is {$case->state}, cannot claim");
        }
        // conflict of interest (docs/03 BR-03.2, docs/07 I-7)
        if ($case->owner_id === $this->user()->id) {
            throw new ForbiddenHttpException('Conflict of interest: cannot verify your own property');
        }

        $tx = Yii::$app->db->beginTransaction();
        try {
            $case->state = VerificationCase::CLAIMED;
            $case->assigned_verifier_id = $this->user()->id;
            $case->claimed_at = gmdate('Y-m-d H:i:s');
            $case->sla_due_at = gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['sla']['decideHours'] * 3600);
            $case->save(false);
            Property::updateAll(['status' => Property::IN_VERIFICATION], ['id' => $case->property_id]);
            $this->event($case->id, VerificationCase::UNCLAIMED, VerificationCase::CLAIMED, $this->user()->uuid);
            OutboxService::emit('VerificationCase', (string) $case->id, 'Verification.CaseClaimed', ['caseId' => (int) $case->id]);
            AuditService::log($this->user()->uuid, 'verification.claim', 'VerificationCase', (string) $case->id);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
        return $this->ok(['caseId' => (int) $case->id, 'state' => $case->state]);
    }

    public function actionView(int $id): array
    {
        $case = $this->case($id);
        $this->assertAssignedOrOps($case);
        $p = Property::findOne(['id' => $case->property_id]);
        $owner = User::findOne(['id' => $case->owner_id]);
        $checklist = (new \yii\db\Query())->from('verification_checklist_items')
            ->where(['case_id' => $case->id])->orderBy(['id' => SORT_ASC])->all();
        $docs = (new \yii\db\Query())->from('documents')->where(['property_id' => $p->id])
            ->select(['id', 'doc_type', 'uploaded_at'])->all();

        return $this->ok([
            'caseId' => (int) $case->id,
            'state' => $case->state,
            'slaDueAt' => $case->sla_due_at,
            'property' => $p->ownerView() + ['id' => $p->uuid],
            // Owner contact is visible to the assigned verifier for the D-4 call (docs/03 §8.4)
            'owner' => ['name' => $owner->name, 'phone' => $owner->phone, 'email' => $owner->email],
            'checklist' => array_map(static fn ($c) => [
                'itemKey' => $c['item_key'], 'mandatory' => (bool) $c['mandatory'],
                'result' => $c['result'], 'note' => $c['note'],
            ], $checklist),
            'documents' => $docs, // metadata only; content via audited access endpoint
        ]);
    }

    /** Audited sensitive-document access (docs/10 §7). Returns the file stream. */
    public function actionDocumentAccess(int $id, int $docId): Response
    {
        $case = $this->case($id);
        $this->assertAssignedOrOps($case);
        $doc = (new \yii\db\Query())->from('documents')
            ->where(['id' => $docId, 'property_id' => $case->property_id])->one();
        if (!$doc) {
            throw new NotFoundHttpException('Document not found');
        }
        $path = StorageService::absPath(StorageService::PRIVATE, $doc['storage_key']);
        if (!is_file($path)) {
            throw new NotFoundHttpException('Document content missing');
        }
        // MANDATORY audit of every sensitive-doc access (docs/07 BR-07.4, docs/10)
        AuditService::log($this->user()->uuid, 'document.access', 'Document', (string) $docId, [
            'caseId' => (int) $case->id, 'docType' => $doc['doc_type'],
        ]);
        return Yii::$app->response->sendFile($path, 'document-' . $docId, ['inline' => true]);
    }

    public function actionChecklist(int $id): array
    {
        $case = $this->case($id);
        $this->assertAssignedOrOps($case);
        $items = $this->body()['items'] ?? [];
        foreach ($items as $item) {
            if (!isset($item['itemKey'], $item['result'])) {
                continue;
            }
            if (!in_array($item['result'], ['PASS', 'FAIL', 'NA', 'PENDING'], true)) {
                return $this->unprocessable([['field' => 'result', 'issue' => 'invalid for ' . $item['itemKey']]]);
            }
            Yii::$app->db->createCommand()->update('verification_checklist_items', [
                'result' => $item['result'],
                'note' => $item['note'] ?? null,
                'updated_by' => $this->user()->id,
                'updated_at' => gmdate('Y-m-d H:i:s'),
            ], ['case_id' => $case->id, 'item_key' => $item['itemKey']])->execute();
        }
        return $this->actionView($id);
    }

    public function actionRequestInfo(int $id): array
    {
        $case = $this->case($id);
        $this->assertAssignedOrOps($case);
        $reason = $this->body()['reasonCode'] ?? null;
        $note = $this->body()['note'] ?? null;

        $tx = Yii::$app->db->beginTransaction();
        try {
            $from = $case->state;
            $case->state = VerificationCase::INFO_REQUESTED;
            $case->save(false);
            Property::updateAll(['status' => Property::INFO_REQUESTED], ['id' => $case->property_id]);
            $this->event($case->id, $from, VerificationCase::INFO_REQUESTED, $this->user()->uuid, $reason);
            $p = Property::findOne(['id' => $case->property_id]);
            OutboxService::emit('VerificationCase', (string) $case->id, 'Verification.InfoRequested', [
                'propertyId' => $p->uuid, 'reasonCode' => $reason, 'note' => $note,
            ]);
            AuditService::log($this->user()->uuid, 'verification.request_info', 'VerificationCase', (string) $case->id, ['reasonCode' => $reason]);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
        return $this->ok(['caseId' => (int) $case->id, 'state' => $case->state]);
    }

    /** Approve/Reject (docs/07 §6.4). Core invariant: publish only after approve (I-2). */
    public function actionDecision(int $id): array
    {
        $case = $this->case($id);
        $this->assertAssignedOrOps($case);
        if ($case->state === VerificationCase::DECIDED) {
            return $this->conflict('Case already decided');
        }
        if ($case->owner_id === $this->user()->id) {
            throw new ForbiddenHttpException('Conflict of interest');
        }

        $decision = strtoupper((string) ($this->body()['decision'] ?? ''));
        $reason = $this->body()['reasonCode'] ?? null;
        $note = $this->body()['note'] ?? null;
        if (!in_array($decision, ['APPROVED', 'REJECTED'], true)) {
            return $this->unprocessable([['field' => 'decision', 'issue' => 'must be APPROVED or REJECTED']]);
        }

        $p = Property::findOne(['id' => $case->property_id]);

        if ($decision === 'APPROVED') {
            $pending = (new \yii\db\Query())->from('verification_checklist_items')
                ->where(['case_id' => $case->id, 'mandatory' => 1])
                ->andWhere(['not', ['result' => 'PASS']])->count();
            if ((int) $pending > 0) {
                return $this->unprocessable([['field' => 'checklist', 'issue' => "{$pending} mandatory item(s) not PASS"]], 'Cannot approve');
            }
            return $this->approve($case, $p, $note);
        }

        if (!$reason) {
            return $this->unprocessable([['field' => 'reasonCode', 'issue' => 'required for rejection']]);
        }
        return $this->reject($case, $p, $reason, $note);
    }

    private function approve(VerificationCase $case, Property $p, ?string $note): array
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

            $listing = new Listing();
            $listing->uuid = Uuid::v4();
            $listing->property_id = $p->id;
            $listing->slug = $this->uniqueSlug($p);
            $listing->visibility = Listing::PUBLIC;
            $listing->verified_at = $now;
            $listing->verification_tier = 'STANDARD';
            $listing->checks_performed_json = ['documents', 'identity', 'owner_call']; // D-4
            $listing->published_at = $now;
            $listing->canonical_url = '/property/' . $listing->slug;
            $listing->save(false);

            $p->status = Property::PUBLISHED;
            $p->published_at = $now;
            $p->save(false);

            $this->event($case->id, VerificationCase::CLAIMED, VerificationCase::DECIDED, $this->user()->uuid);
            OutboxService::emit('Property', $p->uuid, 'Verification.PropertyVerified', ['propertyId' => $p->uuid]);
            OutboxService::emit('Listing', $listing->uuid, 'Publication.ListingPublished', [
                'slug' => $listing->slug, 'propertyId' => $p->uuid, 'localityId' => $p->locality_id,
            ]);
            AuditService::log($this->user()->uuid, 'verification.approve', 'VerificationCase', (string) $case->id);
            $tx->commit();
            return $this->ok(['caseId' => (int) $case->id, 'decision' => 'APPROVED', 'slug' => $listing->slug, 'propertyStatus' => $p->status]);
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    private function reject(VerificationCase $case, Property $p, string $reason, ?string $note): array
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
            $this->event($case->id, VerificationCase::CLAIMED, VerificationCase::DECIDED, $this->user()->uuid, $reason);
            OutboxService::emit('Property', $p->uuid, 'Verification.PropertyRejected', ['propertyId' => $p->uuid, 'reasonCode' => $reason]);
            AuditService::log($this->user()->uuid, 'verification.reject', 'VerificationCase', (string) $case->id, ['reasonCode' => $reason]);
            $tx->commit();
            return $this->ok(['caseId' => (int) $case->id, 'decision' => 'REJECTED', 'reasonCode' => $reason, 'propertyStatus' => $p->status]);
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
    }

    // ---- helpers ----

    private function case(int $id): VerificationCase
    {
        $case = VerificationCase::findOne(['id' => $id]);
        if (!$case) {
            throw new NotFoundHttpException('Verification case not found');
        }
        return $case;
    }

    private function assertAssignedOrOps(VerificationCase $case): void
    {
        $isAssigned = $case->assigned_verifier_id === $this->user()->id;
        if (!$isAssigned && !$this->hasAnyRole(self::REASSIGN_ROLES)) {
            throw new ForbiddenHttpException('Not assigned to this case');
        }
    }

    private function uniqueSlug(Property $p): string
    {
        $base = Inflector::slug($p->title . ' ' . strtolower($p->property_type) . ' for ' . strtolower($p->intent));
        $slug = substr($base, 0, 180) . '-' . substr($p->uuid, 0, 8);
        return $slug;
    }

    private function event(int|string $caseId, ?string $from, string $to, string $actorUuid, ?string $reason = null): void
    {
        Yii::$app->db->createCommand()->insert('verification_events', [
            'case_id' => $caseId, 'from_state' => $from, 'to_state' => $to,
            'actor_id' => $actorUuid, 'reason_code' => $reason,
        ])->execute();
    }
}
