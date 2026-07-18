<?php

/** @var yii\web\View $this */
/** @var string $name */
/** @var string $message */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = $name;
?>
<div class="panel">
    <h1><?= Html::encode($name) ?></h1>
    <p class="sub"><?= nl2br(Html::encode($message)) ?></p>
    <a class="btn" href="<?= Url::to(['/dashboard/index']) ?>">Back to dashboard</a>
</div>
