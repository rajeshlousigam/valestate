<?php

declare(strict_types=1);

namespace app\modules\verification\controllers;

use app\components\BaseApiController;
use app\models\Property;
use app\models\User;
use app\models\VerificationCase;
use app\services\AuditService;
use app\services\ServiceException;
use app\services\StorageService;
use app\services\VerificationService;
use Yii;
use yii\web\NotFoundHttpException;
use yii\web\Response;

/**
 * Ops verification console API (docs/07, docs/09 §8.3).
 * State changes delegate to VerificationService (shared with the admin console).
 */
class VerificationController extends BaseApiController
{
    private const OPS_ROLES = ['verifier', 'ops_manager', 'admin', 'super_admin'];

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
        try {
            VerificationService::claim($case, $this->user());
        } catch (ServiceException $e) {
            return $this->serviceError($e);
        }
        return $this->ok(['caseId' => (int) $case->id, 'state' => $case->state]);
    }

    public function actionView(int $id): array
    {
        $case = $this->case($id);
        try {
            VerificationService::assertCanAct($case, $this->user());
        } catch (ServiceException $e) {
            return $this->serviceError($e);
        }
        return $this->ok($this->caseDetail($case));
    }

    public function actionChecklist(int $id): array
    {
        $case = $this->case($id);
        try {
            VerificationService::saveChecklist($case, $this->body()['items'] ?? [], $this->user());
        } catch (ServiceException $e) {
            return $this->serviceError($e);
        }
        return $this->ok($this->caseDetail($case));
    }

    public function actionRequestInfo(int $id): array
    {
        $case = $this->case($id);
        try {
            VerificationService::requestInfo($case, $this->body()['reasonCode'] ?? null, $this->body()['note'] ?? null, $this->user());
        } catch (ServiceException $e) {
            return $this->serviceError($e);
        }
        return $this->ok(['caseId' => (int) $case->id, 'state' => $case->state]);
    }

    public function actionDecision(int $id): array
    {
        $case = $this->case($id);
        try {
            $result = VerificationService::decide(
                $case,
                (string) ($this->body()['decision'] ?? ''),
                $this->body()['reasonCode'] ?? null,
                $this->body()['note'] ?? null,
                $this->user(),
            );
        } catch (ServiceException $e) {
            return $this->serviceError($e);
        }
        return $this->ok(['caseId' => (int) $case->id] + $result);
    }

    /** Audited sensitive-document access (docs/10 §7). Returns the file stream. */
    public function actionDocumentAccess(int $id, int $docId): Response|array
    {
        $case = $this->case($id);
        try {
            VerificationService::assertCanAct($case, $this->user());
        } catch (ServiceException $e) {
            return $this->serviceError($e);
        }
        $doc = (new \yii\db\Query())->from('documents')
            ->where(['id' => $docId, 'property_id' => $case->property_id])->one();
        if (!$doc) {
            throw new NotFoundHttpException('Document not found');
        }
        $path = StorageService::absPath(StorageService::PRIVATE, $doc['storage_key']);
        if (!is_file($path)) {
            throw new NotFoundHttpException('Document content missing');
        }
        AuditService::log($this->user()->uuid, 'document.access', 'Document', (string) $docId, [
            'caseId' => (int) $case->id, 'docType' => $doc['doc_type'],
        ]);
        return Yii::$app->response->sendFile($path, 'document-' . $docId, ['inline' => true]);
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

    private function caseDetail(VerificationCase $case): array
    {
        $p = Property::findOne(['id' => $case->property_id]);
        $owner = User::findOne(['id' => $case->owner_id]);
        $checklist = (new \yii\db\Query())->from('verification_checklist_items')
            ->where(['case_id' => $case->id])->orderBy(['id' => SORT_ASC])->all();
        $docs = (new \yii\db\Query())->from('documents')->where(['property_id' => $p->id])
            ->select(['id', 'doc_type', 'uploaded_at'])->all();

        return [
            'caseId' => (int) $case->id,
            'state' => $case->state,
            'slaDueAt' => $case->sla_due_at,
            'property' => $p->ownerView() + ['id' => $p->uuid],
            'owner' => ['name' => $owner->name, 'phone' => $owner->phone, 'email' => $owner->email],
            'checklist' => array_map(static fn ($c) => [
                'itemKey' => $c['item_key'], 'mandatory' => (bool) $c['mandatory'],
                'result' => $c['result'], 'note' => $c['note'],
            ], $checklist),
            'documents' => $docs,
        ];
    }

    private function serviceError(ServiceException $e): array
    {
        Yii::$app->response->statusCode = $e->httpStatus();
        return ['error' => ['code' => $e->kind, 'message' => $e->getMessage(), 'details' => $e->details]];
    }
}
