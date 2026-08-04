<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'category_id' => Category::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(15, 60) * 1000,
            'image' => 'menus/placeholder.webp',
            'status' => 'tersedia',
            'is_best_seller' => false,
        ];
    }

    public function unavailable(): static
    {
        return $this->state(fn () => ['status' => 'tidak_tersedia']);
    }

    public function bestSeller(): static
    {
        return $this->state(fn () => ['is_best_seller' => true]);
    }
}
