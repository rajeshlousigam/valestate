<?php

/** @var yii\web\View $this */
/** @var array $counts */
/** @var app\models\User $me */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Dashboard';
$cards = [
    ['n' => $counts['unclaimed'], 'l' => 'Unclaimed cases'],
    ['n' => $counts['open'], 'l' => 'Open (in queue)'],
    ['n' => $counts['published'], 'l' => 'Published listings'],
    ['n' => $counts['rejected'], 'l' => 'Rejected'],
];
?>
<h1>Welcome, <?= Html::encode($me->name) ?></h1>
<p class="sub">Verification operations overview</p>

<div class="grid g4">
    <?php foreach ($cards as $c): ?>
        <div class="stat">
            <div class="n"><?= (int) $c['n'] ?></div>
            <div class="l"><?= Html::encode($c['l']) ?></div>
        </div>
    <?php endforeach; ?>
</div>

<div style="margin-top:22px;">
    <a class="btn btn-primary" href="<?= Url::to(['/verification']) ?>">Open verification queue →</a>
</div>
