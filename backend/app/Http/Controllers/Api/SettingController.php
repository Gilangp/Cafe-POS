<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'settings' => [
                'app_name' => 'Velvra',
                'timezone' => 'Asia/Jakarta',
                'currency' => 'IDR',
                'tax_rate' => 10,
            ],
        ]);
    }

    public function update(Request $request)
    {
        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }
}
