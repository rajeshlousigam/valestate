<?php

/** @var yii\web\View $this */
/** @var app\models\User $me */
/** @var array $kpis */
/** @var array $status */
/** @var array $byLocality */
/** @var array $daily */
/** @var array $map */
/** @var string[] $areas */
/** @var string|null $area */
/** @var int $days */
/** @var array $perf */
/** @var array $reasonRows */
/** @var string|null $locality */
/** @var string|null $localityName */

use yii\helpers\Html;
use yii\helpers\Url;
use yii\web\View;

$this->title = 'Dashboard';

$segs = [
    ['Approved', (int) $kpis['approved'], '#12b886'],
    ['Pending', (int) $kpis['pending'], '#e0b84e'],
    ['Rejected', (int) $kpis['rejected'], '#f2555a'],
];
$donutTotal = max(1, $segs[0][1] + $segs[1][1] + $segs[2][1]);
$r = 54.0;
$circ = 2 * M_PI * $r;
$offset = 0.0;

$maxLoc = 1;
foreach ($byLocality as $b) {
    $maxLoc = max($maxLoc, (int) $b['c']);
}
$maxDaily = 1;
foreach ($daily as $d) {
    $maxDaily = max($maxDaily, (int) $d['c']);
}
$maxReason = 1;
foreach ($reasonRows as $rr) {
    $maxReason = max($maxReason, (int) $rr['c']);
}
$avg = $perf['avgTurnMins'];
$avgLabel = $avg === null ? '—' : ($avg >= 60 ? intdiv($avg, 60) . 'h ' . ($avg % 60) . 'm' : $avg . 'm');

