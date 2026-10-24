<?php
namespace App\Console\Commands;
use App\Services\DomainImporter;
use Illuminate\Console\Command;
final class ImportDomain extends Command
{
    protected $signature='kconnect:import-domain {file} {--paths= : Private JSON legacy-to-relative file path map}';
    protected $description='Insert or match all thirteen domain tables in dependency order, without overwriting';
    public function handle(DomainImporter $importer): int
    {
        if (!app()->environment('local','testing','staging')) { $this->error('Importer is restricted to local/testing/staging'); return 1; }
        try {
            $data=json_decode(file_get_contents($this->argument('file')),true,flags:JSON_THROW_ON_ERROR);
            $paths=$this->option('paths')?json_decode(file_get_contents($this->option('paths')),true,flags:JSON_THROW_ON_ERROR):[];
            $this->info(json_encode($importer->run($data,$paths),JSON_THROW_ON_ERROR)); return 0;
        } catch (\Throwable) { $this->error('Import failed; transaction rolled back. Check private input, file mappings and database constraints. Input values are not printed.'); return 1; }
    }
}
