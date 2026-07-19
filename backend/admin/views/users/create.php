<?php

/** @var yii\web\View $this */
/** @var array $roles */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'New user';
?>
<div class="row" style="justify-content:space-between;">
    <h1>New user</h1>
    <a class="btn" href="<?= Url::to(['/users']) ?>">← Users</a>
</div>

<div class="panel" style="max-width:560px;">
    <?= Html::beginForm(['/users/create'], 'post') ?>
    <div style="margin-bottom:14px;"><label>Name</label><input name="name" required></div>
    <div style="margin-bottom:14px;"><label>Email</label><input name="email" type="email" required></div>
    <div style="margin-bottom:14px;"><label>Phone</label><input name="phone"></div>
    <div style="margin-bottom:14px;"><label>Password</label><input name="password" type="text" placeholder="min 8 chars" required></div>
    <div style="margin-bottom:18px;">
        <label>Roles</label>
        <div class="radios">
            <?php foreach ($roles as $r): ?>
                <label><input type="checkbox" name="roles[]" value="<?= Html::encode($r['key']) ?>"> <?= Html::encode($r['key']) ?></label>
            <?php endforeach; ?>
        </div>
    </div>
    <button class="btn btn-primary" type="submit">Create user</button>
    <?= Html::endForm() ?>
</div>
