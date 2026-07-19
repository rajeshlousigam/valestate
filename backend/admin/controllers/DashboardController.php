<?php

declare(strict_types=1);

namespace app\admin\controllers;

use app\models\Property;
use app\models\VerificationCase;
use Yii;
use yii\db\Expression;
use yii\db\Query;

class DashboardController extends BaseAuthedController
{
    /** Approx coordinates for Imphal localities (demo map). slug => [lat, lng]. */
    private const GEO = [
        'thangmeiband' => [24.8225, 93.9330], 'uripok' => [24.8100, 93.9250],
        'sagolband' => [24.8140, 93.9300], 'keishampat' => [24.8050, 93.9380],
        'paona-bazar' => [24.8090, 93.9410], 'thangal-bazar' => [24.8120, 93.9420],
        'nagamapal' => [24.8180, 93.9360], 'lamphelpat' => [24.8200, 93.9180],
        'langol' => [24.8270, 93.9200], 'chingmeirong' => [24.8250, 93.9450],
        'kwakeithel' => [24.8000, 93.9280], 'singjamei' => [24.7950, 93.9350],
        'kongba' => [24.8080, 93.9600], 'porompat' => [24.8050, 93.9520],
        'khurai' => [24.8150, 93.9560], 'wangkhei' => [24.8130, 93.9490],
        'chingangbam-leikai' => [24.8110, 93.9470], 'andro-road' => [24.7900, 93.9700],
        'lamphel' => [24.8210, 93.9120], 'mantripukhri' => [24.8340, 93.9430],
        'koirengei' => [24.8500, 93.9400], 'canchipur' => [24.7550, 93.9330], 'sekmai' => [24.9000, 93.9000],
    ];

