<?php

return [
    'name' => env('APP_NAME', 'Velvra'),
    'env' => env('APP_ENV', 'production'),
    'channels' => [
        'stack' => [
            'driver' => 'stack',
            'channels' => ['single'],
            'ignore_exceptions' => false,
        ],
        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
        ],
    ],
];
