<?php

namespace Database\Factories;

use App\Models\Reservation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        return [
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->numerify('08##########'),
            'reservation_date' => fake()->dateTimeBetween('+1 day', '+30 days')->format('Y-m-d'),
            'reservation_time' => fake()->time('H:i'),
            'party_size' => fake()->numberBetween(2, 8),
            'purpose' => fake()->randomElement(['Nongkrong', 'Meeting', 'Ulang Tahun', null]),
            'notes' => fake()->optional()->sentence(),
            'status' => 'menunggu_konfirmasi',
        ];
    }

    public function confirmed(): static
    {
        return $this->state(fn () => ['status' => 'dikonfirmasi']);
    }

    public function rejected(): static
    {
        return $this->state(fn () => ['status' => 'ditolak']);
    }
}
