<?php
namespace Tests;
use App\Models\User;
use App\Services\Tokens;
use App\Services\Ownership;
use App\Services\ReferenceImporter;
use App\Exceptions\ApiError;
use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\UploadedFile;
use Firebase\JWT\JWT;
final class AuthTest extends TestCase
{
    public function createApplication() { $app=require __DIR__.'/../bootstrap/app.php'; $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap(); return $app; }
    protected function setUp(): void
    {
        parent::setUp();
        config(['tokens.secret'=>str_repeat('synthetic-test-key-',3)]);
        if (config('database.default')==='mysql' && config('database.connections.mysql.database')!=='kconnect_phase2_test') { throw new \RuntimeException('Tests may reset only kconnect_phase2_test'); }
        Artisan::call('migrate:fresh',['--force'=>true]);
    }
    private function registration(array $extra=[]): array { return array_replace(['first_name'=>'Test','last_name'=>'User','email'=>'test@example.test','password'=>'SyntheticPass123!','confirm_password'=>'SyntheticPass123!','user_type'=>'SME'],$extra); }
    protected function tearDown(): void { DB::disconnect(); parent::tearDown(); }
    private function register(array $extra=[]): array { return $this->post('/api/v1/auth/register',$this->registration($extra))->assertCreated()->assertJsonStructure(['access_token','refresh_token','token_type'])->json(); }
    public function test_lifecycle_current_user_revocation_and_session_independence(): void
    {
        $tokens=$this->register(['is_verified'=>true,'is_active'=>false]);
        $this->assertSame('bearer',$tokens['token_type']);
        $this->assertSame(hash('sha256',$tokens['refresh_token']),DB::table('refresh_tokens')->value('token_hash'));
        foreach (['auth/me','users/me','users/me/profile'] as $path) {
            $this->withToken($tokens['access_token'])->get('/api/v1/'.$path)->assertOk()->assertJsonPath('email','test@example.test')->assertJsonPath('is_verified',false)->assertJsonPath('is_active',true)->assertJsonMissingPath('password_hash');
        }
        $second=$this->postJson('/api/v1/auth/login',['email'=>'test@example.test','password'=>'SyntheticPass123!'])->assertOk()->json();
        $this->assertNotSame($tokens['refresh_token'],$second['refresh_token']);
        $this->postJson('/api/v1/auth/refresh',['refresh_token'=>$tokens['refresh_token']])->assertOk()->assertJsonStructure(['access_token','token_type'])->assertJsonMissingPath('refresh_token');
        $this->postJson('/api/v1/auth/logout',['refresh_token'=>$tokens['refresh_token']])->assertNoContent();
        $this->postJson('/api/v1/auth/logout',['refresh_token'=>$tokens['refresh_token']])->assertNoContent();
        $this->postJson('/api/v1/auth/refresh',['refresh_token'=>$tokens['refresh_token']])->assertUnauthorized();
        $this->postJson('/api/v1/auth/refresh',['refresh_token'=>$second['refresh_token']])->assertOk();
    }
    public function test_registration_validation_duplicates_and_privilege_denial(): void
    {
        $this->post('/api/v1/auth/register',[])->assertStatus(422)->assertJsonPath('detail.0.loc.0','body');
        $this->post('/api/v1/auth/register',$this->registration(['confirm_password'=>'other']))->assertStatus(422)->assertJsonPath('detail','Passwords do not match');
        $this->post('/api/v1/auth/register',$this->registration(['password'=>'short','confirm_password'=>'short']))->assertStatus(422);
        $this->post('/api/v1/auth/register',$this->registration(['date_of_birth'=>'bad']))->assertStatus(422);
        foreach (['ADMIN','SUPER_ADMIN'] as $role) { $this->post('/api/v1/auth/register',$this->registration(['user_type'=>$role]))->assertForbidden(); }
        $this->register();
        $this->post('/api/v1/auth/register',$this->registration())->assertStatus(409);
        $this->assertSame(1,User::count());
    }
    public function test_credentials_disabled_users_and_token_rejection(): void
    {
        $tokens=$this->register();
        $this->postJson('/api/v1/auth/login',['email'=>'test@example.test','password'=>'wrong'])->assertUnauthorized();
        $this->postJson('/api/v1/auth/login',['email'=>'missing@example.test','password'=>'wrong'])->assertUnauthorized();
        $this->get('/api/v1/auth/me')->assertForbidden();
        foreach (['broken',$tokens['refresh_token'],JWT::encode(['sub'=>User::first()->id,'type'=>'access','exp'=>time()-60],config('tokens.secret'),'HS256'),JWT::encode(['sub'=>'not-a-uuid','type'=>'access','exp'=>time()+60],config('tokens.secret'),'HS256')] as $bad) { $this->withToken($bad)->get('/api/v1/auth/me')->assertUnauthorized(); }
        $this->postJson('/api/v1/auth/refresh',['refresh_token'=>$tokens['access_token']])->assertUnauthorized();
        $this->postJson('/api/v1/auth/logout',['refresh_token'=>'broken'])->assertNoContent();
        User::query()->update(['is_active'=>false]);
        $this->postJson('/api/v1/auth/login',['email'=>'test@example.test','password'=>'SyntheticPass123!'])->assertForbidden();
        $this->withToken($tokens['access_token'])->get('/api/v1/auth/me')->assertUnauthorized();
        $this->postJson('/api/v1/auth/refresh',['refresh_token'=>$tokens['refresh_token']])->assertUnauthorized();
    }
    public function test_cv_validation_and_private_persistence(): void
    {
        $this->post('/api/v1/auth/register',$this->registration(['cv'=>UploadedFile::fake()->create('evil.php',1)]))->assertStatus(422);
        $this->post('/api/v1/auth/register',$this->registration(['cv'=>UploadedFile::fake()->create('large.pdf',5121)]))->assertStatus(422);
        $this->register(['cv'=>UploadedFile::fake()->create('test.pdf',2)]);
        $path=storage_path('app/'.User::first()->cv_file_path);
        $this->assertFileExists($path);
        $this->get('/'.User::first()->cv_file_path)->assertNotFound();
        unlink($path);
    }
    public function test_live_database_roles_and_owner_scope(): void
    {
        $tokens=$this->register();
        $request=\Illuminate\Http\Request::create('/api/test-role');
        $request->setUserResolver(fn()=>User::first());
        $guard=new \App\Http\Middleware\RequireRole();
        try { $guard->handle($request,fn()=>true,'SUPER_ADMIN'); $this->fail('Role allowed'); } catch (ApiError $e) { $this->assertSame(403,$e->status); }
        $user=User::first(); $user->forceFill(['user_type'=>'SUPER_ADMIN'])->save();
        $this->assertTrue($guard->handle($request,fn()=>true,'SUPER_ADMIN'));
        Ownership::enforce($user,$user->id);
        $this->expectException(ApiError::class);
        Ownership::enforce($user,'20000000-0000-4000-8000-000000000099');
    }
    public function test_import_is_repeatable_and_atomic(): void
    {
        $data=['users'=>[['id'=>'20000000-0000-4000-8000-000000000001','first_name'=>'Imported','last_name'=>'User','email'=>'import@example.test','password_hash'=>password_hash('ImportPassword123',PASSWORD_BCRYPT),'user_type'=>'SME']], 'categories'=>[['id'=>'30000000-0000-4000-8000-000000000001','name'=>'Fixture']]];
        $importer=new ReferenceImporter();
        $this->assertSame(['inserted'=>2,'matched'=>0],$importer->run($data));
        $this->assertSame(['inserted'=>0,'matched'=>2],$importer->run($data));
        $this->postJson('/api/v1/auth/login',['email'=>'import@example.test','password'=>'ImportPassword123'])->assertOk();
        $data['users'][0]['first_name']='Changed';
        try { $importer->run($data); $this->fail('Conflict accepted'); } catch (\RuntimeException $e) { $this->assertStringContainsString('differs',$e->getMessage()); }
        $this->assertSame('Imported',User::first()->first_name);
    }
    public function test_schema_constraints_and_json_arrays(): void
    {
        $this->register(); $id=User::first()->id;
        DB::table('user_expertise')->insert(['id'=>'30000000-0000-4000-8000-000000000001','user_id'=>$id,'total_experience'=>'1','teaching_experience'=>'1','corporate_training'=>'1','online_training'=>'1','classroom_training'=>'1','primary_expertise'=>'Test','audience_levels'=>json_encode(['SCHOOL','FRESHERS'])]);
        $this->assertSame(['SCHOOL','FRESHERS'],json_decode(DB::table('user_expertise')->value('audience_levels'),true));
        User::first()->delete();
        $this->assertSame(0,DB::table('refresh_tokens')->count());
        $this->assertSame(0,DB::table('user_expertise')->count());
    }
    public function test_legacy_bcrypt_and_jwt_interoperability(): void
    {
        $fixture=json_decode(file_get_contents(__DIR__.'/fixtures/legacy-auth.json'),true);
        $this->assertTrue(password_verify($fixture['password'],$fixture['password_hash']));
        config(['tokens.secret'=>$fixture['key']]);
        $this->assertSame('20000000-0000-4000-8000-000000000001',app(Tokens::class)->decode($fixture['token'],'access')['sub']);
        $this->register();
        User::query()->update(['password_hash'=>$fixture['password_hash']]);
        $this->postJson('/api/v1/auth/login',['email'=>'test@example.test','password'=>$fixture['password']])->assertOk();
    }
    public function test_expired_and_wrong_signature_refresh_are_rejected(): void
    {
        $this->register();
        foreach ([JWT::encode(['sub'=>User::first()->id,'type'=>'refresh','exp'=>time()-1],config('tokens.secret'),'HS256'),JWT::encode(['sub'=>User::first()->id,'type'=>'refresh','exp'=>time()+60],str_repeat('wrong-key',8),'HS256')] as $token) {
            $this->postJson('/api/v1/auth/refresh',['refresh_token'=>$token])->assertUnauthorized();
        }
    }
    public function test_email_case_is_preserved_and_duplicate_constraint_enforced(): void
    {
        $this->register(['email'=>'Case@example.test']);
        $this->register(['email'=>'case@example.test']);
        $this->assertSame(2,User::count());
        $this->expectException(\Illuminate\Database\UniqueConstraintViolationException::class);
        DB::table('users')->insert(['id'=>'20000000-0000-4000-8000-000000000099','first_name'=>'Duplicate','last_name'=>'Test','email'=>'case@example.test','password_hash'=>'unused']);
    }
    public function test_prepare_schema_refuses_unrelated_database(): void
    {
        config(['deployment.synthetic_database'=>true]);
        $this->assertSame(0,Artisan::call('kconnect:prepare-schema'));
        DB::table('migrations')->delete();
        $this->assertSame(1,Artisan::call('kconnect:prepare-schema'));
        $this->assertTrue(\Illuminate\Support\Facades\Schema::hasTable('users'));
    }
}
