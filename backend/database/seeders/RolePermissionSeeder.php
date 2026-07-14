<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'super_admin', 'display_name' => 'Super Admin', 'scope' => 'SYSTEM'],
            ['name' => 'corporate_admin', 'display_name' => 'Corporate Admin', 'scope' => 'ORGANIZATION'],
            ['name' => 'branch_manager', 'display_name' => 'Branch Manager', 'scope' => 'BRANCH'],
            ['name' => 'cashier', 'display_name' => 'Cashier', 'scope' => 'BRANCH'],
            ['name' => 'kitchen_staff', 'display_name' => 'Kitchen Staff', 'scope' => 'BRANCH'],
            ['name' => 'inventory_staff', 'display_name' => 'Inventory Staff', 'scope' => 'BRANCH'],
            ['name' => 'customer', 'display_name' => 'Customer', 'scope' => 'SYSTEM'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['name' => $role['name']],
                array_merge($role, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        $permissions = [
            ['name' => 'users.read', 'module' => 'users', 'action' => 'read'],
            ['name' => 'users.create', 'module' => 'users', 'action' => 'create'],
            ['name' => 'users.update', 'module' => 'users', 'action' => 'update'],
            ['name' => 'users.delete', 'module' => 'users', 'action' => 'delete'],
            ['name' => 'branches.read', 'module' => 'branches', 'action' => 'read'],
            ['name' => 'branches.create', 'module' => 'branches', 'action' => 'create'],
            ['name' => 'branches.update', 'module' => 'branches', 'action' => 'update'],
            ['name' => 'orders.read', 'module' => 'orders', 'action' => 'read'],
            ['name' => 'orders.create', 'module' => 'orders', 'action' => 'create'],
            ['name' => 'orders.cancel', 'module' => 'orders', 'action' => 'cancel'],
            ['name' => 'orders.update_status', 'module' => 'orders', 'action' => 'update_status'],
            ['name' => 'menu.read', 'module' => 'menu', 'action' => 'read'],
            ['name' => 'menu.create', 'module' => 'menu', 'action' => 'create'],
            ['name' => 'menu.update', 'module' => 'menu', 'action' => 'update'],
            ['name' => 'menu.delete', 'module' => 'menu', 'action' => 'delete'],
            ['name' => 'inventory.read', 'module' => 'inventory', 'action' => 'read'],
            ['name' => 'inventory.adjust', 'module' => 'inventory', 'action' => 'adjust'],
            ['name' => 'procurement.read', 'module' => 'procurement', 'action' => 'read'],
            ['name' => 'procurement.create', 'module' => 'procurement', 'action' => 'create'],
            ['name' => 'procurement.approve', 'module' => 'procurement', 'action' => 'approve'],
            ['name' => 'procurement.receive', 'module' => 'procurement', 'action' => 'receive'],
            ['name' => 'pos.use', 'module' => 'pos', 'action' => 'use'],
            ['name' => 'pos.close', 'module' => 'pos', 'action' => 'close'],
            ['name' => 'kds.read', 'module' => 'kds', 'action' => 'read'],
            ['name' => 'kds.update', 'module' => 'kds', 'action' => 'update'],
            ['name' => 'members.read', 'module' => 'members', 'action' => 'read'],
            ['name' => 'members.create', 'module' => 'members', 'action' => 'create'],
            ['name' => 'members.update', 'module' => 'members', 'action' => 'update'],
            ['name' => 'reservations.read', 'module' => 'reservations', 'action' => 'read'],
            ['name' => 'reservations.update', 'module' => 'reservations', 'action' => 'update'],
            ['name' => 'cms.create', 'module' => 'cms', 'action' => 'create'],
            ['name' => 'cms.update', 'module' => 'cms', 'action' => 'update'],
            ['name' => 'cms.publish', 'module' => 'cms', 'action' => 'publish'],
            ['name' => 'media.upload', 'module' => 'media', 'action' => 'upload'],
            ['name' => 'reports.read', 'module' => 'reports', 'action' => 'read'],
            ['name' => 'reports.export', 'module' => 'reports', 'action' => 'export'],
        ];

        foreach ($permissions as $permission) {
            DB::table('permissions')->updateOrInsert(
                ['name' => $permission['name']],
                array_merge($permission, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        $allPermissionIds = DB::table('permissions')->pluck('id')->all();
        $rolePermissions = [
            'super_admin' => $allPermissionIds,
            'corporate_admin' => DB::table('permissions')->whereIn('module', ['branches', 'users', 'reports', 'cms', 'media'])->pluck('id')->all(),
            'branch_manager' => DB::table('permissions')->whereIn('module', ['orders', 'menu', 'inventory', 'procurement', 'pos', 'kds', 'members', 'reservations', 'reports'])->pluck('id')->all(),
            'cashier' => DB::table('permissions')->whereIn('name', ['pos.use', 'orders.read', 'orders.create', 'members.read'])->pluck('id')->all(),
            'kitchen_staff' => DB::table('permissions')->whereIn('name', ['kds.read', 'kds.update', 'orders.read'])->pluck('id')->all(),
            'inventory_staff' => DB::table('permissions')->whereIn('module', ['inventory', 'procurement'])->pluck('id')->all(),
            'customer' => DB::table('permissions')->whereIn('name', ['orders.create', 'orders.read', 'menu.read'])->pluck('id')->all(),
        ];

        foreach ($rolePermissions as $roleName => $permissionIds) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');
            foreach ($permissionIds as $permissionId) {
                DB::table('permission_role')->insertOrIgnore([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                ]);
            }
        }

        $this->command->info('Roles, permissions, and role mappings ready.');
    }
}