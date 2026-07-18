<?php

declare(strict_types=1);

namespace app\services;

/**
 * Domain/service error with a transport-agnostic kind, so REST and the admin
 * console can present the same failure differently (HTTP code vs. flash message).
 */
final class ServiceException extends \RuntimeException
{
    public const CONFLICT = 'CONFLICT';
    public const FORBIDDEN = 'FORBIDDEN';
    public const UNPROCESSABLE = 'UNPROCESSABLE';
    public const NOT_FOUND = 'NOT_FOUND';

    public string $kind;
    /** @var array<int,array<string,string>> */
    public array $details;

    /** @param array<int,array<string,string>> $details */
    public function __construct(string $kind, string $message, array $details = [])
    {
        parent::__construct($message);
        $this->kind = $kind;
        $this->details = $details;
    }

    public function httpStatus(): int
    {
        return match ($this->kind) {
            self::CONFLICT => 409,
            self::FORBIDDEN => 403,
            self::UNPROCESSABLE => 422,
            self::NOT_FOUND => 404,
            default => 400,
        };
    }
}
