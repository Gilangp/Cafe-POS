<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $query = Branch::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $branches = $query->paginate($request->input('per_page', 15));

        return response()->json($branches);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:branches',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'timezone' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:3',
            'opening_hours' => 'nullable|array',
        ]);

        $branch = Branch::create($validated);

        return response()->json($branch, 201);
    }

    public function show(Branch $branch)
    {
        return response()->json($branch);
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'code' => 'string|max:50|unique:branches,code,' . $branch->id,
            'address' => 'string',
            'city' => 'string|max:100',
            'province' => 'string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'phone' => 'string|max:20',
            'email' => 'email|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'timezone' => 'nullable|string|max:50',
            'currency' => 'nullable|string|max:3',
            'is_active' => 'boolean',
            'opening_hours' => 'nullable|array',
        ]);

        $branch->update($validated);

        return response()->json($branch);
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();

        return response()->json([
            'message' => 'Branch deleted successfully',
        ]);
    }
}
