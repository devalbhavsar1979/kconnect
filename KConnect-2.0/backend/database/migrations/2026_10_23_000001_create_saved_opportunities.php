<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('saved_opportunities',function(Blueprint $t) {
 $t->uuid('opportunity_id'); $t->uuid('user_id'); $t->string('status',32)->default('SAVED_FOR_LATER'); $t->timestamp('updated_at')->useCurrent();
 $t->primary(['opportunity_id','user_id']);
 $t->foreign('opportunity_id')->references('id')->on('opportunities')->cascadeOnDelete();
 $t->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
 }); }
 public function down(): void { Schema::dropIfExists('saved_opportunities'); }
};
