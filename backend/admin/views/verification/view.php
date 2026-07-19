<?php

/** @var yii\web\View $this */
/** @var app\models\VerificationCase $case */
/** @var app\models\Property $p */
/** @var app\models\User $owner */
/** @var array $checklist */
/** @var array $docs */
/** @var array $events */
/** @var bool $canAct */

use app\models\VerificationCase;
use yii\db\Query;
use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Case #' . $case->id;

$attrs = is_array($p->attributes_json) ? $p->attributes_json : (json_decode((string) $p->attributes_json, true) ?: []);
$localityName = (new Query())->select('name')->from('localities')->where(['id' => $p->locality_id])->scalar() ?: '—';
$decided = $case->state === VerificationCase::DECIDED;
$price = $p->price_minor !== null ? '₹' . number_format((int) $p->price_minor) : '—';

$reasonCodes = [
    'DOC_MISSING', 'DOC_ILLEGIBLE', 'DOC_NAME_MISMATCH', 'DOC_SUSPECTED_FORGERY',
    'ID_MISMATCH', 'ID_INVALID', 'ADDRESS_MISMATCH', 'PHOTOS_MISMATCH', 'BAIT_PRICING',
    'OWNER_UNREACHABLE', 'OWNER_DECLINED', 'DUPLICATE_CONFIRMED', 'FRAUD_SUSPECTED', 'POLICY_VIOLATION',
];
?>
<div class="row" style="justify-content:space-between;">
    <div>
        <h1><?= Html::encode($p->title) ?></h1>
        <p class="sub">
            <span class="pill pill-<?= Html::encode($case->state) ?>"><?= Html::encode($case->state) ?></span>
            · <?= Html::encode(ucfirst(strtolower($p->property_type))) ?> · <?= Html::encode(ucfirst(strtolower($p->intent))) ?>
            <?php if ($decided): ?> · Decision: <strong><?= Html::encode((string) $case->decision) ?></strong><?php endif; ?>
        </p>
    </div>
    <a class="btn" href="<?= Url::to(['/verification']) ?>">← Queue</a>
</div>

<?php if ($case->state === VerificationCase::UNCLAIMED): ?>
    <div class="panel" style="margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:16px;">
        <span>This case is unclaimed. Claim it to run verification.</span>
        <?= Html::beginForm(['/verification/' . $case->id . '/claim'], 'post', ['style' => 'margin:0']) ?>
        <button class="btn btn-primary" type="submit">Claim case</button>
        <?= Html::endForm() ?>
    </div>
<?php endif; ?>

