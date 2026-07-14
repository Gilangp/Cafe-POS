<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'code', 'contact_person', 'email', 'phone', 'address', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function purchaseOrders() { return $this->hasMany(PurchaseOrder::class); }
}
