<?php

namespace Database\Factories;

use App\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BranchFactory extends Factory
{
    protected $model = Branch::class;

    public function definition(): array
    {
        $name = fake()->company() . ' Branch';
        return [
            'name' => $name,
            'code' => strtoupper(Str::random(6)),
            'address' => fake()->address(),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'postal_code' => fake()->postcode(),
            'phone' => fake()->phoneNumber(),
            'email' => fake()->companyEmail(),
            'timezone' => 'Asia/Jakarta',
            'currency' => 'IDR',
            'is_active' => true,
            'opening_hours' => [
                'mon' => '08:00-22:00',
                'tue' => '08:00-22:00',
                'wed' => '08:00-22:00',
                'thu' => '08:00-22:00',
                'fri' => '08:00-23:00',
                'sat' => '09:00-23:00',
                'sun' => '09:00-21:00',
            ],
        ];
    }
}
