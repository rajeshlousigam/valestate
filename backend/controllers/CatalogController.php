<?php

declare(strict_types=1);

namespace app\controllers;

use app\models\Listing;
use app\models\Property;
use Yii;
use yii\web\Controller;
use yii\web\NotFoundHttpException;

/**
 * Public verified catalog (docs/09 §8.4, docs/13). Unauthenticated, read-only.
 * Only PUBLIC listings of PUBLISHED properties; never any PII/documents (docs/10, docs/13 BR-13.2).
 */
class CatalogController extends Controller
{
    public $enableCsrfValidation = false;

    public function actionIndex(): array
    {
        $req = Yii::$app->request;
        $limit = min(50, max(1, (int) $req->get('limit', 20)));
        $offset = max(0, (int) $req->get('offset', 0));

        $query = Listing::find()->alias('l')
            ->joinWith('property p')
            ->where(['l.visibility' => Listing::PUBLIC, 'p.status' => Property::PUBLISHED]);

        if ($type = $req->get('type')) {
            $query->andWhere(['p.property_type' => strtoupper($type)]);
        }
        if ($intent = $req->get('intent')) {
            $query->andWhere(['p.intent' => strtoupper($intent)]);
        }
        if ($localitySlug = $req->get('locality')) {
            $locId = (new \yii\db\Query())->select('id')->from('localities')->where(['slug' => $localitySlug])->scalar();
            $query->andWhere(['p.locality_id' => $locId ?: -1]);
        }

        $total = (int) $query->count();
        /** @var Listing[] $listings */
        $listings = $query->orderBy(['l.published_at' => SORT_DESC])->limit($limit)->offset($offset)->all();

        $data = array_map(static fn (Listing $l) => $l->publicView($l->property), $listings);
        return ['data' => $data, 'meta' => ['total' => $total, 'limit' => $limit, 'offset' => $offset]];
    }

    public function actionView(string $slug): array
    {
        /** @var Listing|null $listing */
        $listing = Listing::find()->alias('l')->joinWith('property p')
            ->where(['l.slug' => $slug, 'l.visibility' => Listing::PUBLIC, 'p.status' => Property::PUBLISHED])
            ->one();
        if (!$listing) {
            throw new NotFoundHttpException('Listing not found');
        }
        return ['data' => $listing->publicView($listing->property)];
    }
}
