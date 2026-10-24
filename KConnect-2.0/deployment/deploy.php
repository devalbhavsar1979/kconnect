<?php
declare(strict_types=1);
require __DIR__.'/ReleaseManager.php';

try {
    if (PHP_SAPI !== 'cli' || PHP_VERSION_ID < 80400 || PHP_VERSION_ID >= 80600) { throw new RuntimeException('PHP CLI 8.4 or 8.5 required'); }
    foreach (['ctype', 'curl', 'dom', 'fileinfo', 'filter', 'hash', 'mbstring', 'openssl', 'pcre', 'PDO', 'pdo_mysql', 'session', 'tokenizer', 'xml', 'Phar'] as $extension) {
        if (!extension_loaded($extension)) { throw new RuntimeException('Missing PHP extension: '.$extension); }
    }
    if (!function_exists('proc_open')) { throw new RuntimeException('proc_open must be available for CLI preparation'); }
    $config = json_decode(file_get_contents($argv[2] ?? ''), true, flags: JSON_THROW_ON_ERROR);
    if (($config['environment'] ?? '') !== 'staging' || !str_starts_with($config['base_url'] ?? '', 'https://')) { throw new RuntimeException('Explicit HTTPS staging configuration required'); }
    $root = realpath($config['private_root']);
    $public = realpath($config['public_root']);
    if (!$root || !$public || !is_file($root.'/shared/.env')) { throw new RuntimeException('Provision separate roots and private shared/.env first'); }
    $probe = function (string $id, string $bypass) use ($root, $config): void {
        require_once $root.'/releases/'.$id.'/backend/vendor/autoload.php';
        $env = Dotenv\Dotenv::parse(file_get_contents($root.'/shared/.env'));
        $token = $env['READINESS_TOKEN'] ?? '';
        if (strlen($token) < 32) { throw new RuntimeException('Readiness token must be at least 32 characters'); }
        foreach (['/health', '/internal/readiness'] as $path) {
            $curl = curl_init(rtrim($config['base_url'], '/').$path.'?release_probe='.rawurlencode($id));
            curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20,
                CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_SSL_VERIFYPEER => true, CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_HTTPHEADER => ['X-Readiness-Token: '.$token, 'X-Deploy-Probe: '.$bypass, 'Cache-Control: no-cache'],
            ]);
            $body = curl_exec($curl);
            $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            curl_close($curl);
            $data = is_string($body) ? json_decode($body, true) : null;
            if ($status !== 200 || ($data['status'] ?? '') !== ($path === '/health' ? 'healthy' : 'ready') || ($path !== '/health' && ($data['release'] ?? '') !== $id)) { throw new RuntimeException('HTTPS readiness/release probe failed'); }
        }
    };
    $manager = new ReleaseManager($root, $public, $probe);
    if (($argv[1] ?? '') === 'rollback') {
        $state = $manager->rollback();
    } elseif (($argv[1] ?? '') === 'deploy') {
        $state = $manager->deploy(realpath($argv[3] ?? '') ?: '', $argv[4] ?? '', function ($release, $shared): void {
            require_once $release.'/backend/vendor/autoload.php';
            $env = Dotenv\Dotenv::parse(file_get_contents($shared.'/.env'));
            if (($env['APP_ENV'] ?? '') !== 'staging' || ($env['APP_DEBUG'] ?? 'false') !== 'false' || empty($env['APP_KEY'])) { throw new RuntimeException('Require staging, debug=false and persistent APP_KEY'); }
            $manifest=json_decode(file_get_contents($release.'/manifest.json'),true,flags:JSON_THROW_ON_ERROR);
            $phase2=($manifest['schema_epoch']??'')==='phase2-baseline';
            if ($phase2 && (strlen($env['JWT_SECRET_KEY']??'')<32 || ($env['PHASE2_SYNTHETIC_DATABASE']??'')!=='true')) { throw new RuntimeException('Phase 2 requires a strong JWT_SECRET_KEY and PHASE2_SYNTHETIC_DATABASE=true'); }
            foreach (['logs', 'framework/cache/data', 'framework/sessions', 'framework/views'] as $dir) {
                if (!is_dir($shared.'/storage/'.$dir)) { mkdir($shared.'/storage/'.$dir, 0750, true); }
            }
            mkdir($release.'/backend/bootstrap/cache', 0750, true);
            putenv('KCONNECT_SHARED_PATH='.$shared);
            foreach (array_merge(['config:cache','route:cache'],$phase2?['kconnect:prepare-schema']:[]) as $command) {
                $process = proc_open([PHP_BINARY, 'artisan', $command, '--no-interaction'], [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $release.'/backend');
                if (!is_resource($process)) { throw new RuntimeException('Cannot execute release preparation'); }
                fclose($pipes[0]);
                stream_get_contents($pipes[1]); fclose($pipes[1]);
                stream_get_contents($pipes[2]); fclose($pipes[2]);
                if (proc_close($process) !== 0) { throw new RuntimeException('Release preparation failed: '.$command); }
            }
        });
    } else { throw new RuntimeException('Usage: deploy.php deploy|rollback config.json [archive checksum]'); }
    echo json_encode($state, JSON_THROW_ON_ERROR).PHP_EOL;
} catch (Throwable $error) {
    fwrite(STDERR, 'Deployment stopped: '.$error->getMessage().PHP_EOL);
    exit(1);
}
