<?php
namespace Tests;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Route;
final class RouteCoverageTest extends TestCase
{
    public function createApplication() { $app=require __DIR__.'/../bootstrap/app.php'; $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap(); return $app; }
    public function test_every_frozen_legacy_operation_has_a_concrete_route_and_auth_boundary(): void
    {
        $normalize=fn($path)=>preg_replace('/\{[^}]+\}/','{}',trim($path,'/'));
        $routes=[];
        foreach (Route::getRoutes() as $route) foreach ($route->methods() as $method) $routes[$method.' '.$normalize($route->uri())]=$route;
        $spec=json_decode(file_get_contents(__DIR__.'/../../docs/phase-0/generated/runtime-openapi.json'),true,flags:JSON_THROW_ON_ERROR); $count=0;
        foreach ($spec['paths'] as $path=>$operations) foreach ($operations as $method=>$operation) {
            if (!in_array($method,['get','post','put','patch','delete'],true)) continue;
            $key=strtoupper($method).' '.$normalize($path); $this->assertArrayHasKey($key,$routes); $count++;
            if (str_contains($path,'/api/v1/') && !in_array($path,['/api/v1/auth/register','/api/v1/auth/login','/api/v1/auth/refresh','/api/v1/auth/logout'],true)) {
                $this->assertContains('bearer',$routes[$key]->gatherMiddleware(),$key);
                if (str_contains($path,'/admin/')) $this->assertContains('role:SUPER_ADMIN',$routes[$key]->gatherMiddleware(),$key);
                $url=preg_replace('/\{[^}]+\}/','00000000-0000-4000-8000-000000000001',$path);
                $this->json(strtoupper($method),$url)->assertForbidden();
            }
        }
        $this->assertSame(59,$count);
    }
}
