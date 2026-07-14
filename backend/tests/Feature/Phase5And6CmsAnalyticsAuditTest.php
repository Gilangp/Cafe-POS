<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\MediaLibrary;
use App\Models\Page;
use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase5And6CmsAnalyticsAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::factory()->create([
            'name' => 'SCBD Flagship',
            'code' => 'BR-SCBD',
            'address' => 'Jl. Jend. Sudirman',
            'phone' => '021123456',
            'is_active' => true,
        ]);

        $this->admin = User::create([
            'branch_id' => $this->branch->id,
            'name' => 'Marketing & Audit Manager',
            'email' => 'marketing@velvra.com',
            'password' => bcrypt('password'),
            'role' => 'marketing_manager',
            'phone' => '081233344455',
            'is_active' => true,
        ]);
    }

    public function test_cms_page_and_block_builder_crud_with_audit_log()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/pages', [
            'title' => 'Tentang Velvra Coffee Experience',
            'slug' => 'about-velvra',
            'content' => 'Cerita biji kopi pilihan nusantara.',
            'status' => 'published',
            'blocks' => [
                [
                    'type' => 'hero',
                    'sort_order' => 1,
                    'content_json' => ['heading' => 'Welcome to Velvra', 'subheading' => 'Premium Coffee'],
                ],
                [
                    'type' => 'feature_grid',
                    'sort_order' => 2,
                    'content_json' => ['items' => ['Robusta Gayo', 'Arabica Mandheling']],
                ],
            ],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Tentang Velvra Coffee Experience')
            ->assertJsonPath('data.status', 'published')
            ->assertJsonCount(2, 'data.blocks');

        $pageId = $response->json('data.id');

        // Check immutable audit log recorded (AUD-001)
        $audit = AuditLog::where('auditable_type', Page::class)
            ->where('auditable_id', $pageId)
            ->where('action', 'CREATED')
            ->first();

        $this->assertNotNull($audit);
        $this->assertEquals($this->admin->id, $audit->user_id);

        // Test update and delete check
        $this->actingAs($this->admin, 'sanctum')->putJson("/api/v1/pages/{$pageId}", [
            'title' => 'Tentang Velvra Updated',
            'status' => 'published',
            'blocks' => [
                [
                    'type' => 'text',
                    'sort_order' => 1,
                    'content_json' => ['body' => 'Updated block content'],
                ],
            ],
        ])->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => Page::class,
            'auditable_id' => $pageId,
            'action' => 'UPDATED',
        ]);
    }

    public function test_media_library_upload_and_management()
    {
        $response = $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/media', [
            'disk' => 'public',
            'path' => '/uploads/2026/07/signature-latte.webp',
            'filename' => 'signature-latte.webp',
            'mime_type' => 'image/webp',
            'size_bytes' => 124000,
            'alt_text' => 'Signature Gold Latte Responsive Image',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.filename', 'signature-latte.webp');

        $mediaId = $response->json('data.id');

        $this->assertDatabaseHas('audit_logs', [
            'auditable_type' => MediaLibrary::class,
            'auditable_id' => $mediaId,
            'action' => 'CREATED',
        ]);
    }

    public function test_server_side_promotion_strict_validation_engine_pro_004()
    {
        // Create 20% discount promo min order Rp 50.000
        $promo = Promotion::create([
            'name' => 'Happy Hour 20%',
            'code' => 'HAPPY20',
            'type' => 'percent',
            'value' => 20,
            'min_order_cents' => 50000,
            'max_discount_cents' => 20000,
            'channel' => 'POS',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDays(10)->toDateString(),
            'usage_count' => 5,
            'max_usage' => 100,
            'is_active' => true,
        ]);

        // 1. Test validation failure when subtotal is below min_order
        $this->postJson('/api/v1/promotions/validate', [
            'code' => 'HAPPY20',
            'subtotal_cents' => 30000,
            'channel' => 'POS',
        ])->assertStatus(422)
          ->assertJsonPath('valid', false)
          ->assertJsonFragment(['message' => 'Minimum order belum terpenuhi (min. Rp 50.000).']);

        // 2. Test validation failure on channel mismatch (Online vs POS)
        $this->postJson('/api/v1/promotions/validate', [
            'code' => 'HAPPY20',
            'subtotal_cents' => 80000,
            'channel' => 'Online',
        ])->assertStatus(422)
          ->assertJsonPath('valid', false)
          ->assertJsonFragment(['message' => 'Promo tidak berlaku untuk saluran pemesanan ini.']);

        // 3. Test successful validation & cap at max_discount_cents
        // Subtotal Rp 150.000 * 20% = Rp 30.000, but capped at max_discount_cents Rp 20.000
        $response = $this->postJson('/api/v1/promotions/validate', [
            'code' => 'HAPPY20',
            'subtotal_cents' => 150000,
            'channel' => 'POS',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('valid', true)
            ->assertJsonPath('discount_cents', 20000);
    }

    public function test_immutable_audit_logs_retrieval_aud_001()
    {
        // Generate an audit entry via Promotion creation
        $this->actingAs($this->admin, 'sanctum')->postJson('/api/v1/promotions', [
            'name' => 'Promo Weekend Member',
            'code' => 'WEEKEND15',
            'type' => 'percent',
            'value' => 15,
            'min_order_cents' => 0,
            'channel' => 'All',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'is_active' => true,
        ])->assertStatus(201);

        // Fetch audit logs endpoint
        $response = $this->actingAs($this->admin, 'sanctum')->getJson('/api/v1/audit/logs');

        $response->assertStatus(200)
            ->assertJsonFragment(['action' => 'CREATED'])
            ->assertJsonFragment(['code' => 'WEEKEND15']);
    }
}
