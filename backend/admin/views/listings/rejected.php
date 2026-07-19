<?php

/** @var yii\web\View $this */
/** @var array $rows */
/** @var bool $canRecheck */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Rejected';
?>
<h1>Rejected properties</h1>
<p class="sub"><?= count($rows) ?> rejected · re-open to review again and (if valid) approve &amp; publish</p>

<div class="panel" style="padding:0; overflow:hidden;">
    <table>
        <thead><tr><th>Property</th><th>Type</th><th>Reason</th><th>Rejected</th><th></th></tr></thead>
        <tbody>
        <?php if (!$rows): ?><tr><td colspan="5" class="muted" style="padding:24px; text-align:center;">No rejected properties.</td></tr><?php endif; ?>
        <?php foreach ($rows as $r): ?>
            <tr>
                <td><a href="<?= Url::to(['/verification/' . $r['case_id']]) ?>"><?= Html::encode($r['title']) ?></a></td>
                <td><?= Html::encode(ucfirst(strtolower($r['property_type']))) ?> · <?= Html::encode(ucfirst(strtolower($r['intent']))) ?></td>
                <td><span class="pill pill-INFO_REQUESTED"><?= Html::encode((string) ($r['reason_code'] ?? '—')) ?></span></td>
                <td class="muted"><?= Html::encode((string) $r['decided_at']) ?></td>
                <td>
                    <?php if ($canRecheck): ?>
                        <?= Html::beginForm(['/listings/reopen/' . $r['case_id']], 'post', ['style' => 'margin:0']) ?>
                        <button class="btn btn-primary btn-sm" type="submit">Re-open &amp; recheck</button>
                        <?= Html::endForm() ?>
                    <?php else: ?>
                        <span class="muted" style="font-size:12px;">ops only</span>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
