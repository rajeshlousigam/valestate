<?php

/** @var yii\web\View $this */
/** @var array $rows */
/** @var bool $canRecheck */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Published listings';
?>
<h1>Published listings</h1>
<p class="sub"><?= count($rows) ?> live · re-check triggers re-verification (the listing is hidden until re-approved)</p>

<div class="panel" style="padding:0; overflow:hidden;">
    <table>
        <thead><tr><th>Property</th><th>Type</th><th>Price</th><th>Published</th><th></th></tr></thead>
        <tbody>
        <?php if (!$rows): ?><tr><td colspan="5" class="muted" style="padding:24px; text-align:center;">Nothing published yet.</td></tr><?php endif; ?>
        <?php foreach ($rows as $r): ?>
            <tr>
                <td>
                    <?= Html::encode($r['title']) ?>
                    <div class="muted" style="font-size:12px;"><?= Html::encode((string) $r['slug']) ?></div>
                </td>
                <td><?= Html::encode(ucfirst(strtolower($r['property_type']))) ?> · <?= Html::encode(ucfirst(strtolower($r['intent']))) ?></td>
                <td>₹<?= number_format((int) $r['price_minor']) ?></td>
                <td class="muted"><?= Html::encode((string) $r['published_at']) ?></td>
                <td>
                    <?php if ($canRecheck): ?>
                        <?= Html::beginForm(['/listings/reverify/' . $r['id']], 'post', ['style' => 'margin:0']) ?>
                        <button class="btn btn-gold btn-sm" type="submit" onclick="return confirm('Re-verify this property? It will be hidden from the public until re-approved.')">Recheck</button>
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
