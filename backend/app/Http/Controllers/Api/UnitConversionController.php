<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UnitConversion;
use Illuminate\Http\Request;

class UnitConversionController extends Controller
{
    public function index()
    {
        return response()->json(UnitConversion::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_unit' => 'required|string|max:50',
            'to_unit' => 'required|string|max:50',
            'multiplier' => 'required|numeric|min:0.0001',
        ]);

        $validated['from_unit'] = strtolower($validated['from_unit']);
        $validated['to_unit'] = strtolower($validated['to_unit']);

        // Check if exists
        $existing = UnitConversion::where('from_unit', $validated['from_unit'])
            ->where('to_unit', $validated['to_unit'])
            ->first();

        if ($existing) {
            return response()->json(['error' => 'Konversi satuan ini sudah ada.'], 400);
        }

        $conversion = UnitConversion::create($validated);

        return response()->json($conversion, 201);
    }

    public function update(Request $request, UnitConversion $unitConversion)
    {
        $validated = $request->validate([
            'multiplier' => 'required|numeric|min:0.0001',
        ]);

        $unitConversion->update($validated);

        return response()->json($unitConversion);
    }

    public function destroy(UnitConversion $unitConversion)
    {
        $unitConversion->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
