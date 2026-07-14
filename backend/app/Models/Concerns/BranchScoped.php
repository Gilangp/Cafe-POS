<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait BranchScoped
{
    /**
     * Boot the BranchScoped trait for a model.
     */
    protected static function bootBranchScoped(): void
    {
        static::addGlobalScope('branch_scope', function (Builder $builder) {
            // Do not apply scope in console unless specifically flagged during tests
            if (app()->runningInConsole() && !app()->bound('test_running_branch_scope')) {
                return;
            }

            if (!auth()->check()) {
                return;
            }

            $user = auth()->user();
            $table = $builder->getModel()->getTable();

            // Check global / organizational roles that can access all branches or specific switched branch
            if ($user->hasRole('super_admin') || $user->hasRole('corporate_admin') || $user->hasRole('regional_analyst') || $user->hasRole('marketing_manager') || $user->hasRole('crm_officer') || $user->hasRole('hr_manager')) {
                if (request()->attributes->has('scoped_branch_id')) {
                    $builder->where($table . '.branch_id', request()->attributes->get('scoped_branch_id'));
                }
                return;
            }

            // For branch-bound roles, filter by their allowed scoped branch IDs
            $scopedIds = $user->getScopedBranchIds();

            if (request()->attributes->has('scoped_branch_id')) {
                $reqBranch = (int) request()->attributes->get('scoped_branch_id');
                if (in_array($reqBranch, $scopedIds)) {
                    $builder->where($table . '.branch_id', $reqBranch);
                    return;
                }
            }

            if (!empty($scopedIds)) {
                $builder->whereIn($table . '.branch_id', $scopedIds);
            } else {
                // If user has no branch assigned, restrict completely
                $builder->whereRaw('1 = 0');
            }
        });

        static::creating(function (Model $model) {
            if (!isset($model->branch_id) || null === $model->branch_id) {
                if (request()->attributes->has('scoped_branch_id')) {
                    $model->branch_id = request()->attributes->get('scoped_branch_id');
                } elseif (auth()->check() && auth()->user()->branch_id) {
                    $model->branch_id = auth()->user()->branch_id;
                }
            }
        });
    }

    /**
     * Scope a query to disable branch scoping explicitly when needed by system jobs or super admins.
     */
    public function scopeWithoutBranchScope(Builder $builder): Builder
    {
        return $builder->withoutGlobalScope('branch_scope');
    }
}
