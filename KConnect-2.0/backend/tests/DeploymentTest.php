<?php
namespace Tests;
use PHPUnit\Framework\TestCase;
require_once __DIR__.'/../../deployment/ReleaseManager.php';

final class DeploymentTest extends TestCase
{
    private string $root;
    private string $public;
    protected function setUp(): void
    {
        $base = dirname(__DIR__, 2).'/artifacts/deploy-tests/'.bin2hex(random_bytes(6));
        mkdir($base.'/private', 0755, true); mkdir($base.'/public');
        $this->root = $base.'/private'; $this->public = $base.'/public';
    }
    private function artifact(string $id, string $epoch='phase1-no-schema'): array
    {
        $files = [
            'backend/resources/spa/assets/app-'.$id.'.js' => 'console.log("'.$id.'")',
            'deployment/public.htaccess' => file_get_contents(__DIR__.'/../../deployment/public.htaccess'),
            'deployment/public-bootstrap.php.template' => file_get_contents(__DIR__.'/../../deployment/public-bootstrap.php.template'),
        ];
        $manifest = ['format' => 1, 'release' => $id, 'schema_epoch' => $epoch, 'migrations' => $epoch==='phase2-baseline'?['2026_10_19_000001_create_domain_schema']:[], 'bytes' => 10000, 'files' => array_map(fn ($data) => hash('sha256', $data), $files)];
        $archive = dirname($this->root).'/'.$id.'.tar';
        $tar = new \PharData($archive);
        foreach ($files as $path => $data) { $tar[$path] = $data; }
        $tar['manifest.json'] = json_encode($manifest);
        return [$archive, hash_file('sha256', $archive)];
    }
    public function test_deploy_twice_and_rollback_retains_old_assets(): void
    {
        $manager = new \ReleaseManager($this->root, $this->public, fn () => null);
        foreach (['first', 'second'] as $id) { [$file, $hash] = $this->artifact($id); $manager->deploy($file, $hash, fn () => null); }
        $this->assertSame('second', json_decode(file_get_contents($this->root.'/current.json'), true)['release']);
        $this->assertSame('first', $manager->rollback()['release']);
        $this->assertFileExists($this->public.'/assets/app-second.js');
        $this->assertFileDoesNotExist($this->root.'/maintenance.json');
    }
    public function test_bad_checksum_and_low_space_leave_current_untouched(): void
    {
        [$file, $hash] = $this->artifact('good');
        $manager = new \ReleaseManager($this->root, $this->public, fn () => null);
        $manager->deploy($file, $hash, fn () => null);
        $before = file_get_contents($this->root.'/current.json');
        foreach ([['hash' => str_repeat('0', 64), 'free' => PHP_INT_MAX], ['hash' => $hash, 'free' => 0]] as $failure) {
            try { (new \ReleaseManager($this->root, $this->public, fn () => null, fn () => $failure['free']))->deploy($file, $failure['hash'], fn () => null); $this->fail('Expected rejection'); }
            catch (\RuntimeException $error) { $this->assertMatchesRegularExpression('/checksum|disk/', $error->getMessage()); }
            $this->assertSame($before, file_get_contents($this->root.'/current.json'));
        }
    }
    public function test_failed_probe_restores_previous_release(): void
    {
        $manager = new \ReleaseManager($this->root, $this->public, function ($id) { if ($id === 'bad') { throw new \RuntimeException('Probe failed'); } });
        [$file, $hash] = $this->artifact('good'); $manager->deploy($file, $hash, fn () => null);
        [$file, $hash] = $this->artifact('bad');
        try { $manager->deploy($file, $hash, fn () => null); $this->fail('Expected failure'); } catch (\RuntimeException $error) { $this->assertSame('Probe failed', $error->getMessage()); }
        $this->assertSame('good', json_decode(file_get_contents($this->root.'/current.json'), true)['release']);
        $this->assertFileDoesNotExist($this->root.'/maintenance.json');
    }
    public function test_existing_site_is_never_overwritten(): void
    {
        file_put_contents($this->public.'/index.php', 'existing site');
        [$file, $hash] = $this->artifact('new');
        try { (new \ReleaseManager($this->root, $this->public, fn () => null))->deploy($file, $hash, fn () => null); $this->fail('Expected refusal'); }
        catch (\RuntimeException $error) { $this->assertStringContainsString('not empty', $error->getMessage()); }
        $this->assertSame('existing site', file_get_contents($this->public.'/index.php'));
    }
    public function test_interrupted_transfer_is_rejected_before_activation(): void
    {
        [$file, $hash] = $this->artifact('partial');
        file_put_contents($file, substr(file_get_contents($file), 0, 100));
        $this->expectExceptionMessage('Archive checksum mismatch');
        (new \ReleaseManager($this->root, $this->public, fn () => null))->deploy($file, $hash, fn () => null);
    }
    public function test_additive_schema_upgrade_and_code_rollback(): void
    {
        $manager=new \ReleaseManager($this->root,$this->public,fn()=>null);
        [$file,$hash]=$this->artifact('phase1'); $manager->deploy($file,$hash,fn()=>null);
        [$file,$hash]=$this->artifact('phase2','phase2-baseline');
        $manager->deploy($file,$hash,function(){ file_put_contents($this->root.'/schema-installed','preserve'); });
        $this->assertSame('phase1',$manager->rollback()['release']);
        $this->assertFileExists($this->root.'/schema-installed');
        $this->assertSame('phase2',$manager->rollback()['release']);
    }
    public function test_prepare_failure_leaves_active_pointer_untouched(): void
    {
        $manager=new \ReleaseManager($this->root,$this->public,fn()=>null);
        [$file,$hash]=$this->artifact('original'); $manager->deploy($file,$hash,fn()=>null);
        [$file,$hash]=$this->artifact('schema-fails','phase2-baseline');
        try { $manager->deploy($file,$hash,fn()=>throw new \RuntimeException('Migration refused')); $this->fail('Expected failure'); }
        catch (\RuntimeException $e) { $this->assertSame('Migration refused',$e->getMessage()); }
        $this->assertSame('original',json_decode(file_get_contents($this->root.'/current.json'),true)['release']);
    }
}
