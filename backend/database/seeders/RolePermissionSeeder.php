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
            ['name' => 'regional_analyst', 'display_name' => 'Regional / Executive Analyst', 'scope' => 'SYSTEM'],
            ['name' => 'corporate_admin', 'display_name' => 'Corporate Admin', 'scope' => 'ORGANIZATION'],
            ['name' => 'branch_manager', 'display_name' => 'Branch Manager', 'scope' => 'BRANCH'],
            ['name' => 'shift_supervisor', 'display_name' => 'Shift Supervisor', 'scope' => 'BRANCH'],
            ['name' => 'cashier', 'display_name' => 'Barista / Cashier', 'scope' => 'BRANCH'],
            ['name' => 'kitchen_staff', 'display_name' => 'Kitchen Staff', 'scope' => 'BRANCH'],
            ['name' => 'inventory_officer', 'display_name' => 'Inventory Officer', 'scope' => 'BRANCH'],
            ['name' => 'inventory_staff', 'display_name' => 'Inventory Staff', 'scope' => 'BRANCH'],
            ['name' => 'hr_manager', 'display_name' => 'HR Manager', 'scope' => 'ORGANIZATION'],
            ['name' => 'marketing_manager', 'display_name' => 'Marketing / Content Manager', 'scope' => 'SYSTEM'],
            ['name' => 'crm_officer', 'display_name' => 'CRM / Support Officer', 'scope' => 'ORGANIZATION'],
            ['name' => 'customer', 'display_name' => 'Customer (Member)', 'scope' => 'SELF'],
            ['name' => 'guest', 'display_name' => 'Guest', 'scope' => 'PUBLIC'],
            ['name' => 'api_partner', 'display_name' => 'API Integration Partner', 'scope' => 'API'],
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
            ['name' => 'purchasing.read', 'module' => 'purchasing', 'action' => 'read'],
            ['name' => 'purchasing.create', 'module' => 'purchasing', 'action' => 'create'],
            ['name' => 'purchasing.approve', 'module' => 'purchasing', 'action' => 'approve'],
            ['name' => 'suppliers.read', 'module' => 'suppliers', 'action' => 'read'],
            ['name' => 'suppliers.create', 'module' => 'suppliers', 'action' => 'create'],
            ['name' => 'suppliers.update', 'module' => 'suppliers', 'action' => 'update'],
            ['name' => 'pos.use', 'module' => 'pos', 'action' => 'use'],
            ['name' => 'pos.close', 'module' => 'pos', 'action' => 'close'],
            ['name' => 'kds.read', 'module' => 'kds', 'action' => 'read'],
            ['name' => 'kds.update', 'module' => 'kds', 'action' => 'update'],
            ['name' => 'members.read', 'module' => 'members', 'action' => 'read'],
            ['name' => 'members.create', 'module' => 'members', 'action' => 'create'],
            ['name' => 'members.update', 'module' => 'members', 'action' => 'update'],
            ['name' => 'reservations.read', 'module' => 'reservations', 'action' => 'read'],
            ['name' => 'reservations.update', 'module' => 'reservations', 'action' => 'update'],
            ['name' => 'tables.read', 'module' => 'tables', 'action' => 'read'],
            ['name' => 'tables.update', 'module' => 'tables', 'action' => 'update'],
            ['name' => 'promotions.read', 'module' => 'promotions', 'action' => 'read'],
            ['name' => 'promotions.create', 'module' => 'promotions', 'action' => 'create'],
            ['name' => 'promotions.update', 'module' => 'promotions', 'action' => 'update'],
            ['name' => 'loyalty.read', 'module' => 'loyalty', 'action' => 'read'],
            ['name' => 'loyalty.manage', 'module' => 'loyalty', 'action' => 'manage'],
            ['name' => 'crm.read', 'module' => 'crm', 'action' => 'read'],
            ['name' => 'crm.update', 'module' => 'crm', 'action' => 'update'],
            ['name' => 'hr.read', 'module' => 'hr', 'action' => 'read'],
            ['name' => 'hr.manage', 'module' => 'hr', 'action' => 'manage'],
            ['name' => 'cms.create', 'module' => 'cms', 'action' => 'create'],
            ['name' => 'cms.update', 'module' => 'cms', 'action' => 'update'],
            ['name' => 'cms.publish', 'module' => 'cms', 'action' => 'publish'],
            ['name' => 'media.upload', 'module' => 'media', 'action' => 'upload'],
            ['name' => 'reports.read', 'module' => 'reports', 'action' => 'read'],
            ['name' => 'reports.export', 'module' => 'reports', 'action' => 'export'],
            ['name' => 'analytics.read', 'module' => 'analytics', 'action' => 'read'],
            ['name' => 'audit.read', 'module' => 'audit', 'action' => 'read'],
            ['name' => 'settings.manage', 'module' => 'settings', 'action' => 'manage'],
            ['name' => 'notifications.send', 'module' => 'notifications', 'action' => 'send'],
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
            'regional_analyst' => DB::table('permissions')->whereIn('module', ['analytics', 'reports', 'branches'])->pluck('id')->all(),
            'corporate_admin' => DB::table('permissions')->whereIn('module', ['branches', 'users', 'reports', 'cms', 'media', 'hr', 'analytics'])->pluck('id')->all(),
            'branch_manager' => DB::table('permissions')->whereIn('module', ['orders', 'menu', 'inventory', 'procurement', 'purchasing', 'suppliers', 'pos', 'kds', 'members', 'reservations', 'tables', 'reports', 'hr', 'analytics', 'audit', 'notifications'])->pluck('id')->all(),
            'shift_supervisor' => DB::table('permissions')->whereIn('module', ['orders', 'pos', 'kds', 'reservations', 'tables', 'members', 'reports', 'hr'])->pluck('id')->all(),
            'cashier' => DB::table('permissions')->whereIn('name', ['pos.use', 'pos.close', 'orders.read', 'orders.create', 'orders.update_status', 'members.read', 'reservations.read'])->pluck('id')->all(),
            'kitchen_staff' => DB::table('permissions')->whereIn('name', ['kds.read', 'kds.update', 'orders.read'])->pluck('id')->all(),
            'inventory_officer' => DB::table('permissions')->whereIn('module', ['inventory', 'procurement', 'purchasing', 'suppliers'])->pluck('id')->all(),
            'inventory_staff' => DB::table('permissions')->whereIn('module', ['inventory', 'procurement', 'purchasing', 'suppliers'])->pluck('id')->all(),
            'hr_manager' => DB::table('permissions')->whereIn('module', ['hr', 'users', 'branches', 'reports', 'analytics'])->pluck('id')->all(),
            'marketing_manager' => DB::table('permissions')->whereIn('module', ['menu', 'cms', 'media', 'promotions', 'reports', 'analytics', 'notifications'])->pluck('id')->all(),
            'crm_officer' => DB::table('permissions')->whereIn('module', ['crm', 'loyalty', 'members', 'promotions', 'reports', 'analytics', 'notifications'])->pluck('id')->all(),
            'customer' => DB::table('permissions')->whereIn('name', ['orders.create', 'orders.read', 'menu.read', 'reservations.read', 'promotions.read'])->pluck('id')->all(),
            'guest' => DB::table('permissions')->whereIn('name', ['menu.read', 'promotions.read', 'orders.create'])->pluck('id')->all(),
            'api_partner' => DB::table('permissions')->whereIn('module', ['orders', 'menu', 'branches'])->pluck('id')->all(),
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

        $this->command->info('13 system roles, comprehensive permissions, and role mappings ready.');
    }
}