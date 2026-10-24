<?php
namespace App\Http\Controllers;
use App\Exceptions\ApiError;
use App\Models\ProfileRecord;
use App\Models\User;
use App\Services\ProfileValidation as V;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
final class ProfileController
{
    private const COMPLETION=['first_name','last_name','title','gender','mobile_number','website','linkedin','date_of_birth','company','designation','short_bio','address_city','address_state','address_country','profile_photo_path'];
    public function updateProfile(Request $request)
    {
        $rules=['first_name'=>'string|min:1|max:150','last_name'=>'string|min:1|max:150','title'=>'nullable|in:MR,MRS,MISS,DR,PROF','gender'=>'nullable|in:MALE,FEMALE,OTHER,PREFER_NOT_TO_SAY','mobile_number'=>'nullable|string|max:20','website'=>'nullable|string|max:100','linkedin'=>'nullable|string|max:100','date_of_birth'=>'nullable|date_format:Y-m-d','company'=>'nullable|string|max:100','designation'=>'nullable|in:PROFESSOR,ASST_PROFESSOR,TRAINER,GUEST_FACULTY','short_bio'=>'nullable|string','address_flat'=>'nullable|string|max:200','address_area'=>'nullable|string|max:200','address_city'=>'nullable|string|max:100','address_state'=>'nullable|string|max:100','address_country'=>'nullable|string|max:100','address_pincode'=>'nullable|string|max:6','user_type'=>'in:SUPER_ADMIN,ADMIN,SME,PROFESSIONAL_SERVICE_PROVIDER,VENDOR,TRAINER,FREELANCER,CONSULTANT','consent'=>'boolean'];
        $data=V::check($request->all(),array_map(fn($r)=>'sometimes|'.$r,$rules));
        foreach (['first_name','last_name'] as $field) { if (isset($data[$field])) { $data[$field]=trim($data[$field]); if ($data[$field]==='') { V::fail($field,'Name cannot be blank'); } } }
        foreach (['mobile_number'=>'/\A\d{10}\z/u','address_pincode'=>'/\A\d{1,6}\z/u','website'=>'~\Ahttps?://~','linkedin'=>'~\Ahttps?://~'] as $field=>$regex) { if (isset($data[$field]) && $data[$field]!=='' && !preg_match($regex,$data[$field])) { V::fail($field,'Invalid '.$field); } }
        if (isset($data['date_of_birth']) && $data['date_of_birth']>now()->subYears(21)->format('Y-m-d')) { V::fail('date_of_birth','Must be at least 21 years old'); }
        return DB::transaction(function() use($request,$data) {
            $user=User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            if (isset($data['user_type']) && $data['user_type']!==$user->user_type && (in_array($data['user_type'],['ADMIN','SUPER_ADMIN'],true) || in_array($user->user_type,['ADMIN','SUPER_ADMIN'],true))) { throw new ApiError(403,'Privileged roles cannot be changed through a personal profile'); }
            $user->forceFill($data)->save(); return response()->json($user->refresh());
        });
    }
    public function completion(Request $request)
    {
        $missing=array_values(array_filter(self::COMPLETION,fn($field)=>$request->user()->$field===null || $request->user()->$field===''));
        return response()->json(['percentage'=>(int)round((15-count($missing))/15*100,0,PHP_ROUND_HALF_EVEN),'missing_fields'=>$missing]);
    }
    private function module(Request $request): string { return $request->route()->defaults['module']; }
    private function query(Request $request) { return ProfileRecord::forModule($this->module($request))->newQuery()->where('user_id',$request->user()->id); }
    private function record(Request $request,string $id): ProfileRecord
    {
        if (!Str::isUuid($id)) { V::fail('entry_id','Input should be a valid UUID'); }
        return $this->query($request)->whereKey($id)->first() ?? throw new ApiError(404,config('profiles.'.$this->module($request).'.missing'));
    }
    public function index(Request $request)
    {
        $query=$this->query($request);
        if ($this->module($request)==='academic') { $query->orderByDesc('end_year')->orderByDesc('created_at'); }
        else { $query->orderByDesc('is_current')->orderByDesc('start_year')->orderByDesc('start_month'); }
        return response()->json($query->get());
    }
    public function create(Request $request)
    {
        $entry=ProfileRecord::forModule($this->module($request));
        $entry->fill(V::module($this->module($request),$request->all())); $entry->user_id=$request->user()->id; $entry->save();
        return response()->json($entry->refresh(),201);
    }
    public function update(Request $request,string $entry_id)
    {
        $entry=$this->record($request,$entry_id); $entry->fill(V::module($this->module($request),$request->all(),true))->save();
        return response()->json($entry->refresh());
    }
    public function delete(Request $request,string $entry_id) { $this->record($request,$entry_id)->delete(); return response('',204); }
    public function singleton(Request $request)
    {
        $entry=$this->query($request)->first();
        if (!$entry && $this->module($request)==='service-delivery') { return response()->json(array_merge(config('profiles.service-delivery.defaults'),['id'=>(string)Str::uuid(),'user_id'=>$request->user()->id,'created_at'=>now()->toISOString(),'updated_at'=>now()->toISOString()])); }
        if (!$entry) { throw new ApiError(404,config('profiles.'.$this->module($request).'.missing')); }
        return response()->json($entry);
    }
    public function upsert(Request $request)
    {
        $data=V::module($this->module($request),$request->all());
        return DB::transaction(function() use($request,$data) {
            User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $entry=$this->query($request)->first() ?? ProfileRecord::forModule($this->module($request));
            $entry->fill($data); $entry->user_id=$request->user()->id; $entry->save();
            return response()->json($entry->refresh());
        });
    }
}
