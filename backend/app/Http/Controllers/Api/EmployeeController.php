<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(['message' => 'Employee list endpoint']);
    }

    public function store(Request $request)
    {
        return response()->json(['message' => 'Create employee endpoint']);
    }

    public function show($id)
    {
        return response()->json(['message' => 'Show employee endpoint']);
    }

    public function update(Request $request, $id)
    {
        return response()->json(['message' => 'Update employee endpoint']);
    }

    public function destroy($id)
    {
        return response()->json(['message' => 'Delete employee endpoint']);
    }
}
