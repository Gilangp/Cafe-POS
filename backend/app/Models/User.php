<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'branch_id',
        'role',
        'is_active',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
        'password' => 'hashed',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class);
    }

    public function member()
    {
        return $this->hasOne(Member::class);
    }

    public function hasRole(string $role): bool
    {
        if ($this->role === $role) {
            return true;
        }

        return $this->roles()->where('name', $role)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', fn ($query) => $query->where('name', $permission))
            ->exists();
    }

    public function canAccessBranch(?int $branchId): bool
    {
        if ($this->hasRole('super_admin') || $this->hasRole('corporate_admin')) {
            return true;
        }

        return $branchId === null || (int) $this->branch_id === (int) $branchId;
    }
}
