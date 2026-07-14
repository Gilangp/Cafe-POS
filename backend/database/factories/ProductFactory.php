<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        return [
            'category_id' => Category::factory(),
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'base_price' => fake()->numberBetween(15000, 65000),
            'sku' => 'VLV-' . strtoupper(Str::random(8)),
            'is_active' => true,
            'is_featured' => fake()->boolean(30),
            'preparation_time' => fake()->numberBetween(2, 15),
            'tags' => fake()->randomElements(['coffee', 'hot', 'cold', 'milk', 'matcha', 'food'], 2),
        ];
    }

    public function featured(): static
    {
        return $this->state(fn () => [
            'is_featured' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'is_active' => false,
        ]);
    }
}
