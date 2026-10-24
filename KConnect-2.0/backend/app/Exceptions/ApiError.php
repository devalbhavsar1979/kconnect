<?php
namespace App\Exceptions;
final class ApiError extends \RuntimeException
{
    public function __construct(public readonly int $status, public readonly string|array $detail, public readonly array $headers = [])
    { parent::__construct(is_string($detail) ? $detail : 'Validation failed'); }
}
