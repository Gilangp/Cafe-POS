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

    public function scopedBranches()
    {
        return $this->belongsToMany(Branch::class, 'user_branch_scope');
    }

    public function getScopedBranchIds(): array
    {
        if ($this->hasRole('super_admin') || $this->hasRole('corporate_admin') || $this->hasRole('regional_analyst') || $this->hasRole('marketing_manager') || $this->hasRole('crm_officer') || $this->hasRole('hr_manager')) {
            return Branch::pluck('id')->all();
        }

        $scopedIds = $this->scopedBranches()->pluck('branches.id')->all();
        if ($this->branch_id && !in_array($this->branch_id, $scopedIds)) {
            $scopedIds[] = (int) $this->branch_id;
        }

        return $scopedIds;
    }

    public function canAccessBranch(?int $branchId): bool
    {
        if ($branchId === null) {
            return true;
        }

        if ($this->hasRole('super_admin') || $this->hasRole('corporate_admin') || $this->hasRole('regional_analyst') || $this->hasRole('marketing_manager') || $this->hasRole('crm_officer') || $this->hasRole('hr_manager')) {
            return true;
        }

        return in_array((int) $branchId, $this->getScopedBranchIds());
    }
}
