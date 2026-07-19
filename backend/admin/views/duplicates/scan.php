<?php

/** @var yii\web\View $this */
/** @var array $pairs */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Duplicate scan';
?>
<h1>Duplicate scan</h1>
<p class="sub"><?= count($pairs) ?> likely duplicate pair<?= count($pairs) === 1 ? '' : 's' ?> across active properties (score ≥ <?= \app\services\DuplicateService::THRESHOLD ?>)</p>

<?php if (!$pairs): ?>
    <div class="panel"><p class="muted">No likely duplicates found. 🎉</p></div>
<?php else: ?>
    <?php foreach ($pairs as $pair): ?>
        <div class="panel" style="margin-bottom:14px;">
            <div class="row" style="justify-content:space-between; align-items:flex-start;">
                <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:18px; align-items:center; flex:1;">
                    <div>
                        <strong><?= Html::encode($pair['a']->title) ?></strong>
                        <div class="muted" style="font-size:12px;"><?= Html::encode($pair['a']->status) ?> · ₹<?= number_format((int) $pair['a']->price_minor) ?></div>
                    </div>
                    <div style="text-align:center;">
                        <div class="stat" style="padding:8px 14px;"><span class="n" style="font-size:20px;"><?= (int) $pair['score'] ?></span></div>
                        <div class="muted" style="font-size:11px;">match</div>
                    </div>
                    <div>
                        <strong><?= Html::encode($pair['b']->title) ?></strong>
                        <div class="muted" style="font-size:12px;"><?= Html::encode($pair['b']->status) ?> · ₹<?= number_format((int) $pair['b']->price_minor) ?></div>
                    </div>
                </div>
            </div>
            <div class="muted" style="font-size:12px; margin-top:10px;">Signals: <?= Html::encode(implode(' · ', $pair['reasons'])) ?></div>
        </div>
    <?php endforeach; ?>
<?php endif; ?>
