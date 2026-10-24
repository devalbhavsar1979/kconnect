<?php
return ['default' => 'single', 'channels' => ['single' => [
    'driver' => 'single', 'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'warning'), 'replace_placeholders' => true,
]]];
