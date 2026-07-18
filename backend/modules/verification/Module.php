<?php

declare(strict_types=1);

namespace app\modules\verification;

/** Verification bounded context (docs/04 §6, docs/07). */
class Module extends \yii\base\Module
{
    public $controllerNamespace = 'app\\modules\\verification\\controllers';
}
