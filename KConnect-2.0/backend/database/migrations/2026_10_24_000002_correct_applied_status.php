<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->enum('status', ['Applied','Saved','Applid','APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN'])->default('Applied')->change();
        });
        DB::table('applications')->whereIn('status',['Applid','APPLIED'])->update(['status'=>'Applied']);
        Schema::table('applications', function (Blueprint $table) {
            $table->enum('status', ['Applied','Saved','APPLIED','UNDER_REVIEW','SHORTLISTED','REJECTED','SELECTED','WITHDRAWN'])->default('Applied')->change();
        });
    }
    public function down(): void
    {
        // Keep the corrected spelling and preserve existing responses.
    }
};
