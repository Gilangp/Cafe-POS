<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['message' => 'Post list endpoint']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Create post endpoint']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Show post endpoint']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Update post endpoint']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Delete post endpoint']);
    }
}
