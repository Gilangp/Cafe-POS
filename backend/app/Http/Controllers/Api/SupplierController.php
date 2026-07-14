<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['message' => 'Supplier list endpoint']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Create supplier endpoint']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Show supplier endpoint']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Update supplier endpoint']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Delete supplier endpoint']);
    }
}
