<?php

declare(strict_types=1);

namespace app\modules\property\controllers;

use app\components\BaseApiController;
use app\components\Uuid;
use app\models\Property;
use app\models\VerificationCase;
use app\services\AuditService;
use app\services\OutboxService;
use app\services\StorageService;
use Yii;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;
use yii\web\UploadedFile;

/**
 * Owner property management + submission (docs/06 M2, docs/07, docs/09 §8.2).
 */
class PropertyController extends BaseApiController
{
    private const MIN_MEDIA = 1; // dev; prod per-type via config (docs/24 §6)

    public function actionCreate(): array
    {
        $this->requireAnyRole(['owner']);
        $b = $this->body();

        $p = new Property();
        $p->uuid = Uuid::v4();
        $p->owner_id = $this->user()->id;
        $p->status = Property::DRAFT;
        $p->currency = Yii::$app->params['launchCity']['currency'];
        $this->assignFields($p, $b);

        if (!$p->validate()) {
            return $this->unprocessable($this->errors($p));
        }
        $p->save(false);
        AuditService::log($this->user()->uuid, 'property.create', 'Property', $p->uuid);
        return $this->created($p->ownerView() + ['id' => $p->uuid]);
    }

    public function actionUpdate(string $uuid): array
    {
        $p = $this->ownProperty($uuid);
        if (!$p->isEditableByOwner()) {
            return $this->conflict("Property in status {$p->status} is not editable");
        }
        $this->assignFields($p, $this->body());
        $p->version++;
        if (!$p->validate()) {
            return $this->unprocessable($this->errors($p));
        }
        $p->save(false);
        return $this->ok($p->ownerView() + ['id' => $p->uuid]);
    }

    public function actionMine(): array
    {
        $rows = Property::find()->where(['owner_id' => $this->user()->id])->orderBy(['id' => SORT_DESC])->all();
        return $this->ok(array_map(static fn (Property $p) => $p->ownerView() + ['id' => $p->uuid], $rows));
    }

    public function actionView(string $uuid): array
    {
        $p = $this->ownProperty($uuid);
        $docs = (new \yii\db\Query())->from('documents')->where(['property_id' => $p->id])
            ->select(['doc_type', 'uploaded_at'])->all();
        $mediaCount = (new \yii\db\Query())->from('media_assets')->where(['property_id' => $p->id])->count();
        return $this->ok($p->ownerView() + [
            'id' => $p->uuid,
            'documents' => $docs,           // metadata only — never content (docs/10)
            'mediaCount' => (int) $mediaCount,
        ]);
    }

    /** Submit for verification — enforces invariant I-1 (docs/04/07). */
    public function actionSubmit(string $uuid): array
    {
        $p = $this->ownProperty($uuid);
        if (!in_array($p->status, [Property::DRAFT, Property::INFO_REQUESTED, Property::REJECTED], true)) {
            return $this->conflict("Cannot submit from status {$p->status}");
        }

        $errors = [];
        $ownershipDocs = (new \yii\db\Query())->from('documents')
            ->where(['property_id' => $p->id, 'doc_type' => 'OWNERSHIP'])->count();
        if ((int) $ownershipDocs < 1) {
            $errors[] = ['field' => 'documents', 'issue' => 'at least 1 OWNERSHIP document required'];
        }
        $mediaCount = (new \yii\db\Query())->from('media_assets')->where(['property_id' => $p->id])->count();
        if ((int) $mediaCount < self::MIN_MEDIA) {
            $errors[] = ['field' => 'media', 'issue' => 'at least ' . self::MIN_MEDIA . ' photo required'];
        }
        if ($errors) {
            return $this->unprocessable($errors, 'Submission requirements not met');
        }

        // reuse existing open case (resubmit) or create a new one
        $open = VerificationCase::find()->where(['property_id' => $p->id, 'state' => VerificationCase::OPEN_STATES])->one();

        $tx = Yii::$app->db->beginTransaction();
        try {
            $p->status = Property::SUBMITTED;
            $p->submitted_at = gmdate('Y-m-d H:i:s');
            $p->save(false);

            if ($open === null) {
                $case = new VerificationCase();
                $case->property_id = $p->id;
                $case->owner_id = $p->owner_id;
                $case->state = VerificationCase::UNCLAIMED;
                $case->sla_due_at = gmdate('Y-m-d H:i:s', time() + (int) Yii::$app->params['sla']['claimHours'] * 3600);
                $case->save(false);
                $this->seedChecklist($case->id, $p->property_type);
                $this->caseEvent($case->id, null, VerificationCase::UNCLAIMED, $this->user()->uuid);
            } else {
                $case = $open;
                $case->state = VerificationCase::UNCLAIMED;
                $case->save(false);
                $this->caseEvent($case->id, VerificationCase::INFO_REQUESTED, VerificationCase::UNCLAIMED, $this->user()->uuid);
            }

            OutboxService::emit('Property', $p->uuid, 'Property.PropertySubmitted', [
                'propertyId' => $p->uuid, 'type' => $p->property_type, 'intent' => $p->intent,
                'caseId' => (int) $case->id,
            ]);
            AuditService::log($this->user()->uuid, 'property.submit', 'Property', $p->uuid);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }

        return $this->ok(['id' => $p->uuid, 'status' => $p->status, 'verificationCaseId' => (int) $case->id]);
    }

