<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\Property;
use app\models\VerificationCase;
use app\services\ServiceException;
use app\services\VerificationService;
use Yii;
use yii\db\Query;
use yii\web\NotFoundHttpException;
use yii\web\Response;

/** Published & rejected lists + recheck (re-verify) / re-open actions (docs/07, docs/18). */
class ListingsController extends BaseAuthedController
{
    private const OPS = ['ops_manager', 'admin', 'super_admin'];

    public function actionPublished(): string
    {
        $rows = (new Query())
            ->select(['p.id', 'p.uuid', 'p.title', 'p.property_type', 'p.intent', 'p.price_minor', 'p.published_at', 'l.slug'])
            ->from('properties p')
            ->leftJoin('listings l', 'l.property_id = p.id')
            ->where(['p.status' => Property::PUBLISHED])
            ->orderBy(['p.published_at' => SORT_DESC])->all();
        return $this->render('published', ['rows' => $rows, 'canRecheck' => $this->hasAnyRole(self::OPS)]);
    }

    public function actionRejected(): string
    {
        $rows = (new Query())
            ->select(['p.id', 'p.uuid', 'p.title', 'p.property_type', 'p.intent', 'vc.id AS case_id', 'vc.reason_code', 'vc.decided_at'])
            ->from('properties p')
            ->innerJoin('verification_cases vc', 'vc.property_id = p.id')
            ->where(['p.status' => Property::REJECTED, 'vc.decision' => 'REJECTED'])
            ->orderBy(['vc.decided_at' => SORT_DESC])->all();
        return $this->render('rejected', ['rows' => $rows, 'canRecheck' => $this->hasAnyRole(self::OPS)]);
    }

    /** Re-open a rejected case for another review (id = case id). */
    public function actionReopen(int $id): Response
    {
        $this->requireRoles(self::OPS);
        $case = VerificationCase::findOne(['id' => $id]);
        if (!$case) {
            throw new NotFoundHttpException('Case not found');
        }
        if (!Yii::$app->request->isPost) {
            return $this->redirect(['/listings/rejected']);
        }
        try {
            VerificationService::reopen($case, $this->me());
            Yii::$app->session->setFlash('success', 'Case re-opened for recheck — now in your queue.');
        } catch (ServiceException $e) {
            Yii::$app->session->setFlash('error', $e->getMessage());
        }
        return $this->redirect(['/verification/' . $case->id]);
    }

    /** Recheck a published property → re-verification (id = property id). */
    public function actionReverify(int $id): Response
    {
        $this->requireRoles(self::OPS);
        $p = Property::findOne(['id' => $id]);
        if (!$p) {
            throw new NotFoundHttpException('Property not found');
        }
        if (!Yii::$app->request->isPost) {
            return $this->redirect(['/listings/published']);
        }
        try {
            $case = VerificationService::reverify($p, $this->me());
            Yii::$app->session->setFlash('success', 'Re-verification started — listing hidden and back in the queue.');
            return $this->redirect(['/verification/' . $case->id]);
        } catch (ServiceException $e) {
            Yii::$app->session->setFlash('error', $e->getMessage());
            return $this->redirect(['/listings/published']);
        }
    }
}
