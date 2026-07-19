<?php

/** @var yii\web\View $this */
/** @var array $users */
/** @var array $roles */

use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Users & RBAC';
$statuses = ['ACTIVE', 'SUSPENDED', 'BANNED', 'DEACTIVATED'];
?>
<div class="row" style="justify-content:space-between;">
    <div><h1>Users &amp; RBAC</h1><p class="sub"><?= count($users) ?> users · <?= count($roles) ?> roles</p></div>
    <a class="btn btn-primary" href="<?= Url::to(['/users/create']) ?>">+ New user</a>
</div>

<div class="panel" style="margin-bottom:16px;">
    <h2>Create role</h2>
    <?= Html::beginForm(['/roles/create'], 'post') ?>
    <div class="row">
        <input name="key" placeholder="role_key (e.g. field_agent)" style="max-width:240px;">
        <input name="name" placeholder="Display name" style="max-width:240px;">
        <button class="btn" type="submit">Add role</button>
        <span class="muted" style="font-size:12px;">Existing: <?= Html::encode(implode(', ', array_column($roles, 'key'))) ?></span>
    </div>
    <?= Html::endForm() ?>
</div>

<div class="panel" style="padding:0; overflow:hidden;">
    <table>
        <thead><tr><th>User</th><th>Roles</th><th>Status</th></tr></thead>
        <tbody>
        <?php foreach ($users as $u): ?>
            <?php $userRoles = $u['roles'] ? explode(',', $u['roles']) : []; ?>
            <tr>
                <td>
                    <strong><?= Html::encode($u['name']) ?></strong>
                    <div class="muted" style="font-size:12px;"><?= Html::encode($u['email']) ?></div>
                </td>
                <td>
                    <?= Html::beginForm(['/users/' . $u['id'] . '/roles'], 'post', ['style' => 'margin:0']) ?>
                    <div class="radios" style="margin-bottom:8px;">
                        <?php foreach ($roles as $r): ?>
                            <label><input type="checkbox" name="roles[]" value="<?= Html::encode($r['key']) ?>" <?= in_array($r['key'], $userRoles, true) ? 'checked' : '' ?>> <?= Html::encode($r['key']) ?></label>
                        <?php endforeach; ?>
                    </div>
                    <button class="btn btn-sm" type="submit">Save roles</button>
                    <?= Html::endForm() ?>
                </td>
                <td>
                    <?= Html::beginForm(['/users/' . $u['id'] . '/status'], 'post', ['style' => 'margin:0']) ?>
                    <div class="row">
                        <select name="status" style="max-width:150px;">
                            <?php foreach ($statuses as $s): ?><option value="<?= $s ?>" <?= $u['status'] === $s ? 'selected' : '' ?>><?= $s ?></option><?php endforeach; ?>
                        </select>
                        <button class="btn btn-sm" type="submit">Apply</button>
                    </div>
                    <?= Html::endForm() ?>
                </td>
            </tr>
        <?php endforeach; ?>
        </tbody>
    </table>
</div>
