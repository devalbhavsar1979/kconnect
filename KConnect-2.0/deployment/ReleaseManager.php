<?php
declare(strict_types=1);

/** Filesystem release transaction. No schema migrations or cleanup in Phase 1. */
final class ReleaseManager
{
    private string $root;
    private string $public;
    private $probe;
    private $freeSpace;
    public function __construct(string $root, string $public, callable $probe, ?callable $freeSpace = null)
    {
        $this->root = realpath($root) ?: throw new RuntimeException('Private root must exist');
        $this->public = realpath($public) ?: throw new RuntimeException('Public root must exist');
        if ($this->root === $this->public || str_starts_with($this->root, $this->public.DIRECTORY_SEPARATOR) || str_starts_with($this->public, $this->root.DIRECTORY_SEPARATOR)) { throw new RuntimeException('Roots must be separate'); }
        $this->probe = $probe;
        $this->freeSpace = $freeSpace ?? fn () => disk_free_space($this->root);
    }
    private function writeJson(string $path, array $value): void
    {
        $temp = $path.'.tmp-'.bin2hex(random_bytes(6));
        $data = json_encode($value, JSON_THROW_ON_ERROR);
        if (file_put_contents($temp, $data, LOCK_EX) !== strlen($data) || !rename($temp, $path)) { throw new RuntimeException('Atomic state write failed'); }
    }
    private function state(): array
    {
        return is_file($this->root.'/current.json') ? json_decode(file_get_contents($this->root.'/current.json'), true, flags: JSON_THROW_ON_ERROR) : [];
    }
    private function lock()
    {
        $lock = fopen($this->root.'/deploy.lock', 'c');
        if (!$lock || !flock($lock, LOCK_EX | LOCK_NB)) { throw new RuntimeException('Deployment already running'); }
        if (is_file($this->root.'/maintenance.json')) { throw new RuntimeException('Unresolved deployment maintenance; operator recovery required'); }
        return $lock;
    }
    private function validId(string $id): void
    {
        if (!preg_match('/\A[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}\z/', $id)) { throw new RuntimeException('Invalid release ID'); }
    }
    public function deploy(string $archive, string $expectedHash, callable $prepare): array
    {
        $lock = $this->lock();
        try {
            if (!preg_match('/\A[a-f0-9]{64}\z/', $expectedHash) || !is_file($archive) || !hash_equals($expectedHash, hash_file('sha256', $archive))) { throw new RuntimeException('Archive checksum mismatch'); }
            $tar = new PharData($archive);
            $manifest = json_decode($tar['manifest.json']->getContent(), true, flags: JSON_THROW_ON_ERROR);
            $id = $manifest['release'] ?? '';
            $this->validId($id);
            $epoch=$manifest['schema_epoch']??'';
            $expectedMigrations=match ($epoch) { 'phase1-no-schema'=>[], 'phase2-baseline'=>['2026_10_19_000001_create_domain_schema'], default=>null };
            if (($manifest['format'] ?? null) !== 1 || $expectedMigrations===null || ($manifest['migrations']??null)!==$expectedMigrations) { throw new RuntimeException('Unsupported schema or artifact'); }
            $free = ($this->freeSpace)();
            if ($free === false || $free < ($manifest['bytes'] ?? PHP_INT_MAX) * 3 + 20 * 1024 * 1024) { throw new RuntimeException('Insufficient disk headroom'); }
            $seen = [];
            foreach (new RecursiveIteratorIterator($tar) as $entry) {
                $name = substr($entry->getPathname(), strlen('phar://'.str_replace('\\', '/', $archive).'/'));
                // Phar paths use normalized separators; reject traversal and archive links.
                if ($entry->isLink() || str_contains($name, '..') || str_contains($name, '\\') || str_starts_with($name, '/') || str_contains($name, ':')) { throw new RuntimeException('Unsafe archive path'); }
                if ($entry->isDir()) { continue; }
                if ($name !== 'manifest.json') {
                    if (!isset($manifest['files'][$name]) || !hash_equals($manifest['files'][$name], hash('sha256', $entry->getContent()))) { throw new RuntimeException('Manifest file mismatch'); }
                    $seen[$name] = true;
                }
            }
            if (count($seen) !== count($manifest['files'])) { throw new RuntimeException('Missing artifact files'); }
            $release = $this->root.'/releases/'.$id;
            if (file_exists($release)) { throw new RuntimeException('Release ID already exists'); }
            if (!is_dir($this->root.'/releases')) { mkdir($this->root.'/releases', 0750); }
            mkdir($release, 0750);
            $tar->extractTo($release, null, false);
            // Stable public bootstrap must match exactly; never replace an existing site.
            $bootstrap = str_replace('__PRIVATE_ROOT__', var_export($this->root, true), file_get_contents($release.'/deployment/public-bootstrap.php.template'));
            $publicFiles = ['index.php' => $bootstrap, '.htaccess' => file_get_contents($release.'/deployment/public.htaccess')];
            if (!is_file($this->public.'/.kconnect-owned')) {
                $existing = array_diff(scandir($this->public), ['.', '..', '.well-known']);
                if ($existing) { throw new RuntimeException('Public root is not empty; refusing to replace site'); }
            }
            foreach ($publicFiles as $name => $content) {
                if (is_file($this->public.'/'.$name) && file_get_contents($this->public.'/'.$name) !== $content) { throw new RuntimeException('Public bootstrap change requires explicit maintenance deployment'); }
            }
            $prepare($release, $this->root.'/shared');
            // Add immutable assets before activation; never remove assets needed by old tabs.
            $assets = $release.'/backend/resources/spa/assets';
            if (is_dir($assets)) {
                foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($assets, FilesystemIterator::SKIP_DOTS)) as $entry) {
                    if (!$entry->isFile()) { continue; }
                    $rel = substr($entry->getPathname(), strlen($assets) + 1);
                    if (!preg_match('/\.(?:js|css|png|svg|jpg|jpeg|gif|webp|ico|woff|woff2|ttf)$/i', $rel)) { throw new RuntimeException('Unsupported public asset'); }
                    $target = $this->public.'/assets/'.$rel;
                    if (is_file($target) && hash_file('sha256', $target) !== hash_file('sha256', $entry->getPathname())) { throw new RuntimeException('Immutable asset collision'); }
                    if (!is_dir(dirname($target))) { mkdir(dirname($target), 0755, true); }
                    if (!is_file($target) && !copy($entry->getPathname(), $target)) { throw new RuntimeException('Asset copy failed'); }
                }
            }
            foreach (glob($release.'/backend/resources/spa/workbox-*.js') as $worker) {
                if (!preg_match('/\Aworkbox-[a-f0-9]+\.js\z/', basename($worker))) { throw new RuntimeException('Invalid worker asset'); }
                $target = $this->public.'/'.basename($worker);
                if (is_file($target) && hash_file('sha256', $target) !== hash_file('sha256', $worker)) { throw new RuntimeException('Worker asset collision'); }
                if (!is_file($target) && !copy($worker, $target)) { throw new RuntimeException('Worker asset copy failed'); }
            }
            foreach ($publicFiles as $name => $content) {
                if (!is_file($this->public.'/'.$name) && file_put_contents($this->public.'/'.$name, $content) !== strlen($content)) { throw new RuntimeException('Public bootstrap write failed'); }
            }
            if (file_put_contents($this->public.'/.kconnect-owned', 'phase1') !== 6) { throw new RuntimeException('Public ownership marker write failed'); }
            return $this->activate($id, $manifest['schema_epoch']);
        } finally { flock($lock, LOCK_UN); fclose($lock); }
    }
    private function activate(string $id, string $epoch): array
    {
        $previous = $this->state();
        // Phase 2 only adds tables. Phase 1 never accesses them; both epochs can
        // share the database. Rollback changes code only and never drops tables.
        if ($previous && ($previous['schema_epoch'] ?? '') !== $epoch &&
            !(in_array($previous['schema_epoch']??'', ['phase1-no-schema','phase2-baseline'],true) && in_array($epoch,['phase1-no-schema','phase2-baseline'],true))) { throw new RuntimeException('Rollback schema compatibility not established'); }
        $probe = bin2hex(random_bytes(32));
        $this->writeJson($this->root.'/maintenance.json', ['probe_hash' => hash('sha256', $probe)]);
        $state = ['release' => $id, 'previous' => $previous['release'] ?? null, 'schema_epoch' => $epoch];
        try {
            $this->writeJson($this->root.'/current.json', $state);
            ($this->probe)($id, $probe);
        } catch (Throwable $error) {
            // Restore code pointer. Schema changes are intentionally prohibited in Phase 1.
            if ($previous) {
                $this->writeJson($this->root.'/current.json', $previous);
                try { ($this->probe)($previous['release'], $probe); }
                catch (Throwable) { throw new RuntimeException('Rollback probe failed; maintenance retained', previous: $error); }
                unlink($this->root.'/maintenance.json');
            }
            throw $error; // First-release failure remains in maintenance for operator recovery.
        }
        unlink($this->root.'/maintenance.json');
        file_put_contents($this->root.'/deployments.jsonl', json_encode(['release' => $id, 'previous' => $state['previous'], 'time' => gmdate(DATE_ATOM)])."\n", FILE_APPEND | LOCK_EX);
        return $state;
    }
    public function rollback(): array
    {
        $lock = $this->lock();
        try {
            $state = $this->state();
            $id = $state['previous'] ?? '';
            $this->validId($id);
            $file = $this->root.'/releases/'.$id.'/manifest.json';
            if (!is_file($file)) { throw new RuntimeException('Prior release unavailable'); }
            $manifest = json_decode(file_get_contents($file), true, flags: JSON_THROW_ON_ERROR);
            return $this->activate($id, $manifest['schema_epoch']);
        } finally { flock($lock, LOCK_UN); fclose($lock); }
    }
}
