<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->enum('status', ['Applied','Saved','APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN'])->default('Applied')->change();
        });
        DB::transaction(function () {
            DB::table('applications')->where('status','APPLIED')->update(['status'=>'Applied']);
            if (!Schema::hasTable('saved_opportunities')) return;
            foreach (DB::table('saved_opportunities')->orderBy('opportunity_id')->orderBy('user_id')->cursor() as $saved) {
                if (DB::table('applications')->where('opportunity_id',$saved->opportunity_id)->where('applicant_id',$saved->user_id)->exists()) continue;
                DB::table('applications')->insert(['id'=>(string)Str::uuid(),'opportunity_id'=>$saved->opportunity_id,'applicant_id'=>$saved->user_id,'status'=>'Saved','applied_at'=>$saved->updated_at,'updated_at'=>$saved->updated_at]);
            }
        });
    }

    public function down(): void
    {
        throw new \RuntimeException('Phase 2.3 contains saved application data; use a reviewed data migration to roll back.');
    }
};
