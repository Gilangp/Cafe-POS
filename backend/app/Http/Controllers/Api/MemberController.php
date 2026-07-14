<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use App\Models\LoyaltyTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = Member::with('tier', 'branch');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('member_code', 'like', "%{$search}%");
            });
        }

        if ($request->has('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->has('membership_tier_id')) {
            $query->where('membership_tier_id', $request->membership_tier_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $members = $query->latest()->paginate($request->input('per_page', 20));

        return response()->json($members);
    }

    public function lookup(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:100',
        ]);

        $search = $request->input('query');
        $members = Member::with('tier')
            ->where('phone', 'like', "%{$search}%")
            ->orWhere('member_code', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->limit(10)
            ->get();

        return response()->json($members);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'user_id' => 'nullable|exists:users,id',
            'membership_tier_id' => 'nullable|exists:membership_tiers,id',
            'full_name' => 'required|string|max:160',
            'email' => 'nullable|email|max:160',
            'phone' => 'nullable|string|max:40',
            'birth_date' => 'nullable|date',
            'status' => ['nullable', Rule::in(['ACTIVE', 'INACTIVE', 'SUSPENDED'])],
        ]);

        $memberCode = 'MBR-'.Str::upper(Str::random(8));

        $member = Member::create(array_merge($validated, [
            'member_code' => $memberCode,
            'points_balance' => 0,
            'lifetime_spend_cents' => 0,
            'status' => $validated['status'] ?? 'ACTIVE',
        ]));

        return response()->json($member->load('tier', 'branch'), 201);
    }

    public function show(Member $member)
    {
        $member->load([
            'tier',
            'branch',
            'loyaltyTransactions' => fn($q) => $q->latest()->limit(20),
            'orders' => fn($q) => $q->latest()->limit(10)->with('items.product'),
        ]);

        return response()->json($member);
    }

    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'membership_tier_id' => 'nullable|exists:membership_tiers,id',
            'full_name' => 'sometimes|required|string|max:160',
            'email' => 'nullable|email|max:160',
            'phone' => 'nullable|string|max:40',
            'birth_date' => 'nullable|date',
            'status' => ['sometimes', Rule::in(['ACTIVE', 'INACTIVE', 'SUSPENDED'])],
        ]);

        $member->update($validated);

        return response()->json($member->load('tier', 'branch'));
    }

    public function destroy(Member $member)
    {
        $member->delete();
        return response()->json(['message' => 'Member deleted successfully.']);
    }

    public function adjustPoints(Request $request, Member $member)
    {
        $validated = $request->validate([
            'points' => 'required|integer',
            'description' => 'required|string|max:255',
        ]);

        $points = (int) $validated['points'];

        DB::transaction(function () use ($member, $points, $validated) {
            $member->increment('points_balance', $points);
            LoyaltyTransaction::create([
                'member_id' => $member->id,
                'type' => 'ADJUST',
                'points' => $points,
                'description' => $validated['description'],
                'expires_at' => null,
            ]);
        });

        return response()->json($member->fresh()->load('tier', 'loyaltyTransactions'));
    }
}
