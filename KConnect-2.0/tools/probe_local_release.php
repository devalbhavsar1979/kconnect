<?php
// Subprocess probe avoids retaining classes/config from a prior release in memory.
$release = $argv[1]; $shared = $argv[2]; $expected = $argv[3];
putenv('KCONNECT_SHARED_PATH='.$shared);
require $release.'/backend/vendor/autoload.php';
$app = require $release.'/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$health = $kernel->handle(Illuminate\Http\Request::create('/health'));
if ($health->getStatusCode() !== 200 || $health->headers->get('X-KConnect-Release') !== $expected) { throw new RuntimeException('Health/release failure'); }
$request = Illuminate\Http\Request::create('/internal/readiness');
$request->headers->set('X-Readiness-Token', 'synthetic-readiness-token-32-characters');
$response = $kernel->handle($request);
if ($response->getStatusCode() !== 200 || json_decode($response->getContent(), true)['release'] !== $expected) { throw new RuntimeException('Readiness failure'); }
$page = $kernel->handle(Illuminate\Http\Request::create('/admin/opportunities/fixture/edit'));
if ($page->getStatusCode() !== 200) { throw new RuntimeException('SPA deep link failure'); }
$api = $kernel->handle(Illuminate\Http\Request::create('/api/v1/not-implemented'));
if ($api->getStatusCode() !== 404 || json_decode($api->getContent(), true) !== ['detail' => 'Not Found']) { throw new RuntimeException('API routing failure'); }
echo "Production artifact application probes passed\n";
$registration=Illuminate\Http\Request::create('/api/v1/auth/register','POST',['first_name'=>'Release','last_name'=>'Probe','email'=>'release@example.test','password'=>'SyntheticRelease123!','confirm_password'=>'SyntheticRelease123!','user_type'=>'SME']);
$result=$kernel->handle($registration);
if ($result->getStatusCode()!==201) { throw new RuntimeException('Packaged registration failed: '.$result->getContent()); }
$tokens=json_decode($result->getContent(),true);
$me=Illuminate\Http\Request::create('/api/v1/auth/me');
$me->headers->set('Authorization','Bearer '.$tokens['access_token']);
if ($kernel->handle($me)->getStatusCode()!==200) { throw new RuntimeException('Packaged authentication failed'); }
echo "Production artifact authentication probes passed\n";
