<?php

namespace App\Exceptions\Api;

use Exception;

class ApiException extends Exception
{
    public function __construct(
        string $message,
        public readonly int $statusCode,
        public readonly string $errorCode,
        public readonly ?array $details = null
    ) {
        parent::__construct($message);
    }
}