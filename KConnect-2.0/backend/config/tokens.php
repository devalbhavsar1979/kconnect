<?php
return [
    'secret' => env('JWT_SECRET_KEY', ''),
    'access_minutes' => (int) env('ACCESS_TOKEN_EXPIRE_MINUTES', 30),
    'refresh_days' => (int) env('REFRESH_TOKEN_EXPIRE_DAYS', 7),
];
