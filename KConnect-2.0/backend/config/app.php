<?php
return [
    'name' => 'K-CONNECT', 'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false), 'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC', 'locale' => 'en', 'fallback_locale' => 'en',
    'key' => env('APP_KEY'), 'cipher' => 'AES-256-CBC',
    'maintenance' => ['driver' => 'file'],
];
