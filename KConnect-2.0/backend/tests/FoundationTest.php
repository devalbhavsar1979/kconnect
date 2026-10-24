<?php
namespace Tests;

use Illuminate\Foundation\Testing\TestCase;

final class FoundationTest extends TestCase
{
    public function createApplication()
    {
        $app = require __DIR__.'/../bootstrap/app.php';
        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
        $app['config']->set('deployment.required_tables', []);
        return $app;
    }

    public function test_health_preserves_contract(): void
    {
        $this->get('/health')->assertOk()->assertExactJson(['status' => 'healthy'])->assertHeader('X-KConnect-Release');
    }
    public function test_unknown_api_is_json_for_browser_requests(): void
    {
        $this->get('/api/v1/not-implemented')->assertNotFound()->assertExactJson(['detail' => 'Not Found']);
        $this->post('/api/v1/not-implemented')->assertNotFound()->assertExactJson(['detail' => 'Not Found']);
    }
    public function test_readiness_requires_token_and_detects_missing_schema(): void
    {
        $this->get('/internal/readiness')->assertUnauthorized();
        config(['deployment.required_tables' => ['not_migrated']]);
        $this->withHeader('X-Readiness-Token', 'synthetic-test-token')->get('/internal/readiness')->assertStatus(503)->assertExactJson(['status' => 'not_ready']);
    }
    public function test_missing_assets_and_sensitive_paths_do_not_return_spa(): void
    {
        foreach (['/assets/missing.js', '/.env', '/uploads/private.pdf', '/internal/missing'] as $path) { $this->get($path)->assertNotFound(); }
    }
    public function test_deep_link_uses_built_frontend(): void
    {
        if (!is_file(resource_path('spa/index.html'))) { $this->markTestSkipped('Run frontend build/package before integration test'); }
        $this->get('/admin/opportunities/fixture/edit')->assertOk()->assertHeader('Content-Type', 'text/html; charset=utf-8');
        $this->withHeader('X-Readiness-Token', 'synthetic-test-token')->get('/internal/readiness')->assertOk()->assertJsonPath('status', 'ready');
    }
}