    public function actionIndex(): string
    {
        $req = Yii::$app->request;
        $area = $req->get('area') ?: null;
        $locality = $req->get('locality') ?: null;
        $days = (int) ($req->get('days') ?: 0);
        $since = $days > 0 ? gmdate('Y-m-d H:i:s', time() - $days * 86400) : null;

        // if a locality is drilled into, resolve its display name
        $localityName = $locality
            ? ((new Query())->select('name')->from('localities')->where(['slug' => $locality])->scalar() ?: $locality)
            : null;

        // ---- property status distribution ----
        $status = [];
        foreach ($this->propQuery($area, $locality, $since)->select(['p.status AS s', 'COUNT(*) AS c'])->groupBy('p.status')->all() as $r) {
            $status[$r['s']] = (int) $r['c'];
        }
        $g = static fn (string ...$keys) => array_sum(array_map(static fn ($k) => $status[$k] ?? 0, $keys));
        $kpis = [
            'total' => array_sum($status),
            'approved' => $g(Property::PUBLISHED),
            'pending' => $g(Property::SUBMITTED, Property::IN_VERIFICATION, Property::RE_VERIFICATION, Property::INFO_REQUESTED),
            'rejected' => $g(Property::REJECTED),
        ];

        // ---- verification performance (SLA / throughput) ----
        $decided = (int) $this->caseQuery($area, $locality, $since)->andWhere(['vc.state' => VerificationCase::DECIDED])->count();
        $approved = (int) $this->caseQuery($area, $locality, $since)->andWhere(['vc.decision' => 'APPROVED'])->count();
        $rejected = (int) $this->caseQuery($area, $locality, $since)->andWhere(['vc.decision' => 'REJECTED'])->count();
        $avgTurn = $this->caseQuery($area, $locality, $since)
            ->andWhere(['vc.state' => VerificationCase::DECIDED])
            ->andWhere(['not', ['vc.claimed_at' => null]])
            ->select(new Expression('AVG(TIMESTAMPDIFF(MINUTE, vc.claimed_at, vc.decided_at))'))->scalar();
        $breachDecided = (int) $this->caseQuery($area, $locality, $since)
            ->andWhere(['vc.state' => VerificationCase::DECIDED])
            ->andWhere('vc.decided_at > vc.sla_due_at')->count();
        $breachOpen = (int) $this->caseQuery($area, $locality, $since)
            ->andWhere(['vc.state' => VerificationCase::OPEN_STATES])
            ->andWhere('NOW() > vc.sla_due_at')->count();
        $perf = [
            'decided' => $decided,
            'approvalRate' => $decided > 0 ? round(($approved / $decided) * 100) : 0,
            'avgTurnMins' => $avgTurn !== null ? (int) round((float) $avgTurn) : null,
            'slaBreaches' => $breachDecided + $breachOpen,
        ];
        $reasonRows = $this->caseQuery($area, $locality, $since)
            ->andWhere(['vc.decision' => 'REJECTED'])->andWhere(['not', ['vc.reason_code' => null]])
            ->select(['vc.reason_code AS r', 'COUNT(*) AS c'])->groupBy('vc.reason_code')
            ->orderBy(['c' => SORT_DESC])->all();

        // ---- listings by locality ----
        $byLocality = $this->propQuery($area, $locality, $since)
            ->select(['loc.slug AS slug', 'loc.name AS name', 'COUNT(*) AS c'])
            ->andWhere(['not', ['p.status' => Property::DRAFT]])
            ->andWhere(['not', ['loc.slug' => null]])
            ->groupBy(['loc.slug', 'loc.name'])->orderBy(['c' => SORT_DESC])->all();

        // ---- daily submissions (window = range, min 14 days) ----
        $window = $days > 0 ? min(max($days, 7), 60) : 14;
        $fromTs = time() - ($window - 1) * 86400;
        $dailyMap = [];
        foreach ($this->propQuery($area, $locality, null)
            ->select(['DATE(p.created_at) AS d', 'COUNT(*) AS c'])
            ->andWhere(['>=', 'p.created_at', gmdate('Y-m-d', $fromTs)])
            ->groupBy('d')->all() as $r) {
            $dailyMap[$r['d']] = (int) $r['c'];
        }
        $daily = [];
        for ($i = $window - 1; $i >= 0; $i--) {
            $d = gmdate('Y-m-d', time() - $i * 86400);
            $daily[] = ['date' => $d, 'c' => $dailyMap[$d] ?? 0];
        }

        // ---- map markers ----
        $map = [];
        foreach ($byLocality as $r) {
            if (isset(self::GEO[$r['slug']])) {
                $map[] = ['name' => $r['name'], 'slug' => $r['slug'], 'lat' => self::GEO[$r['slug']][0], 'lng' => self::GEO[$r['slug']][1], 'count' => (int) $r['c']];
            }
        }

        $areas = (new Query())->select('name')->from('localities')->where(['level' => 'AREA'])->orderBy(['name' => SORT_ASC])->column();

        return $this->render('index', compact('kpis', 'status', 'byLocality', 'daily', 'map', 'areas', 'area', 'days', 'perf', 'reasonRows', 'locality', 'localityName') + ['me' => $this->me()]);
    }

    private function propQuery(?string $area, ?string $locality, ?string $since): Query
    {
        $q = (new Query())->from('properties p')
            ->leftJoin('localities loc', 'loc.id = p.locality_id')
            ->leftJoin('localities area', 'area.id = loc.parent_id')
            ->andFilterWhere(['area.name' => $area])
            ->andFilterWhere(['loc.slug' => $locality]);
        if ($since) {
            $q->andWhere(['>=', 'p.created_at', $since]);
        }
        return $q;
    }

    private function caseQuery(?string $area, ?string $locality, ?string $since): Query
    {
        $q = (new Query())->from('verification_cases vc')
            ->innerJoin('properties p', 'p.id = vc.property_id')
            ->leftJoin('localities loc', 'loc.id = p.locality_id')
            ->leftJoin('localities area', 'area.id = loc.parent_id')
            ->andFilterWhere(['area.name' => $area])
            ->andFilterWhere(['loc.slug' => $locality]);
        if ($since) {
            $q->andWhere(['>=', 'vc.created_at', $since]);
        }
        return $q;
    }
}