$this->registerCssFile('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
$this->registerJsFile('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', ['position' => View::POS_END]);
$mapJson = json_encode($map, JSON_UNESCAPED_SLASHES);
$daysJs = (int) $days;
$this->registerJs(<<<JS
(function(){
  var el=document.getElementById('ve-map'); if(!el) return;
  if(typeof L==='undefined'){ el.innerHTML='<div style="padding:24px;color:#9fb5ad">Map needs an internet connection.</div>'; return; }
  var map=L.map('ve-map',{scrollWheelZoom:false}).setView([24.817,93.9368],13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap contributors',maxZoom:18}).addTo(map);
  var data={$mapJson}, days={$daysJs};
  data.forEach(function(m){
    var radius=8+Math.min(30, m.count*3);
    L.circleMarker([m.lat,m.lng],{radius:radius,color:'#12b886',weight:2,fillColor:'#12b886',fillOpacity:0.35})
      .addTo(map)
      .bindTooltip('<b>'+m.name+'</b>: '+m.count+' listing'+(m.count===1?'':'s')+' — click to drill in')
      .on('click',function(){ window.location='?locality='+encodeURIComponent(m.slug)+(days?('&days='+days):''); });
  });
})();
JS, View::POS_END);
?>

<div class="row" style="justify-content:space-between; align-items:flex-end; gap:12px;">
    <div>
        <h1>Welcome, <?= Html::encode($me->name) ?></h1>
        <p class="sub">Operations overview<?= $area ? ' · ' . Html::encode($area) : '' ?></p>
    </div>
    <form method="get" action="" class="row" style="gap:10px;">
        <div>
            <label style="margin-bottom:4px;">Region</label>
            <select name="area" onchange="this.form.submit()" style="min-width:150px;">
                <option value="">All of Imphal</option>
                <?php foreach ($areas as $a): ?>
                    <option value="<?= Html::encode($a) ?>" <?= $area === $a ? 'selected' : '' ?>><?= Html::encode($a) ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <div>
            <label style="margin-bottom:4px;">Period</label>
            <select name="days" onchange="this.form.submit()" style="min-width:140px;">
                <?php foreach ([0 => 'All time', 7 => 'Last 7 days', 30 => 'Last 30 days', 90 => 'Last 90 days'] as $v => $lbl): ?>
                    <option value="<?= $v ?>" <?= (int) $days === $v ? 'selected' : '' ?>><?= $lbl ?></option>
                <?php endforeach; ?>
            </select>
        </div>
    </form>
</div>

<?php if ($locality): ?>
    <div class="row" style="margin-top:12px; gap:10px;">
        <span class="pill pill-CLAIMED">Locality: <?= Html::encode((string) $localityName) ?></span>
        <a class="muted" style="font-size:13px;" href="<?= Url::to(['/dashboard/index'] + ($days ? ['days' => $days] : [])) ?>">✕ clear</a>
    </div>
<?php endif; ?>

<div class="grid g4" style="margin-top:18px;">
    <div class="stat"><div class="n"><?= (int) $kpis['total'] ?></div><div class="l">Total properties</div></div>
    <div class="stat"><div class="n" style="background:none;-webkit-text-fill-color:#12b886;color:#12b886;"><?= (int) $kpis['approved'] ?></div><div class="l">Published</div></div>
    <div class="stat"><div class="n" style="background:none;-webkit-text-fill-color:#e0b84e;color:#e0b84e;"><?= (int) $kpis['pending'] ?></div><div class="l">Pending / in review</div></div>
    <div class="stat"><div class="n" style="background:none;-webkit-text-fill-color:#f2555a;color:#f2555a;"><?= (int) $kpis['rejected'] ?></div><div class="l">Rejected</div></div>
</div>

<!-- Verification performance -->
<div class="panel" style="margin-top:16px;">
    <h2>Verification performance</h2>
    <div class="grid g4" style="gap:12px;">
        <div class="stat"><div class="n" style="font-size:24px;"><?= Html::encode($avgLabel) ?></div><div class="l">Avg. turnaround</div></div>
        <div class="stat"><div class="n" style="font-size:24px;"><?= (int) $perf['approvalRate'] ?>%</div><div class="l">Approval rate</div></div>
        <div class="stat"><div class="n" style="font-size:24px;"><?= (int) $perf['decided'] ?></div><div class="l">Decided</div></div>
        <div class="stat"><div class="n" style="font-size:24px; background:none; -webkit-text-fill-color:<?= $perf['slaBreaches'] > 0 ? '#f2555a' : '#12b886' ?>; color:<?= $perf['slaBreaches'] > 0 ? '#f2555a' : '#12b886' ?>;"><?= (int) $perf['slaBreaches'] ?></div><div class="l">SLA breaches</div></div>
    </div>
    <?php if ($reasonRows): ?>
        <div class="divider"></div>
        <h2 style="font-size:14px;">Rejection reasons</h2>
        <div style="display:flex; flex-direction:column; gap:8px;">
            <?php foreach ($reasonRows as $rr): ?>
                <div style="display:flex; align-items:center; gap:10px; font-size:13px;">
                    <span style="width:190px; flex-shrink:0;" class="muted"><?= Html::encode($rr['r']) ?></span>
                    <span style="flex:1; height:9px; background:rgba(255,255,255,.05); border-radius:999px; overflow:hidden;">
                        <span style="display:block; height:100%; width:<?= round(((int) $rr['c'] / $maxReason) * 100) ?>%; background:#f2555a; border-radius:999px;"></span>
                    </span>
                    <strong style="width:24px; text-align:right;"><?= (int) $rr['c'] ?></strong>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<div class="grid g2" style="margin-top:16px; grid-template-columns:1fr 1.5fr;">
    <div class="panel">
        <h2>Status split</h2>
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
            <svg width="150" height="150" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="<?= $r ?>" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="16"/>
                <?php foreach ($segs as $seg): $len = $circ * ($seg[1] / $donutTotal); ?>
                    <circle cx="70" cy="70" r="<?= $r ?>" fill="none" stroke="<?= $seg[2] ?>" stroke-width="16"
                        stroke-dasharray="<?= round($len, 2) ?> <?= round($circ - $len, 2) ?>"
                        stroke-dashoffset="<?= round(-$offset, 2) ?>" transform="rotate(-90 70 70)"/>
                    <?php $offset += $len; endforeach; ?>
                <text x="70" y="66" text-anchor="middle" fill="#eaf3ef" font-size="26" font-weight="800"><?= (int) $kpis['total'] ?></text>
                <text x="70" y="86" text-anchor="middle" fill="#9fb5ad" font-size="11">total</text>
            </svg>
            <div style="display:flex; flex-direction:column; gap:8px;">
                <?php foreach ($segs as $seg): ?>
                    <div style="display:flex; align-items:center; gap:8px; font-size:14px;">
                        <span style="width:11px; height:11px; border-radius:3px; background:<?= $seg[2] ?>;"></span>
                        <span class="muted"><?= Html::encode($seg[0]) ?></span>
                        <strong style="margin-left:auto;"><?= (int) $seg[1] ?></strong>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <div class="panel">
        <h2>Listings by locality</h2>
        <?php if (!$byLocality): ?>
            <p class="muted">No data for this selection.</p>
        <?php else: ?>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <?php foreach (array_slice($byLocality, 0, 8) as $b): ?>
                    <div style="display:flex; align-items:center; gap:10px; font-size:13px;">
                        <a href="<?= Url::to(['/dashboard/index', 'locality' => $b['slug']] + ($days ? ['days' => $days] : [])) ?>" style="width:110px; flex-shrink:0;"><?= Html::encode($b['name'] ?? '—') ?></a>
                        <span style="flex:1; height:10px; background:rgba(255,255,255,.05); border-radius:999px; overflow:hidden;">
                            <span style="display:block; height:100%; width:<?= round(((int) $b['c'] / $maxLoc) * 100) ?>%; background:linear-gradient(90deg,#12b886,#e0b84e); border-radius:999px;"></span>
                        </span>
                        <strong style="width:28px; text-align:right;"><?= (int) $b['c'] ?></strong>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<div class="panel" style="margin-top:16px;">
    <h2>Listings across Imphal</h2>
    <p class="sub" style="margin-bottom:12px;">Bubble size = listings in each locality · click a bubble to drill in.</p>
    <div id="ve-map" style="height:380px; border-radius:14px; overflow:hidden; background:#0c1a16;"></div>
</div>

<div class="panel" style="margin-top:16px;">
    <h2>Submissions · last <?= count($daily) ?> days</h2>
    <div style="display:flex; align-items:flex-end; gap:6px; height:120px; margin-top:10px;">
        <?php foreach ($daily as $d): $h = round(((int) $d['c'] / $maxDaily) * 100); ?>
            <div title="<?= Html::encode($d['date']) ?>: <?= (int) $d['c'] ?>" style="flex:1; display:flex; flex-direction:column; justify-content:flex-end; height:100%;">
                <div style="height:<?= max(3, $h) ?>%; background:linear-gradient(180deg,#12b886,#0ea5a0); border-radius:5px 5px 0 0; min-height:3px;"></div>
            </div>
        <?php endforeach; ?>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px; color:#9fb5ad;">
        <span><?= Html::encode($daily[0]['date']) ?></span>
        <span><?= Html::encode($daily[count($daily) - 1]['date']) ?></span>
    </div>
</div>
