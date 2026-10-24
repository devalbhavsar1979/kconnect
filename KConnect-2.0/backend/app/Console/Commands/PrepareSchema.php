<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
final class PrepareSchema extends Command
{
    protected $signature='kconnect:prepare-schema';
    protected $description='Install baseline into explicitly designated synthetic staging DB; never reset an existing schema';
    public function handle(): int
    {
        if (!app()->environment('staging','testing') || !config('deployment.synthetic_database')) { $this->error('Explicit synthetic staging database required'); return 1; }
        $migration='2026_10_19_000001_create_domain_schema';
        $installed=Schema::hasTable('migrations') && DB::table('migrations')->where('migration',$migration)->exists();
        if (!$installed) {
            $tables=array_filter(Schema::getTableListing(),fn($name)=>!in_array($name,['migrations','sqlite_sequence'],true));
            if ($tables) { $this->error('Database is not empty or baseline migration is incomplete. Use a new empty synthetic DB; no tables were reset.'); return 1; }
        }
        return $this->call('migrate',['--force'=>true,'--no-interaction'=>true]);
    }
}
