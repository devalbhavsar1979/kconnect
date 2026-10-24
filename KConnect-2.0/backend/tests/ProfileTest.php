<?php
namespace Tests;
use App\Models\User;
use App\Models\ProfileRecord;
use App\Services\Tokens;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
final class ProfileTest extends TestCase
{
    private User $owner;
    private User $other;
    public function createApplication() { $app=require __DIR__.'/../bootstrap/app.php'; $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap(); return $app; }
    protected function setUp(): void
    {
        parent::setUp(); config(['tokens.secret'=>str_repeat('synthetic-phase3-',3)]);
        if (config('database.default')==='mysql' && config('database.connections.mysql.database')!=='kconnect_phase2_test') { throw new \RuntimeException('Tests may reset only kconnect_phase2_test'); }
        Artisan::call('migrate:fresh',['--force'=>true]);
        foreach (['owner','other'] as $name) { $user=new User(); $user->forceFill(['first_name'=>'Synthetic','last_name'=>$name,'email'=>$name.'@example.test','user_type'=>'SME','password_hash'=>password_hash('SyntheticPassword123',PASSWORD_BCRYPT)])->save(); $this->$name=$user->refresh(); }
        $this->actingAsOwner();
    }
    private function actingAsOwner(): void { $this->withToken(app(Tokens::class)->create($this->owner,'access')); }
    protected function tearDown(): void { DB::disconnect(); parent::tearDown(); }
    private function otherUser(): void { $this->withToken(app(Tokens::class)->create($this->other,'access')); }
    private function endpoint(string $path): string { return '/api/v1/users/me/'.$path; }
    private function photo(): UploadedFile { return UploadedFile::fake()->createWithContent('tiny.png',base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jY1sAAAAASUVORK5CYII=')); }
    public function test_personal_profile_allowlist_validation_and_completion(): void
    {
        $this->getJson($this->endpoint('completion'))->assertOk()->assertJsonPath('percentage',13);
        $this->putJson($this->endpoint('profile'),['first_name'=>'  Updated  ','title'=>'DR','date_of_birth'=>'1990-01-01','mobile_number'=>'9876543210','website'=>'','consent'=>true,'user_type'=>'PROFESSIONAL_SERVICE_PROVIDER','is_verified'=>true,'email'=>'changed@example.test'])->assertOk()->assertJsonPath('first_name','Updated')->assertJsonPath('is_verified',false)->assertJsonPath('email','owner@example.test')->assertJsonPath('date_of_birth','1990-01-01')->assertJsonPath('website','');
        $this->getJson($this->endpoint('completion'))->assertJsonPath('percentage',33);
        $this->putJson($this->endpoint('profile'),['user_type'=>'SUPER_ADMIN'])->assertForbidden();
        foreach ([['mobile_number'=>'123'],['date_of_birth'=>date('Y-m-d')],['website'=>'ftp://example.test'],['address_pincode'=>'1234567'],['first_name'=>'   '],['consent'=>null]] as $bad) { $this->putJson($this->endpoint('profile'),$bad)->assertStatus(422); }
        $this->putJson($this->endpoint('profile'),['company'=>null])->assertOk()->assertJsonPath('company',null);
        $this->otherUser(); $this->getJson($this->endpoint('profile'))->assertJsonPath('first_name','Synthetic');
    }
    public function test_academic_crud_order_and_ownership(): void
    {
        $one=$this->postJson($this->endpoint('academic'),['school'=>'  University  ','degree'=>'BSc','end_year'=>2020])->assertCreated()->assertJsonPath('school','University')->json();
        $two=$this->postJson($this->endpoint('academic'),['school'=>'School','degree'=>'Diploma'])->assertCreated()->json();
        $this->getJson($this->endpoint('academic'))->assertJsonPath('0.id',$one['id'])->assertJsonPath('1.end_year',null);
        $this->putJson($this->endpoint('academic/'.$one['id']),['grade'=>'A','field_of_study'=>null])->assertOk()->assertJsonPath('grade','A')->assertJsonPath('school','University');
        $this->postJson($this->endpoint('academic'),['school'=>'School','degree'=>'BSc','end_year'=>(int)date('Y')+1])->assertStatus(422);
        $this->otherUser();
        $this->getJson($this->endpoint('academic'))->assertExactJson([]);
        $this->putJson($this->endpoint('academic/'.$one['id']),['school'=>'Attack'])->assertNotFound();
        $this->deleteJson($this->endpoint('academic/'.$one['id']))->assertNotFound();
        $this->actingAsOwner(); $this->deleteJson($this->endpoint('academic/'.$one['id']))->assertNoContent();
        $this->getJson($this->endpoint('academic'))->assertJsonCount(1);
    }
    public function test_experience_defaults_skills_order_and_partial_update(): void
    {
        $payload=['job_title'=>'  Lecturer ','organization'=>'School','start_month'=>1,'start_year'=>2020,'skills'=>[' PHP ','',' SQL ']];
        $old=$this->postJson($this->endpoint('experience'),$payload)->assertCreated()->assertJsonPath('skills',['PHP','SQL'])->assertJsonPath('is_current',false)->json();
        $this->postJson($this->endpoint('experience'),array_replace($payload,['is_current'=>true,'end_year'=>2021]))->assertStatus(422);
        $this->postJson($this->endpoint('experience'),array_replace($payload,['end_month'=>1]))->assertStatus(422);
        $current=$this->postJson($this->endpoint('experience'),array_replace($payload,['is_current'=>true,'start_year'=>2019]))->assertCreated()->json();
        $this->getJson($this->endpoint('experience'))->assertJsonPath('0.id',$current['id']);
        $this->putJson($this->endpoint('experience/'.$old['id']),['skills'=>[],'location'=>null])->assertOk()->assertJsonPath('skills',[])->assertJsonPath('location',null);
        $this->otherUser(); $this->deleteJson($this->endpoint('experience/'.$old['id']))->assertNotFound();
        $this->actingAsOwner(); $this->deleteJson($this->endpoint('experience/'.$old['id']))->assertNoContent();
    }
    public function test_singletons_defaults_upserts_and_invalid_preferences(): void
    {
        $this->getJson($this->endpoint('expertise'))->assertNotFound(); $this->getJson($this->endpoint('preferences'))->assertNotFound();
        $this->getJson($this->endpoint('service-delivery'))->assertOk()->assertJsonPath('can_take_lecture',false);
        $this->assertSame(0,DB::table('user_service_delivery')->count());
        $expert=['total_experience'=>'5','teaching_experience'=>'3','corporate_training'=>'2','online_training'=>'1','classroom_training'=>'3','primary_expertise'=>' PHP ','audience_levels'=>['SCHOOL']];
        $a=$this->putJson($this->endpoint('expertise'),$expert)->assertOk()->assertJsonPath('primary_expertise','PHP')->json();
        $this->putJson($this->endpoint('expertise'),array_replace($expert,['secondary_expertise'=>'SQL']))->assertJsonPath('id',$a['id']);
        $this->putJson($this->endpoint('expertise'),array_replace($expert,['audience_levels'=>['BAD']]))->assertStatus(422);
        $prefs=['delivery_modes'=>['ONLINE'],'geographic_preference'=>['MY_CITY'],'willing_to_travel'=>false,'max_travel_distance'=>'BAD','travel_reimbursement'=>false,'preferred_audience'=>['WORKING_PROFESSIONALS'],'services'=>['LECTURE_TRAINING'],'training_topics'=>[' PHP ',' ']];
        $this->putJson($this->endpoint('preferences'),$prefs)->assertOk()->assertJsonPath('max_travel_distance',null)->assertJsonPath('training_topics',['PHP']);
        $this->putJson($this->endpoint('preferences'),array_replace($prefs,['willing_to_travel'=>true]))->assertStatus(422);
        $this->putJson($this->endpoint('preferences'),array_replace($prefs,['willing_to_travel'=>true,'max_travel_distance'=>'50 km']))->assertOk();
        $this->putJson($this->endpoint('service-delivery'),['lecture_online'=>true])->assertJsonPath('lecture_online',true);
        $this->putJson($this->endpoint('service-delivery'),['content_creation'=>true])->assertJsonPath('lecture_online',false)->assertJsonPath('content_creation',true);
        $this->assertSame(1,DB::table('user_service_delivery')->count());
        $this->otherUser(); $this->getJson($this->endpoint('expertise'))->assertNotFound();
    }
    public function test_photo_replacement_file_access_and_failure_preserves_old_photo(): void
    {
        $first=$this->post($this->endpoint('profile/photo'),['photo'=>$this->photo()])->assertOk()->json('profile_photo_path');
        $this->get('/'.$first)->assertOk()->assertHeader('Content-Type','image/png');
        $this->post($this->endpoint('profile/photo'),['photo'=>UploadedFile::fake()->create('bad.txt',1,'text/plain')])->assertStatus(422);
        $this->assertSame($first,$this->owner->fresh()->profile_photo_path);
        $this->otherUser(); $this->get('/'.$first)->assertNotFound();
        $this->actingAsOwner();
        $second=$this->post($this->endpoint('profile/photo'),['photo'=>$this->photo()])->assertOk()->json('profile_photo_path');
        $this->assertNotSame($first,$second); $this->assertFileDoesNotExist(storage_path('app/'.$first));
        $this->get('/'.$first)->assertNotFound();
        $this->get('/uploads/../.env')->assertNotFound();
        @unlink(storage_path('app/'.$second));
    }
    public function test_achievements_upload_keep_clear_delete_and_foreign_access(): void
    {
        $payload=['title'=>' Certificate ','description'=>' Achievement ','file'=>UploadedFile::fake()->createWithContent('certificate.pdf','%PDF-1.4 synthetic')];
        $entry=$this->post($this->endpoint('achievements'),$payload)->assertCreated()->assertJsonPath('title','Certificate')->json();
        $this->get('/'.$entry['file_path'])->assertOk();
        $this->put($this->endpoint('achievements/'.$entry['id']),['description'=>'Updated'])->assertOk()->assertJsonPath('file_path',$entry['file_path']);
        $this->otherUser(); $this->put($this->endpoint('achievements/'.$entry['id']),['title'=>'Attack'])->assertNotFound(); $this->get('/'.$entry['file_path'])->assertNotFound();
        $this->actingAsOwner();
        $this->put($this->endpoint('achievements/'.$entry['id']),['file'=>UploadedFile::fake()->create('bad.exe',1,'application/x-msdownload')])->assertStatus(422);
        $this->get('/'.$entry['file_path'])->assertOk();
        $this->put($this->endpoint('achievements/'.$entry['id']),['clear_file'=>'true'])->assertOk()->assertJsonPath('file_path',null)->assertJsonPath('file_name',null);
        $this->assertFileDoesNotExist(storage_path('app/'.$entry['file_path']));
        $this->deleteJson($this->endpoint('achievements/'.$entry['id']))->assertNoContent();
        $this->getJson($this->endpoint('achievements'))->assertExactJson([]);
    }
    public function test_file_limits_and_rollback_after_database_failure(): void
    {
        $this->post($this->endpoint('profile/photo'),['photo'=>UploadedFile::fake()->create('large.png',2049,'image/png')])->assertStatus(422);
        $this->post($this->endpoint('achievements'),['title'=>'Too large','description'=>'Test','file'=>UploadedFile::fake()->create('large.pdf',10241,'application/pdf')])->assertStatus(422);
        $before=glob(storage_path('app/uploads/achievements/'.$this->owner->id.'/*'))?:[];
        ProfileRecord::saving(function(){ throw new \RuntimeException('Synthetic database failure'); });
        try { $this->post($this->endpoint('achievements'),['title'=>'Failure','description'=>'Test','file'=>UploadedFile::fake()->createWithContent('test.pdf','%PDF-1.4 synthetic')])->assertStatus(500); }
        finally { ProfileRecord::flushEventListeners(); }
        $this->assertSame($before,glob(storage_path('app/uploads/achievements/'.$this->owner->id.'/*'))?:[]);
        $this->assertSame(0,DB::table('achievements')->count());
    }
}
