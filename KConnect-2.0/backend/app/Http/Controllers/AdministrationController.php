<?php
namespace App\Http\Controllers;
use App\Exceptions\ApiError;
use App\Models\DomainRecord as D;
use App\Models\User;
use App\Services\DomainQueries as Q;
use App\Services\ProfileValidation as V;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\UniqueConstraintViolationException;
final class AdministrationController
{
    private const USER_FIELDS=['id','first_name','last_name','email','mobile_number','user_type','profile_status','is_active','is_verified','title','gender','designation','company','address_city','address_state','address_country','date_of_birth','created_at','updated_at'];
    public function users(Request $r)
    {
        $page=Q::page($r); $q=User::where('user_type','!=','SUPER_ADMIN');
        $filters=V::check($r->query(),['search'=>'sometimes|string','user_type'=>'sometimes|string','is_active'=>'sometimes|boolean','is_verified'=>'sometimes|boolean']);
        Q::search($q,['first_name','last_name','email'],$filters['search']??null);
        foreach (['user_type','is_active','is_verified'] as $field) { if (isset($filters[$field]) && $filters[$field]!=='') { $q->where($field,$filters[$field]); } }
        return response()->json(Q::paginate($q->orderByDesc('created_at'),$page,fn($u)=>$u->only(self::USER_FIELDS)));
    }
    private function user(string $id): User
    {
        V::check(['id'=>$id],['id'=>'required|uuid']);
        return User::whereKey($id)->where('user_type','!=','SUPER_ADMIN')->first() ?? throw new ApiError(404,'User not found');
    }
    public function getUser(string $user_id) { return response()->json($this->user($user_id)->only(self::USER_FIELDS)); }
    public function applicantProfile(string $user_id)
    {
        $u=$this->user($user_id);
        if (!DB::table('applications')->where('applicant_id',$user_id)->where('status','Applied')->exists()) throw new ApiError(404,'Applicant not found');
        $summary=\App\Services\ApplicantProfiles::summaries([$user_id])[$user_id];
        return response()->json(array_merge($summary,[
            'profile'=>$u->only(['email','mobile_number','designation','company','short_bio','address_city','address_state','address_country','website','linkedin']),
            'education'=>DB::table('academic_details')->where('user_id',$user_id)->orderByDesc('end_year')->orderByDesc('end_month')->orderBy('id')->get(['id','school','degree','field_of_study','end_year','end_month','grade','description']),
            'experience'=>DB::table('experience_entries')->where('user_id',$user_id)->orderByDesc('start_year')->orderByDesc('start_month')->orderBy('id')->get(['id','job_title','organization','location','start_year','start_month','end_year','end_month','is_current','highlights','skills'])->map(function($e) { $e->skills=json_decode($e->skills??'[]',true)??[]; return $e; }),
        ]));
    }
    public function updateUser(Request $r,string $user_id)
    {
        $u=$this->user($user_id);
        $data=V::check($r->all(),['user_type'=>'sometimes|in:SUPER_ADMIN,ADMIN,SME,PROFESSIONAL_SERVICE_PROVIDER,VENDOR,TRAINER,FREELANCER,CONSULTANT','is_active'=>'sometimes|boolean','is_verified'=>'sometimes|boolean']);
        $u->forceFill($data)->save(); return response()->json($u->refresh()->only(self::USER_FIELDS));
    }
    public function organizations(Request $r)
    {
        $page=Q::page($r,20,200); $q=D::table('organizations')->newQuery();
        $filters=V::check($r->query(),['search'=>'sometimes|string','industry'=>'sometimes|string']);
        Q::search($q,['organization_name','city'],$filters['search']??null);
        if (($filters['industry']??'')!=='') { $q->where('industry',$filters['industry']); }
        $q->select('organizations.*')->selectSub(DB::table('opportunities')->selectRaw('COUNT(*)')->whereColumn('organization_id','organizations.id'),'opportunity_count');
        return response()->json(Q::paginate($q->orderByDesc('created_at'),$page,fn($o)=>array_replace($o->toArray(),['opportunity_count'=>(int)$o->opportunity_count])));
    }
    private function organization(D $org): array { return array_merge($org->toArray(),['opportunity_count'=>DB::table('opportunities')->where('organization_id',$org->id)->count()]); }
    public function getOrganization(string $org_id) { return response()->json($this->organization(Q::record('organizations',$org_id,'Organisation not found'))); }
    public function saveOrganization(Request $r,?string $org_id=null)
    {
        $rules=[];
        foreach (['organization_name'=>255,'industry'=>200,'organization_type'=>100,'website'=>512,'email'=>255,'mobile_number'=>20,'city'=>100,'state'=>100,'country'=>100,'address'=>null] as $field=>$length) {
            $required=in_array($field,['organization_name','industry','organization_type'],true);
            $rules[$field]=(!$org_id && $required?'present|':'sometimes|').($field==='organization_name' || (!$org_id && $required)?'':'nullable|').'string'.($length?'|max:'.$length:'');
        }
        $data=V::check($r->all(),$rules);
        if (!$org_id) { $data['organization_name']=trim($data['organization_name']); if ($data['organization_name']==='') V::fail('organization_name','Organisation name cannot be blank'); }
        if (array_key_exists('website',$data)) { $data['website']=trim($data['website']??'') ?: null; if ($data['website'] && !preg_match('~\Ahttps?://~',$data['website'])) V::fail('website','Website must start with http:// or https://'); }
        $org=$org_id?Q::record('organizations',$org_id,'Organisation not found'):D::table('organizations');
        $org->fill($data); if (!$org_id) $org->created_by=$r->user()->id;
        $org->save(); return response()->json($this->organization($org->refresh()),$org_id?200:201);
    }
    public function deleteOrganization(string $org_id)
    {
        DB::transaction(function() use($org_id) {
            $org=Q::record('organizations',$org_id,'Organisation not found',true);
            $count=DB::table('opportunities')->where('organization_id',$org_id)->count();
            if ($count) throw new ApiError(409,'Cannot delete — organisation has '.$count.' linked opportunit'.($count===1?'y':'ies'));
            $org->delete();
        }); return response('',204);
    }
    public function categories() { return response()->json(D::table('categories')->newQuery()->orderBy('name')->get()); }
    public function saveCategory(Request $r,?string $cat_id=null)
    {
        $data=V::check($r->all(),['name'=>($cat_id?'sometimes':'required').'|string|min:1|max:100','description'=>'sometimes|nullable|string','is_active'=>'sometimes|boolean']);
        $cat=$cat_id?Q::record('categories',$cat_id,'Category not found'):D::table('categories');
        try { $cat->fill($data)->save(); }
        catch (UniqueConstraintViolationException) { throw new ApiError(409,'A category with this name already exists'); }
        return response()->json($cat->refresh(),$cat_id?200:201);
    }
    public function deleteCategory(string $cat_id) { $cat=Q::record('categories',$cat_id,'Category not found'); $cat->is_active=false; $cat->save(); return response('',204); }
    public function dashboard()
    {
        $users=User::where('user_type','!=','SUPER_ADMIN');
        return response()->json(['total_users'=>(clone $users)->count(),'active_users'=>(clone $users)->where('is_active',true)->count(),'total_opportunities'=>DB::table('opportunities')->count(),'open_opportunities'=>DB::table('opportunities')->where('status','OPEN')->count(),'total_applications'=>DB::table('applications')->where('status','!=','Saved')->count(),'pending_verifications'=>(clone $users)->where('is_active',true)->where('is_verified',false)->count()]);
    }
}
