<?php

/** @var yii\web\View $this */
/** @var string $content */

use yii\helpers\Html;
use yii\helpers\Url;

$user = Yii::$app->user->identity;
$path = trim((string) Yii::$app->request->pathInfo, '/');
$isAdmin = $user ? (bool) array_intersect(['admin', 'super_admin'], $user->getRoleKeys()) : false;

$nav = [
    ['label' => 'Dashboard', 'route' => ['/dashboard/index'], 'match' => ['', 'dashboard']],
    ['label' => 'Verification queue', 'route' => ['/verification'], 'match' => ['verification']],
    ['label' => 'Published', 'route' => ['/listings/published'], 'match' => ['listings/published']],
    ['label' => 'Rejected', 'route' => ['/listings/rejected'], 'match' => ['listings/rejected']],
    ['label' => 'Duplicate scan', 'route' => ['/duplicates'], 'match' => ['duplicates']],
];
if ($isAdmin) {
    $nav[] = ['label' => 'Users & RBAC', 'route' => ['/users'], 'match' => ['users', 'roles']];
}
$active = static function (array $match) use ($path): bool {
    foreach ($match as $m) {
        if ($m === '' && ($path === '' || str_starts_with($path, 'dashboard'))) {
            return true;
        }
        if ($m !== '' && str_starts_with($path, $m)) {
            return true;
        }
    }
    return false;
};
?>
<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="en-IN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= Html::encode($this->title ? $this->title . ' · ValEstate Admin' : 'ValEstate Admin') ?></title>
    <?php $this->head() ?>
    <style>
        :root { --bg:#0b1512; --panel:#10201b; --line:#22423a; --fg:#eaf3ef; --muted:#9fb5ad; --brand:#12b886; --brand-2:#0ea5a0; --gold:#e0b84e; --danger:#f2555a; }
        * { box-sizing:border-box; }
        body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,system-ui,sans-serif; background:radial-gradient(120% 90% at 80% -10%, #123 0, var(--bg) 55%); color:var(--fg); min-height:100vh; }
        a { color:var(--brand); text-decoration:none; } a:hover { text-decoration:underline; }
        /* layout */
        .app { display:flex; min-height:100vh; }
        .sidebar { width:238px; flex-shrink:0; border-right:1px solid var(--line); background:rgba(16,32,27,.6); backdrop-filter:blur(8px); position:sticky; top:0; height:100vh; display:flex; flex-direction:column; padding:18px 14px; }
        .content { flex:1; min-width:0; }
        .brand { display:flex; align-items:center; gap:10px; font-weight:700; padding:6px 8px 16px; }
        .brand .mark { width:28px; height:28px; border-radius:9px; background:linear-gradient(135deg,var(--brand),var(--gold)); display:grid; place-items:center; color:#042; font-weight:900; }
        .side-nav { display:flex; flex-direction:column; gap:3px; margin-top:6px; }
        .side-nav a { display:block; padding:10px 12px; border-radius:10px; color:var(--muted); font-weight:600; font-size:14px; }
        .side-nav a:hover { background:rgba(255,255,255,.04); color:var(--fg); text-decoration:none; }
        .side-nav a.active { background:linear-gradient(135deg,rgba(18,184,134,.18),rgba(224,184,78,.12)); color:var(--fg); box-shadow:inset 2px 0 0 var(--brand); }
        .side-foot { margin-top:auto; padding-top:14px; border-top:1px solid var(--line); font-size:13px; color:var(--muted); }
        .side-foot .who { padding:4px 8px 10px; }
        .wrap { max-width:1080px; margin:0 auto; padding:28px 26px 60px; }
        @media (max-width:820px){
            .app { flex-direction:column; }
            .sidebar { width:auto; height:auto; position:static; flex-direction:row; align-items:center; overflow-x:auto; gap:6px; padding:10px 12px; }
            .brand { padding:6px 8px; } .side-nav { flex-direction:row; margin-top:0; }
            .side-nav a { white-space:nowrap; padding:8px 12px; } .side-foot { margin-top:0; border:none; border-left:1px solid var(--line); padding:0 0 0 10px; } .side-foot .who { display:none; }
        }
        /* components */
        h1 { font-size:24px; margin:0 0 4px; letter-spacing:-.02em; } h2 { font-size:16px; margin:0 0 12px; }
        .sub { color:var(--muted); margin:0 0 22px; }
        .panel { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:20px; }
        .grid { display:grid; gap:16px; } .g4 { grid-template-columns:repeat(4,1fr); } .g2 { grid-template-columns:1.6fr 1fr; }
        @media (max-width:820px){ .g4{grid-template-columns:repeat(2,1fr);} .g2{grid-template-columns:1fr;} }
        .stat { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:18px; }
        .stat .n { font-size:30px; font-weight:800; background:linear-gradient(120deg,var(--brand),var(--gold)); -webkit-background-clip:text; background-clip:text; color:transparent; }
        .stat .l { color:var(--muted); font-size:13px; margin-top:4px; }
        table { width:100%; border-collapse:collapse; }
        th,td { text-align:left; padding:12px 14px; border-bottom:1px solid var(--line); font-size:14px; }
        th { color:var(--muted); font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
        tr:hover td { background:rgba(255,255,255,.02); }
        .pill { display:inline-block; padding:3px 9px; border-radius:999px; font-size:12px; font-weight:700; }
        .pill-UNCLAIMED { background:rgba(224,184,78,.16); color:var(--gold); }
        .pill-CLAIMED,.pill-DOC_REVIEW,.pill-ID_CHECK,.pill-OWNER_CALL { background:rgba(18,184,134,.16); color:var(--brand); }
        .pill-INFO_REQUESTED { background:rgba(242,155,90,.16); color:#f29b5a; }
        .pill-DECIDED { background:rgba(160,181,173,.16); color:var(--muted); }
        .btn { display:inline-flex; align-items:center; gap:6px; padding:9px 16px; border-radius:10px; border:1px solid var(--line); background:transparent; color:var(--fg); font-weight:600; font-size:14px; cursor:pointer; }
        .btn:hover { border-color:var(--brand); text-decoration:none; }
        .btn-primary { background:linear-gradient(135deg,var(--brand),var(--brand-2)); border:none; color:#042014; }
        .btn-gold { background:linear-gradient(135deg,var(--gold),#c99a2e); border:none; color:#2a1e04; }
        .btn-danger { border-color:rgba(242,85,90,.5); color:var(--danger); }
        .btn-sm { padding:6px 12px; font-size:13px; }
        input,select,textarea { width:100%; padding:10px 12px; border-radius:10px; border:1.5px solid var(--line); background:#0c1a16; color:var(--fg); font-size:14px; font-family:inherit; }
        input:focus,select,textarea:focus { outline:none; border-color:var(--brand); }
        label { display:block; font-size:12px; color:var(--muted); font-weight:600; margin:0 0 6px; text-transform:uppercase; letter-spacing:.03em; }
        .flash { padding:12px 16px; border-radius:12px; margin-bottom:18px; font-size:14px; font-weight:600; }
        .flash-success { background:rgba(18,184,134,.14); color:var(--brand); border:1px solid rgba(18,184,134,.3); }
        .flash-error { background:rgba(242,85,90,.14); color:var(--danger); border:1px solid rgba(242,85,90,.3); }
        .kv { display:grid; grid-template-columns:150px 1fr; gap:8px 16px; font-size:14px; } .kv dt{ color:var(--muted); } .kv dd{ margin:0; }
        .doc { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; border:1px solid var(--line); border-radius:10px; margin-bottom:8px; }
        .muted { color:var(--muted); } .row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
        .divider { height:1px; background:var(--line); margin:20px 0; }
        .radios label { display:inline-flex; align-items:center; gap:5px; margin:0 12px 0 0; text-transform:none; font-weight:500; color:var(--fg); font-size:13px; }
        .radios input { width:auto; }
    </style>
</head>
<body>
<?php $this->beginBody() ?>
<?php if ($user): ?>
    <div class="app">
        <aside class="sidebar">
            <a class="brand" href="<?= Url::to(['/dashboard/index']) ?>"><span class="mark">V</span> ValEstate</a>
            <nav class="side-nav">
                <?php foreach ($nav as $item): ?>
                    <a class="<?= $active($item['match']) ? 'active' : '' ?>" href="<?= Url::to($item['route']) ?>"><?= Html::encode($item['label']) ?></a>
                <?php endforeach; ?>
            </nav>
            <div class="side-foot">
                <div class="who">
                    <div style="color:var(--fg); font-weight:600;"><?= Html::encode($user->name) ?></div>
                    <div style="font-size:12px;"><?= Html::encode(implode(', ', $user->getRoleKeys())) ?></div>
                </div>
                <?= Html::beginForm(['/auth/logout'], 'post', ['style' => 'margin:0']) ?>
                <button class="btn btn-sm" type="submit" style="width:100%; justify-content:center;">Logout</button>
                <?= Html::endForm() ?>
            </div>
        </aside>
        <div class="content">
            <div class="wrap">
                <?php foreach (['success', 'error'] as $type): ?>
                    <?php if (Yii::$app->session->hasFlash($type)): ?>
                        <div class="flash flash-<?= $type ?>"><?= Html::encode(Yii::$app->session->getFlash($type)) ?></div>
                    <?php endif; ?>
                <?php endforeach; ?>
                <?= $content ?>
            </div>
        </div>
    </div>
<?php else: ?>
    <div class="wrap">
        <?php foreach (['success', 'error'] as $type): ?>
            <?php if (Yii::$app->session->hasFlash($type)): ?>
                <div class="flash flash-<?= $type ?>"><?= Html::encode(Yii::$app->session->getFlash($type)) ?></div>
            <?php endif; ?>
        <?php endforeach; ?>
        <?= $content ?>
    </div>
<?php endif; ?>
<?php $this->endBody() ?>
</body>
</html>
<?php $this->endPage() ?>
