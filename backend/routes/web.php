<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Velvra API',
        'version' => '1.0.0',
        'status' => 'online',
        'documentation' => url('/api/documentation'),
    ]);
});