<div class="grid g2">
    <div>
        <!-- Property -->
        <div class="panel" style="margin-bottom:16px;">
            <h2>Property</h2>
            <dl class="kv">
                <dt>Price</dt><dd><?= $price ?> <?= Html::encode($p->currency) ?></dd>
                <?php if ($p->deposit_minor): ?><dt>Deposit</dt><dd>₹<?= number_format((int) $p->deposit_minor) ?></dd><?php endif; ?>
                <dt>Area</dt><dd><?= $p->area_value ? Html::encode($p->area_value) . ' ' . Html::encode((string) $p->area_unit) : '—' ?></dd>
                <?php if (!empty($attrs['bedrooms'])): ?><dt>Config</dt><dd><?= (int) $attrs['bedrooms'] ?> bed · <?= (int) ($attrs['bathrooms'] ?? 0) ?> bath</dd><?php endif; ?>
                <dt>Locality</dt><dd><?= Html::encode($localityName) ?>, Imphal</dd>
                <dt>Address</dt><dd><?= Html::encode((string) $p->address_line) ?> <?= Html::encode((string) $p->pincode) ?></dd>
            </dl>
            <?php if ($p->description): ?>
                <div class="divider"></div>
                <p class="muted" style="font-size:14px; line-height:1.6;"><?= nl2br(Html::encode($p->description)) ?></p>
            <?php endif; ?>
        </div>

        <!-- Documents -->
        <div class="panel" style="margin-bottom:16px;">
            <h2>Documents <span class="muted" style="font-weight:400;">(access is audited)</span></h2>
            <?php if (!$docs): ?>
                <p class="muted">No documents uploaded.</p>
            <?php else: ?>
                <?php foreach ($docs as $doc): ?>
                    <div class="doc">
                        <span><strong><?= Html::encode($doc['doc_type']) ?></strong> <span class="muted">· <?= Html::encode($doc['uploaded_at']) ?></span></span>
                        <?php if ($canAct): ?>
                            <a class="btn btn-sm" target="_blank" rel="noopener" href="<?= Url::to(['/verification/' . $case->id . '/document/' . $doc['id']]) ?>">View</a>
                        <?php else: ?>
                            <span class="muted" style="font-size:12px;">claim to view</span>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>

        <?php if ($canAct && !$decided): ?>
            <!-- Checklist -->
            <div class="panel" style="margin-bottom:16px;">
                <h2>Verification checklist</h2>
                <?= Html::beginForm(['/verification/' . $case->id . '/checklist'], 'post') ?>
                <?php foreach ($checklist as $item): ?>
                    <div style="padding:10px 0; border-bottom:1px solid var(--line);">
                        <div class="row" style="justify-content:space-between;">
                            <span style="font-size:14px;">
                                <?= Html::encode(ucwords(str_replace('_', ' ', $item['item_key']))) ?>
                                <?php if ($item['mandatory']): ?><span style="color:var(--gold)">*</span><?php endif; ?>
                            </span>
                            <span class="radios">
                                <?php foreach (['PASS', 'FAIL', 'NA'] as $opt): ?>
                                    <label><input type="radio" name="result[<?= Html::encode($item['item_key']) ?>]" value="<?= $opt ?>" <?= $item['result'] === $opt ? 'checked' : '' ?>> <?= $opt ?></label>
                                <?php endforeach; ?>
                            </span>
                        </div>
                    </div>
                <?php endforeach; ?>
                <button class="btn btn-primary btn-sm" type="submit" style="margin-top:14px;">Save checklist</button>
                <?= Html::endForm() ?>
            </div>

            <!-- Decision -->
            <div class="panel">
                <h2>Decision</h2>
                <div class="grid g2" style="gap:20px;">
                    <?= Html::beginForm(['/verification/' . $case->id . '/decision'], 'post') ?>
                    <div>
                        <input type="hidden" name="decision" value="APPROVED">
                        <label>Approve &amp; publish</label>
                        <p class="muted" style="font-size:12px; margin:0 0 10px;">All mandatory checks must be PASS.</p>
                        <button class="btn btn-primary" type="submit">✓ Approve &amp; publish</button>
                    </div>
                    <?= Html::endForm() ?>

                    <?= Html::beginForm(['/verification/' . $case->id . '/decision'], 'post') ?>
                    <div>
                        <input type="hidden" name="decision" value="REJECTED">
                        <label>Reject</label>
                        <select name="reasonCode" required style="margin-bottom:8px;">
                            <option value="">Reason code…</option>
                            <?php foreach ($reasonCodes as $rc): ?><option value="<?= $rc ?>"><?= $rc ?></option><?php endforeach; ?>
                        </select>
                        <input name="note" placeholder="Note (optional)" style="margin-bottom:10px;">
                        <button class="btn btn-danger" type="submit">Reject</button>
                    </div>
                    <?= Html::endForm() ?>
                </div>

                <div class="divider"></div>
                <?= Html::beginForm(['/verification/' . $case->id . '/request-info'], 'post') ?>
                <label>Request more info from owner (pauses SLA)</label>
                <div class="row">
                    <select name="reasonCode" style="max-width:260px;">
                        <option value="">Reason (optional)…</option>
                        <?php foreach ($reasonCodes as $rc): ?><option value="<?= $rc ?>"><?= $rc ?></option><?php endforeach; ?>
                    </select>
                    <input name="note" placeholder="What's needed?" style="flex:1; min-width:180px;">
                    <button class="btn btn-gold" type="submit">Request info</button>
                </div>
                <?= Html::endForm() ?>
            </div>
        <?php elseif ($decided): ?>
            <div class="panel"><h2>Decision recorded</h2>
                <dl class="kv">
                    <dt>Decision</dt><dd><strong><?= Html::encode((string) $case->decision) ?></strong></dd>
                    <?php if ($case->reason_code): ?><dt>Reason</dt><dd><?= Html::encode($case->reason_code) ?></dd><?php endif; ?>
                    <dt>Decided at</dt><dd><?= Html::encode((string) $case->decided_at) ?></dd>
                </dl>
                <?php if ($canReopen): ?>
                    <div class="divider"></div>
                    <?= Html::beginForm(['/listings/reopen/' . $case->id], 'post', ['style' => 'margin:0']) ?>
                    <button class="btn btn-primary" type="submit">Re-open for recheck</button>
                    <span class="muted" style="font-size:12px; margin-left:8px;">Overturn / appeal — puts it back in your queue.</span>
                    <?= Html::endForm() ?>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <!-- Duplicate check -->
        <div class="panel" style="margin-top:16px;">
            <h2>Duplicate check <span class="muted" style="font-weight:400;">(<?= count($dupes) ?> potential)</span></h2>
            <?php if (!$dupes): ?>
                <p class="muted">No likely duplicates in this locality.</p>
            <?php else: ?>
                <?php foreach ($dupes as $dup): ?>
                    <div class="doc">
                        <span>
                            <strong><?= Html::encode($dup['property']->title) ?></strong>
                            <span class="muted">· <?= Html::encode($dup['property']->status) ?></span>
                            <div class="muted" style="font-size:12px;"><?= Html::encode(implode(' · ', $dup['reasons'])) ?></div>
                        </span>
                        <span class="pill pill-UNCLAIMED"><?= (int) $dup['score'] ?>% match</span>
                    </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>

    <!-- sidebar -->
    <div>
        <div class="panel" style="margin-bottom:16px;">
            <h2>Owner <span class="muted" style="font-weight:400;">(for the call)</span></h2>
            <dl class="kv">
                <dt>Name</dt><dd><?= Html::encode($owner->name) ?></dd>
                <dt>Phone</dt><dd><?= Html::encode((string) $owner->phone) ?></dd>
                <dt>Email</dt><dd><?= Html::encode($owner->email) ?></dd>
            </dl>
        </div>
        <div class="panel" style="margin-bottom:16px;">
            <h2>Case</h2>
            <dl class="kv">
                <dt>Case ID</dt><dd>#<?= (int) $case->id ?></dd>
                <dt>State</dt><dd><span class="pill pill-<?= Html::encode($case->state) ?>"><?= Html::encode($case->state) ?></span></dd>
                <dt>SLA due</dt><dd><?= Html::encode((string) ($case->sla_due_at ?? '—')) ?></dd>
            </dl>
        </div>
        <div class="panel">
            <h2>History</h2>
            <?php if (!$events): ?><p class="muted">No events yet.</p><?php endif; ?>
            <?php foreach ($events as $e): ?>
                <div style="font-size:13px; padding:6px 0; border-bottom:1px solid var(--line);">
                    <span class="muted"><?= Html::encode((string) ($e['from_state'] ?? '∅')) ?></span> →
                    <strong><?= Html::encode($e['to_state']) ?></strong>
                    <?php if ($e['reason_code']): ?> <span class="muted">(<?= Html::encode($e['reason_code']) ?>)</span><?php endif; ?>
                    <div class="muted" style="font-size:11px;"><?= Html::encode($e['created_at']) ?></div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