    public function actionClose(string $uuid): array
    {
        $p = $this->ownProperty($uuid);
        $tx = Yii::$app->db->beginTransaction();
        try {
            $p->status = Property::CLOSED;
            $p->closed_at = gmdate('Y-m-d H:i:s');
            $p->save(false);
            $listing = (new \yii\db\Query())->from('listings')->where(['property_id' => $p->id])->one();
            if ($listing && $listing['visibility'] === 'PUBLIC') {
                Yii::$app->db->createCommand()->update('listings',
                    ['visibility' => 'HIDDEN', 'unpublished_at' => gmdate('Y-m-d H:i:s')],
                    ['id' => $listing['id']])->execute();
                OutboxService::emit('Listing', $listing['uuid'], 'Publication.ListingUnpublished', ['slug' => $listing['slug'], 'reason' => 'CLOSED']);
            }
            OutboxService::emit('Property', $p->uuid, 'Engagement.ListingMarkedClosed', ['propertyId' => $p->uuid]);
            AuditService::log($this->user()->uuid, 'property.close', 'Property', $p->uuid);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }
        return $this->ok(['id' => $p->uuid, 'status' => $p->status]);
    }

    public function actionUploadDocument(string $uuid): array
    {
        $p = $this->ownProperty($uuid);
        $b = $this->body();
        $docType = strtoupper((string) ($b['docType'] ?? 'OWNERSHIP'));
        if (!in_array($docType, ['OWNERSHIP', 'IDENTITY', 'OTHER'], true)) {
            return $this->unprocessable([['field' => 'docType', 'issue' => 'invalid']]);
        }
        $file = UploadedFile::getInstanceByName('file');
        if (!$file) {
            return $this->unprocessable([['field' => 'file', 'issue' => 'required (multipart)']]);
        }
        $stored = StorageService::store($file, StorageService::PRIVATE, "property/{$p->uuid}/docs");
        Yii::$app->db->createCommand()->insert('documents', [
            'property_id' => $p->id,
            'owner_id' => $p->owner_id,
            'doc_type' => $docType,
            'storage_key' => $stored['key'],
            'sensitivity' => 'RESTRICTED',
            'checksum' => $stored['checksum'],
        ])->execute();
        $docId = (int) Yii::$app->db->getLastInsertID();
        AuditService::log($this->user()->uuid, 'document.upload', 'Document', (string) $docId, ['docType' => $docType]);
        // never return the storage key/content
        return $this->created(['documentId' => $docId, 'docType' => $docType]);
    }

    public function actionUploadMedia(string $uuid): array
    {
        $p = $this->ownProperty($uuid);
        $file = UploadedFile::getInstanceByName('file');
        if (!$file) {
            return $this->unprocessable([['field' => 'file', 'issue' => 'required (multipart)']]);
        }
        $stored = StorageService::store($file, StorageService::PUBLIC, "property/{$p->uuid}/media");
        Yii::$app->db->createCommand()->insert('media_assets', [
            'property_id' => $p->id,
            'kind' => 'PHOTO',
            'storage_key' => $stored['key'],
            'status' => 'READY',
        ])->execute();
        $id = (int) Yii::$app->db->getLastInsertID();
        return $this->created(['mediaId' => $id, 'kind' => 'PHOTO']);
    }

    // ---- helpers ----

    private function ownProperty(string $uuid): Property
    {
        $p = Property::findOne(['uuid' => $uuid]);
        if (!$p) {
            throw new NotFoundHttpException('Property not found');
        }
        if ($p->owner_id !== $this->user()->id) {
            throw new ForbiddenHttpException('Not your property');
        }
        return $p;
    }

    private function assignFields(Property $p, array $b): void
    {
        foreach (['property_type' => 'type', 'intent' => 'intent', 'title' => 'title',
                     'description' => 'description', 'locality_id' => 'localityId',
                     'address_line' => 'address', 'pincode' => 'pincode',
                     'price_minor' => 'priceMinor', 'deposit_minor' => 'depositMinor',
                     'area_value' => 'areaValue', 'area_unit' => 'areaUnit'] as $col => $key) {
            if (array_key_exists($key, $b)) {
                // property_type immutable after submit (I-3)
                if ($col === 'property_type' && !$p->isNewRecord && $p->status !== Property::DRAFT) {
                    continue;
                }
                $p->$col = $b[$key];
            }
        }
        if (isset($b['geo']['lat'], $b['geo']['lng'])) {
            $p->geo_lat = $b['geo']['lat'];
            $p->geo_lng = $b['geo']['lng'];
        }
        if (array_key_exists('attributes', $b)) {
            $p->attributes_json = $b['attributes'];
        }
    }

    private function seedChecklist(int|string $caseId, string $type): void
    {
        foreach (VerificationCase::checklistFor($type) as $key => $mandatory) {
            Yii::$app->db->createCommand()->insert('verification_checklist_items', [
                'case_id' => $caseId, 'item_key' => $key,
                'mandatory' => $mandatory ? 1 : 0, 'result' => 'PENDING',
            ])->execute();
        }
    }

    private function caseEvent(int|string $caseId, ?string $from, string $to, string $actorUuid, ?string $reason = null): void
    {
        Yii::$app->db->createCommand()->insert('verification_events', [
            'case_id' => $caseId, 'from_state' => $from, 'to_state' => $to,
            'actor_id' => $actorUuid, 'reason_code' => $reason,
        ])->execute();
    }

    private function errors(Property $p): array
    {
        $out = [];
        foreach ($p->getErrors() as $f => $msgs) {
            foreach ($msgs as $m) {
                $out[] = ['field' => $f, 'issue' => $m];
            }
        }
        return $out;
    }
}
