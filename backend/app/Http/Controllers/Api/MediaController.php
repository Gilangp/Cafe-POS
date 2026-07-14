<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['message' => 'Media list endpoint']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Upload media endpoint']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Show media endpoint']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Update media endpoint']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Delete media endpoint']);
    }
}
