<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['message' => 'Page list endpoint']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Create page endpoint']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Show page endpoint']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Update page endpoint']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Delete page endpoint']);
    }
}
