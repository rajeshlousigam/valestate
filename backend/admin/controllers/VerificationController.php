<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\Property;
use app\models\User;
use app\models\VerificationCase;
use app\services\AuditService;
use app\services\ServiceException;
use app\services\StorageService;
use app\services\VerificationService;
use Yii;
use yii\db\Query;
use yii\web\NotFoundHttpException;
use yii\web\Response;

/** Verification console (docs/18) — delegates to the shared VerificationService. */
class VerificationController extends BaseAuthedController
{
    public function actionQueue(): string
    {
        $rows = (new Query())
            ->select([
                'vc.id', 'vc.state', 'vc.sla_due_at', 'vc.assigned_verifier_id', 'vc.created_at',
                'p.property_type', 'p.intent', 'p.title', 'p.uuid AS puuid',
            ])
            ->from('verification_cases vc')
            ->innerJoin('properties p', 'p.id = vc.property_id')
            ->where(['vc.state' => VerificationCase::OPEN_STATES])
            ->orderBy(['FIELD(vc.state, "UNCLAIMED")' => SORT_DESC, 'vc.sla_due_at' => SORT_ASC])
            ->all();
        return $this->render('queue', ['rows' => $rows, 'meId' => (string) $this->me()->id]);
    }

    public function actionView(int $id): string
    {
        $case = $this->find($id);
        $p = Property::findOne(['id' => $case->property_id]);
        $owner = User::findOne(['id' => $case->owner_id]);
        $checklist = (new Query())->from('verification_checklist_items')
            ->where(['case_id' => $case->id])->orderBy(['id' => SORT_ASC])->all();
        $docs = (new Query())->from('documents')->where(['property_id' => $p->id])
            ->select(['id', 'doc_type', 'uploaded_at'])->all();
        $events = (new Query())->from('verification_events')->where(['case_id' => $case->id])
            ->orderBy(['id' => SORT_DESC])->limit(12)->all();

        return $this->render('view', [
            'case' => $case, 'p' => $p, 'owner' => $owner,
            'checklist' => $checklist, 'docs' => $docs, 'events' => $events,
            'canAct' => $this->canAct($case),
        ]);
    }

    public function actionClaim(int $id): Response
    {
        $case = $this->find($id);
        $this->runService(fn () => VerificationService::claim($case, $this->me()), 'Case claimed.');
        return $this->redirect(['/verification/' . $id]);
    }

    public function actionChecklist(int $id): Response
    {
        $case = $this->find($id);
        $posted = (array) Yii::$app->request->post('result', []);
        $notes = (array) Yii::$app->request->post('note', []);
        $items = [];
        foreach ($posted as $key => $result) {
            $items[] = ['itemKey' => (string) $key, 'result' => (string) $result, 'note' => $notes[$key] ?? null];
        }
        $this->runService(fn () => VerificationService::saveChecklist($case, $items, $this->me()), 'Checklist saved.');
        return $this->redirect(['/verification/' . $id]);
    }

    public function actionRequestInfo(int $id): Response
    {
        $case = $this->find($id);
        $this->runService(
            fn () => VerificationService::requestInfo($case, Yii::$app->request->post('reasonCode') ?: null, Yii::$app->request->post('note') ?: null, $this->me()),
            'Info requested from owner.',
        );
        return $this->redirect(['/verification']);
    }

    public function actionDecision(int $id): Response
    {
        $case = $this->find($id);
        $decision = (string) Yii::$app->request->post('decision', '');
        $ok = $this->runService(fn () => VerificationService::decide(
            $case,
            $decision,
            Yii::$app->request->post('reasonCode') ?: null,
            Yii::$app->request->post('note') ?: null,
            $this->me(),
        ), $decision === 'APPROVED' ? 'Approved & published.' : 'Rejected.');
        return $this->redirect($ok && $decision === 'APPROVED' ? ['/verification'] : ['/verification/' . $id]);
    }

    /** Audited sensitive-document access (docs/10 §7). */
    public function actionDocument(int $id, int $docId): Response
    {
        $case = $this->find($id);
        try {
            VerificationService::assertCanAct($case, $this->me());
        } catch (ServiceException $e) {
            throw new NotFoundHttpException('Not permitted');
        }
        $doc = (new Query())->from('documents')->where(['id' => $docId, 'property_id' => $case->property_id])->one();
        if (!$doc) {
            throw new NotFoundHttpException('Document not found');
        }
        $path = StorageService::absPath(StorageService::PRIVATE, $doc['storage_key']);
        if (!is_file($path)) {
            throw new NotFoundHttpException('Document content missing');
        }
        AuditService::log($this->me()->uuid, 'document.access', 'Document', (string) $docId, [
            'caseId' => (int) $case->id, 'docType' => $doc['doc_type'],
        ]);
        return Yii::$app->response->sendFile($path, 'document-' . $docId, ['inline' => true]);
    }

    // ---- helpers ----

    private function find(int $id): VerificationCase
    {
        $case = VerificationCase::findOne(['id' => $id]);
        if (!$case) {
            throw new NotFoundHttpException('Case not found');
        }
        return $case;
    }

    private function canAct(VerificationCase $case): bool
    {
        try {
            VerificationService::assertCanAct($case, $this->me());
            return true;
        } catch (ServiceException) {
            return false;
        }
    }

    /** Run a service call, translating ServiceException into a flash message. */
    private function runService(callable $fn, string $successMsg): bool
    {
        if (!Yii::$app->request->isPost) {
            Yii::$app->session->setFlash('error', 'Invalid request.');
            return false;
        }
        try {
            $fn();
            Yii::$app->session->setFlash('success', $successMsg);
            return true;
        } catch (ServiceException $e) {
            $detail = $e->details[0]['issue'] ?? '';
            Yii::$app->session->setFlash('error', $e->getMessage() . ($detail ? " — {$detail}" : ''));
            return false;
        }
    }
}
