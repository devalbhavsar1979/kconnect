<?php
require __DIR__.'/../deployment/ReleaseManager.php';
$archive = realpath($argv[1] ?? '') ?: throw new RuntimeException('Archive required');
$base = dirname(__DIR__).'/artifacts/rehearsal-'.bin2hex(random_bytes(5));
mkdir($base.'/private/shared', 0755, true); mkdir($base.'/public');
touch($base.'/private/shared/test.sqlite');
file_put_contents($base.'/private/shared/.env', "APP_ENV=staging\nAPP_DEBUG=false\nAPP_KEY=base64:".base64_encode(random_bytes(32))."\nDB_CONNECTION=sqlite\nDB_DATABASE=".str_replace('\\','/',$base)."/private/shared/test.sqlite\nREADINESS_TOKEN=synthetic-readiness-token-32-characters\nJWT_SECRET_KEY=".bin2hex(random_bytes(32))."\nPHASE2_SYNTHETIC_DATABASE=true\n");
function runChecked(array $command, ?string $cwd = null): void {
    $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $cwd);
    if (!is_resource($process)) { throw new RuntimeException('Process failed'); }
    fclose($pipes[0]); $out = stream_get_contents($pipes[1]); fclose($pipes[1]); $err = stream_get_contents($pipes[2]); fclose($pipes[2]);
    if (proc_close($process) !== 0) { throw new RuntimeException($out.$err); }
}
$manager = new ReleaseManager($base.'/private', $base.'/public', function ($id) use ($base) {
    runChecked([PHP_BINARY, __DIR__.'/probe_local_release.php', $base.'/private/releases/'.$id, $base.'/private/shared', $id]);
});
$state = $manager->deploy($archive, trim(file_get_contents($archive.'.sha256')), function ($release, $shared) {
    foreach (['logs', 'framework/cache/data', 'framework/sessions', 'framework/views'] as $dir) { mkdir($shared.'/storage/'.$dir, 0750, true); }
    mkdir($release.'/backend/bootstrap/cache', 0750, true);
    putenv('KCONNECT_SHARED_PATH='.$shared);
    runChecked([PHP_BINARY, 'artisan', 'config:cache'], $release.'/backend');
    runChecked([PHP_BINARY, 'artisan', 'route:cache'], $release.'/backend');
    runChecked([PHP_BINARY, 'artisan', 'kconnect:prepare-schema'], $release.'/backend');
    runChecked([PHP_BINARY, 'artisan', 'kconnect:prepare-schema'], $release.'/backend');
});
echo json_encode(['state' => $state, 'scope' => 'Real production archive; SQLite baseline migration twice, auth and Laravel kernel probes; not hosted MariaDB/HTTPS', 'rehearsal' => $base], JSON_PRETTY_PRINT).PHP_EOL;
