<?php

/** @var yii\web\View $this */
/** @var array $rows */
/** @var string $meId */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Verification queue';
?>
<h1>Verification queue</h1>
<p class="sub"><?= count($rows) ?> open case<?= count($rows) === 1 ? '' : 's' ?> · unclaimed first, then by SLA</p>

<div class="panel" style="padding:0; overflow:hidden;">
    <table>
        <thead>
        <tr>
            <th>Property</th><th>Type</th><th>State</th><th>SLA due</th><th>Assignee</th><th></th>
        </tr>
        </thead>
        <tbody>
        <?php if (!$rows): ?>
            <tr><td colspan="6" class="muted" style="padding:28px; text-align:center;">Queue is clear 🎉</td></tr>
        <?php endif; ?>
        <?php foreach ($rows as $r): ?>
            <?php
            $assignee = $r['assigned_verifier_id'] === null
                ? '<span class="muted">— unclaimed</span>'
                : ((string) $r['assigned_verifier_id'] === $meId ? '<strong style="color:var(--brand)">You</strong>' : 'Claimed');
            ?>
            <tr>
                <td>
                    <a href="<?= Url::to(['/verification/' . $r['id']]) ?>"><?= Html::encode($r['title']) ?></a>
                    <div class="muted" style="font-size:12px;"><?= Html::encode($r['puuid']) ?></div>
                </td>
                <td><?= Html::encode(ucfirst(strtolower($r['property_type']))) ?> · <?= Html::encode(ucfirst(strtolower($r['intent']))) ?></td>
                <td><span class="pill pill-<?= Html::encode($r['state']) ?>"><?= Html::encode($r['state']) ?></span></td>
                <td class="muted"><?= Html::encode($r['sla_due_at'] ?? '—') ?></td>
                <td><?= $assignee ?></td>
                <td><a class="btn btn-sm" href="<?= Url::to(['/verification/' . $r['id']]) ?>">Open</a></td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
