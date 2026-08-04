<?php

namespace Tests;

use App\Models\Role;
use App\Models\User;

trait WithRoles
{
    protected function createUserWithRole(string $roleName, array $userAttributes = []): User
    {
        $role = Role::firstOrCreate(['name' => $roleName]);

        $user = User::factory()->create($userAttributes);
        $user->roles()->attach($role->id);

        return $user->load('roles');
    }

    protected function createOwner(array $attributes = []): User
    {
        return $this->createUserWithRole('Owner', $attributes);
    }

    protected function createAdmin(array $attributes = []): User
    {
        return $this->createUserWithRole('Admin', $attributes);
    }

    protected function createKasir(array $attributes = []): User
    {
        return $this->createUserWithRole('Kasir', $attributes);
    }

    protected function createDapur(array $attributes = []): User
    {
        return $this->createUserWithRole('Dapur_Barista', $attributes);
    }
}
