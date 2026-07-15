<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get list of users with their assigned roles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('roles');

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna sistem.',
            'data' => $users,
            'meta' => ['total' => $users->count()],
        ]);
    }

    /**
     * Create a new user with roles.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:25',
            'is_active' => 'boolean',
            'role_ids' => 'required|array',
            'role_ids.*' => 'uuid|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['role_ids'])) {
            $user->roles()->sync($validated['role_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil ditambahkan.',
            'data' => $user->load('roles'),
            'meta' => null,
        ], 201);
    }

    /**
     * Show single user detail.
     */
    public function show(string $id): JsonResponse
    {
        $user = User::with('roles')->findOrFail($id);
        return response()->json(['success' => true, 'message' => 'Detail pengguna.', 'data' => $user, 'meta' => null]);
    }

    /**
     * Update user details and roles.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:25',
            'is_active' => 'boolean',
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'uuid|exists:roles,id',
        ]);

        if (isset($validated['name'])) $user->name = $validated['name'];
        if (isset($validated['email'])) $user->email = $validated['email'];
        if (array_key_exists('phone', $validated)) $user->phone = $validated['phone'];
        if (isset($validated['is_active'])) $user->is_active = $validated['is_active'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);

        $user->save();

        if ($request->has('role_ids')) {
            $user->roles()->sync($validated['role_ids'] ?? []);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil diperbarui.',
            'data' => $user->load('roles'),
            'meta' => null,
        ]);
    }

    /**
     * Delete user.
     */
    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->roles()->detach();
        $user->delete();

        return response()->json(['success' => true, 'message' => 'Pengguna berhasil dihapus.', 'data' => null, 'meta' => null]);
    }

    /**
     * Get all system roles.
     */
    public function roles(): JsonResponse
    {
        $roles = Role::orderBy('name')->get();
        return response()->json(['success' => true, 'message' => 'Daftar peran sistem.', 'data' => $roles, 'meta' => null]);
    }
}
