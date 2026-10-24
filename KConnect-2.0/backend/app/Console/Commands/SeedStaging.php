<?php
namespace App\Console\Commands;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
final class SeedStaging extends Command
{
    protected $signature='kconnect:seed-staging';
    protected $description='Create deterministic synthetic users and references; prompt for a private test password';
    public function handle(): int
    {
        if (!app()->environment('staging','testing','local')) { $this->error('Synthetic fixtures require staging/local/testing'); return 1; }
        $password=$this->secret('Password for NEW synthetic accounts (at least 12 characters)');
        if (!is_string($password) || mb_strlen($password)<12) { $this->error('Password must have at least 12 characters'); return 1; }
        DB::transaction(function () use ($password) {
            foreach (['SME','PROFESSIONAL_SERVICE_PROVIDER','ADMIN','SUPER_ADMIN','FREELANCER'] as $i=>$role) {
                $id=sprintf('20000000-0000-4000-8000-%012d',$i+1);
                if (User::whereKey($id)->exists()) { continue; }
                $user=new User();
                $user->forceFill(['id'=>$id,'first_name'=>'Synthetic','last_name'=>$role,'email'=>strtolower($role).'@example.test','user_type'=>$role,'password_hash'=>password_hash(substr($password,0,72),PASSWORD_BCRYPT,['cost'=>12]),'is_active'=>true,'is_verified'=>false]);
                $user->save();
            }
            DB::table('categories')->insertOrIgnore(['id'=>'30000000-0000-4000-8000-000000000001','name'=>'Synthetic training','description'=>'Staging fixture','is_active'=>true,'created_at'=>'2026-01-01 00:00:00','updated_at'=>'2026-01-01 00:00:00']);
            DB::table('organizations')->insertOrIgnore(['id'=>'40000000-0000-4000-8000-000000000001','organization_name'=>'Synthetic organization','created_by'=>'20000000-0000-4000-8000-000000000004','created_at'=>'2026-01-01 00:00:00','updated_at'=>'2026-01-01 00:00:00']);
        });
        $this->info('Synthetic fixtures ready. Existing accounts/passwords were preserved. Emails: sme@example.test, professional_service_provider@example.test, admin@example.test, super_admin@example.test, freelancer@example.test');
        return 0;
    }
}
