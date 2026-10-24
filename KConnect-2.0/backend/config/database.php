<?php
return [
    'default' => env('DB_CONNECTION', 'mysql'),
    'connections' => [
        'mysql' => [
            'driver' => 'mysql', 'host' => env('DB_HOST', '127.0.0.1'), 'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'kconnect_staging'), 'username' => env('DB_USERNAME'),
            'password' => env('DB_PASSWORD'), 'unix_socket' => env('DB_SOCKET', ''),
            'charset' => 'utf8mb4', 'collation' => env('DB_COLLATION', 'utf8mb4_unicode_ci'),
            'prefix' => '', 'strict' => true, 'engine' => 'InnoDB', 'timezone' => '+00:00',
        ],
        'sqlite' => ['driver' => 'sqlite', 'database' => env('DB_DATABASE', ':memory:'), 'prefix' => '', 'foreign_key_constraints' => true],
    ],
    'migrations' => ['table' => 'migrations', 'update_date_on_publish' => true],
];
