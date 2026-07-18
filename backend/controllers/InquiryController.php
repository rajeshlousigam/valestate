<?php

declare(strict_types=1);

namespace app\controllers;

use app\components\BaseApiController;
use app\models\Listing;
use app\models\Property;
use app\services\AuditService;
use app\services\OutboxService;
use Yii;
use yii\web\ForbiddenHttpException;
use yii\web\NotFoundHttpException;

/**
 * Buyer inquiries (docs/09 §8.5, docs/14). Feeds the North Star (docs/15).
 */
class InquiryController extends BaseApiController
{
    public function actionCreate(string $slug): array
    {
        $this->requireAnyRole(['buyer']);

        /** @var Listing|null $listing */
        $listing = Listing::find()->alias('l')->joinWith('property p')
            ->where(['l.slug' => $slug, 'l.visibility' => Listing::PUBLIC, 'p.status' => Property::PUBLISHED])
            ->one();
        if (!$listing) {
            throw new NotFoundHttpException('Listing not found');
        }
        $property = $listing->property;

        // Buyer cannot inquire on own listing (docs/04 I-9)
        if ($property->owner_id === $this->user()->id) {
            throw new ForbiddenHttpException('Cannot inquire on your own listing');
        }

        $message = trim((string) ($this->body()['message'] ?? ''));

        $tx = Yii::$app->db->beginTransaction();
        try {
            Yii::$app->db->createCommand()->insert('inquiries', [
                'listing_id' => $listing->id,
                'buyer_id' => $this->user()->id,
                'owner_id' => $property->owner_id,
                'message' => $message !== '' ? $message : null,
                'status' => 'NEW',
            ])->execute();
            $inquiryId = (int) Yii::$app->db->getLastInsertID();

            OutboxService::emit('Inquiry', (string) $inquiryId, 'Engagement.InquiryCreated', [
                'inquiryId' => $inquiryId, 'slug' => $slug, 'propertyId' => $property->uuid,
            ]);
            // owner notification (docs/14) — via outbox/worker
            OutboxService::emit('Notification', (string) $inquiryId, 'Notification.Requested', [
                'template' => 'owner.new_inquiry', 'ownerId' => $property->uuid,
            ]);
            AuditService::log($this->user()->uuid, 'inquiry.create', 'Inquiry', (string) $inquiryId);
            $tx->commit();
        } catch (\Throwable $e) {
            $tx->rollBack();
            throw $e;
        }

        return $this->created(['inquiryId' => $inquiryId, 'status' => 'NEW']);
    }

    public function actionMine(): array
    {
        $rows = (new \yii\db\Query())->from('inquiries i')
            ->innerJoin('listings l', 'l.id = i.listing_id')
            ->select(['i.id', 'i.status', 'i.message', 'i.created_at', 'l.slug'])
            ->where(['i.buyer_id' => $this->user()->id])
            ->orderBy(['i.id' => SORT_DESC])->all();
        return $this->ok($rows);
    }
}
