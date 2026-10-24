<?php
namespace App\Console\Commands;
use App\Services\ReferenceImporter;
use Illuminate\Console\Command;
final class ImportReferences extends Command
{
    protected $signature='kconnect:import-references {file}';
    protected $description='Transactionally import users/categories/organizations from private JSON; insert or match only';
    public function handle(ReferenceImporter $importer): int
    {
        if (!app()->environment('staging','testing','local')) { $this->error('Phase 2 importer is restricted to staging/local/testing'); return 1; }
        try {
            $data=json_decode(file_get_contents($this->argument('file')),true,flags:JSON_THROW_ON_ERROR);
            if (!is_array($data)) { throw new \InvalidArgumentException('Expected JSON object'); }
            $this->info(json_encode($importer->run($data),JSON_THROW_ON_ERROR));
            return 0;
        } catch (\Throwable) { $this->error('Import failed; transaction rolled back. Check the private input, constraints and connectivity. No input values are printed.'); return 1; }
    }
}
