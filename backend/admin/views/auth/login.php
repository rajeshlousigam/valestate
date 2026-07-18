<?php

/** @var yii\web\View $this */
/** @var string|null $error */

use yii\helpers\Html;

$this->title = 'Sign in';
?>
<div style="max-width:420px; margin:6vh auto 0;">
    <div class="panel">
        <h1>Sign in</h1>
        <p class="sub">Operations &amp; verification console</p>
        <?php if (!empty($error)): ?>
            <div class="flash flash-error"><?= Html::encode($error) ?></div>
        <?php endif; ?>
        <?= Html::beginForm(['/auth/login'], 'post') ?>
        <div style="margin-bottom:14px;">
            <label>Email</label>
            <input name="email" type="email" autofocus required placeholder="verifier@valestate.test">
        </div>
        <div style="margin-bottom:18px;">
            <label>Password</label>
            <input name="password" type="password" required placeholder="••••••••">
        </div>
        <button class="btn btn-primary" type="submit" style="width:100%; justify-content:center;">Sign in</button>
        <?= Html::endForm() ?>
        <p class="muted" style="font-size:12px; margin-top:16px;">
            Dev accounts: <code>verifier@</code> / <code>ops@</code> / <code>admin@</code> valestate.test · password <code>secret123</code>
        </p>
    </div>
</div>
