<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_healthy(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'healthy',
                'version' => '1.0.0',
            ])
            ->assertJsonStructure([
                'status',
                'timestamp',
                'version',
            ]);
    }
}
