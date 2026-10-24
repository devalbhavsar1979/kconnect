<?php
namespace Tests;
use App\Models\User;
use App\Models\DomainRecord as D;
use App\Services\Tokens;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
final class DomainTest extends TestCase
{
    private User $admin;
    private User $member;
    public function createApplication() { $app=require __DIR__.'/../bootstrap/app.php'; $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap(); return $app; }
    protected function setUp(): void
    {
        parent::setUp(); config(['tokens.secret'=>str_repeat('synthetic-domain-',3)]);
        if (config('database.default')==='mysql' && config('database.connections.mysql.database')!=='kconnect_phase2_test') throw new \RuntimeException('Unsafe test database');
        Artisan::call('migrate:fresh',['--force'=>true]);
        foreach (['admin'=>'SUPER_ADMIN','member'=>'SME'] as $field=>$role) { $u=new User(); $u->forceFill(['first_name'=>'Synthetic','last_name'=>$field,'email'=>$field.'@example.test','user_type'=>$role,'password_hash'=>password_hash('SyntheticPass123',PASSWORD_BCRYPT)])->save(); $this->$field=$u->refresh(); }
        $this->auth($this->admin);
    }
    protected function tearDown(): void { DB::disconnect(); parent::tearDown(); }
    private function auth(User $u): void { $this->withToken(app(Tokens::class)->create($u,'access')); }
    private function org(): array { return $this->postJson('/api/v1/admin/organisations',['organization_name'=>' Synthetic Institute ','industry'=>'Education','organization_type'=>'INSTITUTE','state'=>'Gujarat','city'=>'Ahmedabad'])->assertCreated()->assertJsonPath('organization_name','Synthetic Institute')->json(); }
    private function payload(array $extra=[]): array { return array_replace(['title'=>'PHP Training','opportunity_type'=>'LECTURE','category'=>'Technical','session_structure'=>'SINGLE_SESSION','total_duration'=>'2 hours','duration_per_session'=>'2 hours','short_description'=>'Learn PHP','detailed_description'=>'Synthetic content','event_date'=>now()->addDay()->toDateString(),'language_of_delivery'=>'English','tags'=>['Laravel','PHP'],'skills_required'=>['SQL'],'delivery_modes'=>['ONLINE']],$extra); }
    private function opp(array $extra=[]): array { return $this->postJson('/api/v1/admin/opportunities',$this->payload($extra))->assertCreated()->assertJsonPath('status','DRAFT')->json(); }
    public function test_member_can_save_then_apply_without_duplicate_or_downgrade(): void
    {
        $o=$this->opp(); DB::table('opportunities')->where('id',$o['id'])->update(['status'=>'OPEN']); $url='/api/v1/opportunities/'.$o['id'];
        $this->auth($this->member);
        $this->postJson($url.'/response',['status'=>'Saved'])->assertOk()->assertJsonPath('status','Saved');
        $this->postJson($url.'/response',['status'=>'Saved'])->assertOk();
        $this->assertSame(0,DB::table('saved_opportunities')->count());
        $this->assertSame(1,DB::table('applications')->where('status','Saved')->count());
        $savedId=DB::table('applications')->value('id');
        $this->getJson('/api/v1/opportunities?tab=applied')->assertJsonPath('total',0);
        $this->getJson($url)->assertOk()->assertJsonPath('response_status','Saved')->assertJsonPath('detailed_description','Synthetic content');
        $this->getJson('/api/v1/opportunities?tab=saved')->assertJsonPath('total',1);
        $this->postJson($url.'/response',['status'=>'Applied'])->assertOk()->assertJsonPath('status','Applied');
        $this->postJson($url.'/response',['status'=>'Applied'])->assertOk();
        $this->postJson($url.'/response',['status'=>'Saved'])->assertJsonPath('status','Applied');
        $this->assertSame(1,DB::table('applications')->count());
        $this->assertSame($savedId,DB::table('applications')->value('id'));
        $this->assertSame('Applied',DB::table('applications')->value('status'));
        $this->getJson('/api/v1/opportunities?tab=saved')->assertJsonPath('total',0);
        $this->getJson('/api/v1/opportunities?tab=applied')->assertJsonPath('total',1);
        $this->assertSame(0,DB::table('saved_opportunities')->count());
        $this->auth($this->admin); $this->getJson($url)->assertJsonPath('response_status',null);
        $expired=$this->opp(['status'=>'OPEN','application_deadline'=>now()->subDay()->toDateString()]);
        DB::table('opportunities')->where('id',$expired['id'])->update(['status'=>'OPEN']);
        $this->auth($this->member); $this->postJson('/api/v1/opportunities/'.$expired['id'].'/response',['status'=>'Applied'])->assertStatus(422);
    }
    public function test_phase23_migrates_saved_records_without_overwriting_applications(): void
    {
        $one=$this->opp(); $two=$this->opp();
        foreach ([$one,$two] as $o) DB::table('saved_opportunities')->insert(['opportunity_id'=>$o['id'],'user_id'=>$this->member->id]);
        DB::table('applications')->insert(['id'=>(string)\Illuminate\Support\Str::uuid(),'opportunity_id'=>$two['id'],'applicant_id'=>$this->member->id,'status'=>'APPLIED']);
        $migration=require database_path('migrations/2026_10_24_000001_unify_opportunity_responses.php');
        $migration->up(); $migration->up();
        $this->assertSame(2,DB::table('applications')->count());
        $this->assertSame('Saved',DB::table('applications')->where('opportunity_id',$one['id'])->value('status'));
        $this->assertSame('Applied',DB::table('applications')->where('opportunity_id',$two['id'])->value('status'));
        $this->getJson('/api/v1/admin/dashboard')->assertJsonPath('total_applications',1);
    }
    public function test_admin_applications_group_applicants_and_derive_profile_details(): void
    {
        $this->travelTo(\Illuminate\Support\Carbon::parse('2026-10-24 12:00:00','Asia/Kolkata'));
        $a=$this->opp(); $b=$this->opp(); $saved=$this->opp();
        $second=new User(); $second->forceFill(['first_name'=>'Second','last_name'=>'Applicant','email'=>'second@example.test','user_type'=>'TRAINER','password_hash'=>'unused'])->save();
        $uuid=fn()=>(string)\Illuminate\Support\Str::uuid();
        foreach ([[$a,$this->member,'Applied'],[$a,$second,'Applied'],[$b,$second,'Applied'],[$saved,$this->member,'Saved'],[$a,$this->admin,'Saved']] as [$o,$u,$status]) DB::table('applications')->insert(['id'=>$uuid(),'opportunity_id'=>$o['id'],'applicant_id'=>$u->id,'status'=>$status]);
        foreach ([['BSc',2020],['MSc',2024],['Undated',null]] as [$degree,$year]) DB::table('academic_details')->insert(['id'=>$uuid(),'user_id'=>$this->member->id,'school'=>'Test School','degree'=>$degree,'end_year'=>$year]);
        foreach ([[2020,4,[' PHP ','SQL']],[2022,8,['php','React']],[2028,1,['Future']]] as [$year,$month,$skills]) DB::table('experience_entries')->insert(['id'=>$uuid(),'user_id'=>$this->member->id,'job_title'=>'Trainer','organization'=>'Test','start_year'=>$year,'start_month'=>$month,'skills'=>json_encode($skills)]);
        $response=$this->getJson('/api/v1/admin/applications')->assertOk()->assertJsonPath('total',2)->json();
        $card=collect($response['items'])->firstWhere('id',$a['id']);
        $this->assertCount(2,$card['applicants']);
        $member=collect($card['applicants'])->firstWhere('id',$this->member->id);
        $this->assertSame('Synthetic member',$member['name']);
        $this->assertSame('SME',$member['role']);
        $this->assertSame('MSc',$member['latest_degree']);
        $this->assertSame(2024,$member['completion_year']);
        $this->assertSame(78,$member['experience_months']);
        $this->assertSame(['PHP','SQL','React','Future'],$member['skills']);
        $empty=collect($card['applicants'])->firstWhere('id',$second->id);
        $this->assertNull($empty['latest_degree']); $this->assertNull($empty['experience_months']); $this->assertSame([],$empty['skills']);
        $this->getJson('/api/v1/admin/applications?size=1&page=2')->assertJsonPath('total',2)->assertJsonCount(1,'items');
        $this->getJson('/api/v1/admin/applications?search=missing')->assertJsonPath('total',0);
        $this->getJson('/api/v1/admin/applications?opportunity_type=EDITING_REVIEW')->assertJsonPath('total',0);
        $this->getJson('/api/v1/admin/applications?size=51')->assertStatus(422);
        $this->getJson('/api/v1/admin/applicants/'.$this->member->id)->assertOk()->assertJsonPath('latest_degree','MSc')->assertJsonCount(3,'education')->assertJsonCount(3,'experience')->assertJsonMissingPath('profile.password_hash');
        $this->auth($this->member);
        $this->getJson('/api/v1/admin/applications')->assertForbidden();
        $this->getJson('/api/v1/admin/applicants/'.$second->id)->assertForbidden();
        $this->travelBack();
    }
    public function test_my_applications_are_private_and_include_submission_details(): void
    {
        $a=$this->opp(); $b=$this->opp(); $saved=$this->opp(); $other=$this->opp();
        DB::table('opportunities')->where('id',$a['id'])->update(['status'=>'OPEN']);
        DB::table('opportunities')->where('id',$b['id'])->update(['status'=>'CLOSED']);
        $uuid=fn()=>(string)\Illuminate\Support\Str::uuid();
        foreach ([[$a,$this->member,'Applied','My cover note','2026-10-20 12:30:00'],[$b,$this->member,'UNDER_REVIEW',null,'2026-10-22 12:30:00'],[$saved,$this->member,'Saved','Not submitted','2026-10-23 12:30:00'],[$other,$this->admin,'Applied','Private admin note','2026-10-24 12:30:00']] as [$o,$u,$status,$note,$date]) DB::table('applications')->insert(['id'=>$uuid(),'opportunity_id'=>$o['id'],'applicant_id'=>$u->id,'status'=>$status,'cover_note'=>$note,'applied_at'=>$date]);
        $this->auth($this->member);
        $this->getJson('/api/v1/applications?applicant_id='.$this->admin->id)->assertOk()->assertJsonPath('total',2)->assertJsonPath('items.0.id',$b['id'])->assertJsonPath('items.0.application.status','UNDER_REVIEW')->assertJsonPath('items.0.application.cover_note',null)->assertJsonPath('items.0.can_view_details',false)->assertJsonPath('items.1.application.cover_note','My cover note')->assertJsonPath('items.1.application.applied_at','2026-10-20T12:30:00.000000Z')->assertJsonPath('items.1.can_view_details',true)->assertJsonMissing(['cover_note'=>'Private admin note']);
        $this->getJson('/api/v1/applications?size=1&page=2')->assertJsonPath('total',2)->assertJsonCount(1,'items')->assertJsonPath('items.0.id',$a['id']);
        $this->getJson('/api/v1/applications?search=no-match')->assertJsonPath('total',0);
        $this->getJson('/api/v1/applications?opportunity_type=EDITING_REVIEW')->assertJsonPath('total',0);
        $this->getJson('/api/v1/applications?size=51')->assertStatus(422);
        $this->auth($this->admin);
        $this->getJson('/api/v1/applications')->assertJsonPath('total',1)->assertJsonPath('items.0.id',$other['id']);
        $this->withHeader('Authorization','')->getJson('/api/v1/applications')->assertForbidden();
    }
    public function test_user_filters_updates_permissions_and_dashboard(): void
    {
        $this->getJson('/api/v1/admin/users?search=SYNTHETIC&is_active=true&is_verified=false&size=1')->assertOk()->assertJsonPath('total',1)->assertJsonCount(1,'items')->assertJsonMissingPath('items.0.password_hash')->assertJsonMissingPath('items.0.cv_file_path');
        $this->getJson('/api/v1/admin/users/'.$this->admin->id)->assertNotFound();
        $this->patchJson('/api/v1/admin/users/'.$this->member->id,['is_verified'=>true,'first_name'=>'Ignored'])->assertOk()->assertJsonPath('is_verified',true)->assertJsonPath('first_name','Synthetic');
        $this->getJson('/api/v1/admin/dashboard')->assertExactJson(['total_users'=>1,'active_users'=>1,'pending_verifications'=>0,'total_opportunities'=>0,'open_opportunities'=>0,'total_applications'=>0]);
        $this->getJson('/api/v1/admin/users?size=101')->assertStatus(422);
        $this->getJson('/api/v1/admin/users?is_active=bad')->assertStatus(422);
        $this->auth($this->member); foreach (['users','organisations','categories','dashboard','opportunities'] as $path) $this->getJson('/api/v1/admin/'.$path)->assertForbidden();
        $this->member->forceFill(['user_type'=>'ADMIN'])->save(); $this->auth($this->member);
        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->getJson('/api/v1/users/')->assertExactJson([]);
        $this->auth($this->admin); $this->patchJson('/api/v1/admin/users/'.$this->member->id,['is_active'=>false])->assertOk();
        $this->auth($this->member); $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }
    public function test_categories_and_organizations_crud_conflicts(): void
    {
        $cat=$this->postJson('/api/v1/admin/categories',['name'=>'Technical'])->assertCreated()->assertJsonPath('is_active',true)->json();
        $this->postJson('/api/v1/admin/categories',['name'=>'Technical'])->assertStatus(409);
        $this->putJson('/api/v1/admin/categories/'.$cat['id'],['description'=>'New'])->assertOk();
        $this->deleteJson('/api/v1/admin/categories/'.$cat['id'])->assertNoContent();
        $this->getJson('/api/v1/admin/categories')->assertJsonPath('0.is_active',false);
        $org=$this->org();
        $this->putJson('/api/v1/admin/organisations/'.$org['id'],['website'=>'ftp://bad'])->assertStatus(422);
        $this->putJson('/api/v1/admin/organisations/'.$org['id'],['website'=>' https://example.test '])->assertOk()->assertJsonPath('website','https://example.test');
        $this->getJson('/api/v1/admin/organisations?search=AHMED&industry=Education')->assertJsonPath('total',1)->assertJsonPath('items.0.opportunity_count',0);
        $opp=$this->opp(['organization_id'=>$org['id']]);
        $this->getJson('/api/v1/admin/organisations/'.$org['id'])->assertJsonPath('opportunity_count',1);
        $this->deleteJson('/api/v1/admin/organisations/'.$org['id'])->assertStatus(409);
        $this->deleteJson('/api/v1/admin/opportunities/'.$opp['id'])->assertNoContent();
        $this->deleteJson('/api/v1/admin/organisations/'.$org['id'])->assertNoContent();
        $this->postJson('/api/v1/admin/opportunities',$this->payload(['organization_id'=>$org['id']]))->assertNotFound();
    }
    public function test_opportunity_status_rules_nulls_decimals_and_public_visibility(): void
    {
        $opp=$this->opp(['status'=>'OPEN','fee_amount'=>'1234.50','start_time'=>'09:30','end_time'=>'10:30:15.123456']); $id=$opp['id']; $base='/api/v1/admin/opportunities/'.$id;
        $this->assertSame('1234.50',$opp['fee_amount']);
        $this->assertSame('09:30:00',$opp['start_time']);
        $this->postJson($base.'/publish')->assertStatus(422);
        $org=$this->org(); $this->putJson($base,['organization_id'=>$org['id'],'sub_category'=>null])->assertOk()->assertJsonPath('title','PHP Training');
        $this->postJson($base.'/publish')->assertOk()->assertJsonPath('status','OPEN');
        $this->postJson($base.'/publish')->assertStatus(409); $this->deleteJson($base)->assertStatus(409);
        $this->getJson('/api/v1/admin/opportunities?status=OPEN&search=technical')->assertJsonPath('total',1)->assertJsonPath('items.0.organization_name','Synthetic Institute')->assertJsonPath('items.0.fee_amount',1234.5);
        $this->auth($this->member); $this->getJson('/api/v1/opportunities/'.$id)->assertOk()->assertJsonPath('fee_amount',1234.5)->assertJsonMissingPath('created_by');
        $this->auth($this->admin); $this->putJson($base,['visibility'=>'SHORTLISTED_ONLY'])->assertOk();
        $this->auth($this->member); $this->getJson('/api/v1/opportunities/'.$id)->assertNotFound();
        $this->auth($this->admin); $this->postJson($base.'/archive')->assertOk()->assertJsonPath('status','ARCHIVED'); $this->postJson($base.'/publish')->assertStatus(409);
        $this->putJson($base,['status'=>'CLOSED','visibility'=>'VISIBLE_TO_ALL'])->assertOk(); $this->postJson($base.'/publish')->assertOk();
        $this->postJson('/api/v1/admin/opportunities',$this->payload(['number_of_openings'=>0]))->assertStatus(422);
        $this->putJson($base,['title'=>null])->assertStatus(422);
        $this->putJson($base,['event_date'=>'bad'])->assertStatus(422);
        $this->putJson($base,['opportunity_type'=>''])->assertStatus(422);
    }
    public function test_public_filters_tabs_sort_pagination_and_placeholders(): void
    {
        $org=$this->org();
        $a=$this->opp(['organization_id'=>$org['id'],'fee_amount'=>'20.00','application_deadline'=>now()->addDays(2)->toDateString()]);
        $b=$this->opp(['organization_id'=>$org['id'],'title'=>'Other','fee_amount'=>null,'application_deadline'=>null,'event_date'=>now()->addDays(40)->toDateString(),'tags'=>[],'skills_required'=>[],'delivery_modes'=>['CLASSROOM']]);
        foreach ([$a,$b] as $opp) $this->postJson('/api/v1/admin/opportunities/'.$opp['id'].'/publish')->assertOk();
        $this->opp();
        DB::table('opportunities')->where('id',$a['id'])->update(['number_of_openings'=>0]); // Imported legacy unlimited value is preserved.
        DB::table('applications')->insert(['id'=>(string)\Illuminate\Support\Str::uuid(),'opportunity_id'=>$a['id'],'applicant_id'=>$this->member->id]);
        $this->auth($this->member);
        $this->getJson('/api/v1/opportunities?search=LARAVEL%2CPHP&delivery_mode=ONLINE&state=guj&category=tech&duration_keyword=hours&date_filter=this_week')->assertJsonPath('total',1)->assertJsonPath('items.0.number_of_openings',0)->assertJsonPath('items.0.total_duration','2 hours');
        $this->getJson('/api/v1/opportunities?tab=applied')->assertJsonPath('total',1);
        $this->getJson('/api/v1/opportunities?tab=closing_soon')->assertJsonPath('total',1);
        $this->getJson('/api/v1/opportunities?sort_by=closing_soon&size=1&page=2')->assertJsonPath('total',2)->assertJsonPath('items.0.id',$b['id']);
        $this->getJson('/api/v1/opportunities?sort_by=fee_desc')->assertJsonPath('items.0.id',$a['id']);
        $this->getJson('/api/v1/opportunities?size=51')->assertStatus(422);
        $this->getJson('/api/v1/dashboard/')->assertJsonPath('message','Dashboard coming soon');
        $this->getJson('/api/v1/applications/')->assertOk()->assertJsonPath('total',1)->assertJsonPath('items.0.application.status','Applied');
        $this->postJson('/api/v1/applications/')->assertCreated();
        $this->getJson('/api/v1/organizations/')->assertExactJson(['message'=>'Organization endpoints coming soon','items'=>[]]);
        $this->postJson('/api/v1/organizations/')->assertForbidden();
        $this->auth($this->admin); $this->getJson('/api/v1/admin/dashboard')->assertJsonPath('total_opportunities',3)->assertJsonPath('open_opportunities',2)->assertJsonPath('total_applications',1);
    }
    public function test_attachment_limit_isolation_cleanup_and_failure(): void
    {
        $opp=$this->opp(); $other=$this->opp(); $base='/api/v1/admin/opportunities/'.$opp['id']; $files=[];
        for ($i=0;$i<5;$i++) $files[]=$this->post($base.'/attachments',['file'=>UploadedFile::fake()->createWithContent('file.pdf','%PDF-1.4 fixture')])->assertCreated()->json();
        $this->post($base.'/attachments',['file'=>UploadedFile::fake()->createWithContent('sixth.pdf','%PDF-1.4')])->assertStatus(422);
        $this->getJson($base)->assertJsonCount(5,'attachments');
        $this->get('/'.$files[0]['file_path'])->assertOk();
        $this->deleteJson('/api/v1/admin/opportunities/'.$other['id'].'/attachments/'.$files[0]['id'])->assertNotFound();
        $this->auth($this->member); $this->get('/'.$files[0]['file_path'])->assertNotFound(); $this->post($base.'/attachments',['file'=>UploadedFile::fake()->create('test.pdf')])->assertForbidden();
        $this->auth($this->admin); $this->deleteJson($base.'/attachments/'.$files[0]['id'])->assertNoContent();
        $this->post($base.'/attachments',['file'=>UploadedFile::fake()->create('large.pdf',10241)])->assertStatus(422);
        $this->post($base.'/attachments',['file'=>UploadedFile::fake()->create('unsafe.php',1)])->assertStatus(422);
        $before=glob(storage_path('app/uploads/opportunities/'.$opp['id'].'/*'))?:[];
        D::saving(function(){ throw new \RuntimeException('Synthetic database error'); });
        try { $this->post($base.'/attachments',['file'=>UploadedFile::fake()->createWithContent('failure.pdf','%PDF-1.4')])->assertStatus(500); } finally { D::flushEventListeners(); }
        $this->assertSame($before,glob(storage_path('app/uploads/opportunities/'.$opp['id'].'/*'))?:[]);
        $this->deleteJson($base)->assertNoContent();
        foreach ($files as $file) $this->assertFileDoesNotExist(storage_path('app/'.$file['file_path']));
        $this->assertSame(0,DB::table('opportunity_attachments')->count());
    }
    public function test_full_domain_import_preserves_all_tables_and_is_repeatable(): void
    {
        $org=$this->org(); $opp=$this->opp(['organization_id'=>$org['id'],'fee_amount'=>'45.50']);
        $uuid=fn()=>(string)\Illuminate\Support\Str::uuid(); $user=['user_id'=>$this->member->id];
        DB::table('categories')->insert(['id'=>$uuid(),'name'=>'Import category']);
        DB::table('academic_details')->insert(['id'=>$uuid(),...$user,'school'=>'School','degree'=>'BSc']);
        DB::table('experience_entries')->insert(['id'=>$uuid(),...$user,'job_title'=>'Trainer','organization'=>'School','start_month'=>1,'start_year'=>2020,'skills'=>'["PHP","SQL"]']);
        DB::table('user_expertise')->insert(['id'=>$uuid(),...$user,'total_experience'=>'5','teaching_experience'=>'3','corporate_training'=>'2','online_training'=>'1','classroom_training'=>'2','primary_expertise'=>'PHP','audience_levels'=>'["SCHOOL"]']);
        DB::table('user_preferences')->insert(['id'=>$uuid(),...$user,'delivery_modes'=>'["ONLINE"]','geographic_preference'=>'["MY_CITY"]','willing_to_travel'=>false,'travel_reimbursement'=>false,'preferred_audience'=>'["WORKING_PROFESSIONALS"]','services'=>'["LECTURE_TRAINING"]','training_topics'=>'["PHP"]']);
        DB::table('user_service_delivery')->insert(['id'=>$uuid(),...$user]);
        DB::table('achievements')->insert(['id'=>$uuid(),...$user,'title'=>'Certificate','description'=>'Synthetic','file_path'=>'uploads/achievements/import.pdf','file_name'=>'import.pdf']);
        DB::table('applications')->insert(['id'=>$uuid(),'opportunity_id'=>$opp['id'],'applicant_id'=>$this->member->id]);
        DB::table('opportunity_attachments')->insert(['id'=>$uuid(),'opportunity_id'=>$opp['id'],'file_name'=>'test.pdf','file_path'=>'uploads/opportunities/import.pdf','file_size_bytes'=>10]);
        DB::table('refresh_tokens')->insert(['id'=>$uuid(),...$user,'token_hash'=>hash('sha256','synthetic-token'),'expires_at'=>now()->addDay()]);
        $data=[]; foreach (\App\Services\DomainImporter::TABLES as $table) $data[$table]=DB::table($table)->get()->map(fn($r)=>(array)$r)->all();
        Artisan::call('migrate:fresh',['--force'=>true]);
        $importer=app(\App\Services\DomainImporter::class); $one=$importer->run($data); $two=$importer->run($data);
        foreach ($data as $table=>$rows) { $this->assertSame(count($rows),$one[$table]['inserted']); $this->assertSame(count($rows),$two[$table]['matched']); $this->assertSame(count($rows),DB::table($table)->count()); }
        $changed=$data; $changed['opportunities'][0]['title']='Changed';
        try { $importer->run($changed); $this->fail('Must reject mismatching existing records'); } catch (\RuntimeException $e) { $this->assertStringContainsString('differs',$e->getMessage()); }
        $this->assertSame('PHP Training',DB::table('opportunities')->value('title'));
    }
}
