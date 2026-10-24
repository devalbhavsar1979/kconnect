<?php
namespace App\Http\Controllers;
use App\Exceptions\ApiError;
use App\Models\DomainRecord as D;
use App\Services\DomainQueries as Q;
use App\Services\ProfileValidation as V;
use App\Services\ProfileFiles;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
final class OpportunityController
{
    private const ADMIN_FIELDS=['id','title','opportunity_type','category','status','visibility','organization_id','organization_name','short_description','delivery_modes','skills_required','compensation_type','fee_amount','fee_structure','number_of_openings','event_date','application_deadline','created_at','updated_at'];
    private const CARD_FIELDS=['id','title','opportunity_type','organization_name','short_description','delivery_modes','skills_required','tags','preferred_location','expertise_level','compensation_type','fee_amount','fee_structure','number_of_openings','application_deadline','event_date','total_duration','created_at','status'];
    private function query() { return D::table('opportunities')->newQuery()->leftJoin('organizations','opportunities.organization_id','=','organizations.id')->select('opportunities.*','organizations.organization_name'); }
    private function card(D $opp,bool $admin): array
    {
        $data=$opp->only($admin?self::ADMIN_FIELDS:self::CARD_FIELDS);
        $data['fee_amount']=$opp->fee_amount===null?null:(float)$opp->fee_amount;
        if (!$admin) { $data['venue_city']=$opp->venue_name; }
        return $data;
    }
    private function full(D $opp): array
    {
        $data=$opp->toArray();
        foreach (['start_time','end_time'] as $field) { if ($data[$field]!==null && str_ends_with($data[$field],'.000000')) $data[$field]=substr($data[$field],0,-7); }
        $data['attachments']=D::table('opportunity_attachments')->newQuery()->where('opportunity_id',$opp->id)->orderBy('uploaded_at')->get()->toArray();
        return $data;
    }
    public function adminIndex(Request $r)
    {
        $page=Q::page($r); $q=$this->query(); $filters=V::check($r->query(),['search'=>'sometimes|string','status'=>'sometimes|string','opportunity_type'=>'sometimes|string']);
        foreach (['status','opportunity_type'] as $field) { if (($filters[$field]??'')!=='') $q->where('opportunities.'.$field,$filters[$field]); }
        Q::search($q,['opportunities.title','opportunities.category','opportunities.short_description'],$filters['search']??null);
        return response()->json(Q::paginate($q->orderByDesc('opportunities.created_at'),$page,fn($o)=>$this->card($o,true)));
    }
    public function myApplications(Request $r)
    {
        $page=Q::page($r,12,50);
        $f=V::check($r->query(),['search'=>'sometimes|string','opportunity_type'=>'sometimes|string']);
        $q=$this->query()->join('applications','applications.opportunity_id','=','opportunities.id')
            ->where('applications.applicant_id',$r->user()->id)->where('applications.status','!=','Saved')
            ->addSelect('applications.id as application_id','applications.status as application_status','applications.cover_note','applications.applied_at');
        Q::search($q,['opportunities.title','organizations.organization_name','opportunities.short_description'],$f['search']??null);
        if (!empty($f['opportunity_type'])) $q->where('opportunities.opportunity_type',$f['opportunity_type']);
        return response()->json(Q::paginate($q->orderByDesc('applications.applied_at')->orderBy('applications.id'),$page,fn($o)=>array_merge($this->card($o,false),[
            'application'=>['id'=>$o->application_id,'status'=>$o->application_status,'cover_note'=>$o->cover_note,'applied_at'=>\Illuminate\Support\Carbon::parse($o->applied_at,config('app.timezone'))->toISOString()],
            'can_view_details'=>$o->status==='OPEN' && $o->visibility==='VISIBLE_TO_ALL',
        ])));
    }
    public function applications(Request $r)
    {
        $page=Q::page($r,12,50);
        $filters=V::check($r->query(),['search'=>'sometimes|string','opportunity_type'=>'sometimes|string']);
        $q=$this->query()->whereExists(fn($a)=>$a->selectRaw('1')->from('applications')->whereColumn('applications.opportunity_id','opportunities.id')->where('applications.status','Applied'));
        Q::search($q,['opportunities.title','organizations.organization_name','opportunities.short_description'],$filters['search']??null);
        if (!empty($filters['opportunity_type'])) $q->where('opportunities.opportunity_type',$filters['opportunity_type']);
        $result=Q::paginate($q->orderByDesc('opportunities.created_at')->orderBy('opportunities.id'),$page,fn($o)=>$this->card($o,false));
        $applications=DB::table('applications')->whereIn('opportunity_id',array_column($result['items'],'id'))->where('status','Applied')->orderByDesc('applied_at')->orderBy('id')->get();
        $summaries=\App\Services\ApplicantProfiles::summaries($applications->pluck('applicant_id')->unique()->all());
        foreach ($result['items'] as &$item) $item['applicants']=$applications->where('opportunity_id',$item['id'])->map(fn($a)=>array_merge($summaries[$a->applicant_id],['application_id'=>$a->id,'applied_at'=>$a->applied_at]))->values()->all();
        return response()->json($result);
    }
    public function index(Request $r)
    {
        $page=Q::page($r,12,50); $q=$this->query()->where('opportunities.status','OPEN')->where('opportunities.visibility','VISIBLE_TO_ALL');
        $f=V::check($r->query(),array_fill_keys(['search','opportunity_type','delivery_mode','expertise_level','state','category','date_filter','duration_keyword','sort_by','tab'],'sometimes|string'));
        if (($f['tab']??'')==='saved') $q->whereExists(fn($a)=>$a->selectRaw('1')->from('applications')->whereColumn('applications.opportunity_id','opportunities.id')->where('applicant_id',$r->user()->id)->where('applications.status','Saved'));
        if (($f['tab']??'')==='applied') $q->whereExists(fn($a)=>$a->selectRaw('1')->from('applications')->whereColumn('applications.opportunity_id','opportunities.id')->where('applicant_id',$r->user()->id)->where('applications.status','!=','Saved'));
        if (($f['tab']??'')==='closing_soon') $q->whereNotNull('application_deadline')->where('application_deadline','<=',now()->addDays(3)->toDateString());
        if (($f['search']??'')!=='') Q::search($q,['opportunities.title','opportunities.short_description',Q::arrayText('opportunities.tags'),Q::arrayText('opportunities.skills_required')],$f['search']);
        foreach (['opportunity_type','expertise_level'] as $field) { if (($f[$field]??'')!=='') $q->where('opportunities.'.$field,$f[$field]); }
        if (($f['delivery_mode']??'')!=='') $q->whereJsonContains('delivery_modes',$f['delivery_mode']);
        Q::search($q,['preferred_location','organizations.state'],$f['state']??null);
        Q::search($q,['category'],$f['category']??null);
        Q::search($q,['total_duration'],$f['duration_keyword']??null);
        $days=['this_week'=>7,'this_month'=>30,'next_3_months'=>90][$f['date_filter']??'']??null;
        if ($days) $q->whereBetween('event_date',[now()->toDateString(),now()->addDays($days)->toDateString()]);
        if (($f['sort_by']??'')==='closing_soon') $q->orderByRaw('application_deadline IS NULL')->orderBy('application_deadline');
        elseif (($f['sort_by']??'')==='fee_desc') $q->orderByRaw('fee_amount IS NULL')->orderByDesc('fee_amount');
        else $q->orderByDesc('opportunities.created_at');
        return response()->json(Q::paginate($q,$page,fn($o)=>$this->card($o,false)));
    }
    public function show(Request $r,string $opportunity_id)
    {
        V::check(['id'=>$opportunity_id],['id'=>'required|uuid']);
        $o=$this->query()->where('opportunities.id',$opportunity_id)->where('opportunities.status','OPEN')->where('visibility','VISIBLE_TO_ALL')->first() ?? throw new ApiError(404,'Opportunity not found');
        $data=$this->full($o); $data['fee_amount']=$o->fee_amount===null?null:(float)$o->fee_amount; unset($data['created_by']);
        $data['organization']=$o->organization_id ? D::table('organizations')->newQuery()->find($o->organization_id)?->only(['organization_name','organization_type','address','city','state','website']) : null;
        $data['response_status']=DB::table('applications')->where('opportunity_id',$o->id)->where('applicant_id',$r->user()->id)->value('status');
        return response()->json($data);
    }
    public function respond(Request $r,string $opportunity_id)
    {
        $input=V::check($r->all(),['status'=>'required|in:Applied,Saved,APPLIED,SAVED_FOR_LATER']);
        V::check(['id'=>$opportunity_id],['id'=>'required|uuid']);
        return DB::transaction(function() use($r,$opportunity_id,$input) {
            $o=$this->query()->where('opportunities.id',$opportunity_id)->where('opportunities.status','OPEN')->where('visibility','VISIBLE_TO_ALL')->lockForUpdate()->first() ?? throw new ApiError(404,'Opportunity not found');
            $existing=DB::table('applications')->where('opportunity_id',$o->id)->where('applicant_id',$r->user()->id)->first();
            $status=match($input['status']) { 'APPLIED'=>'Applied', 'SAVED_FOR_LATER'=>'Saved', default=>$input['status'] };
            if ($existing && ($existing->status!=='Saved' || $status==='Saved')) return response()->json(['status'=>$existing->status]);
            if ($status==='Applied' && $o->application_deadline && $o->application_deadline->endOfDay()->isPast()) throw new ApiError(422,'The application deadline has passed');
            $values=['status'=>$status,'applied_at'=>now(),'updated_at'=>now()];
            if ($existing) {
                DB::table('applications')->where('id',$existing->id)->update($values);
            } else {
                DB::table('applications')->insert(['id'=>(string)Str::uuid(),'opportunity_id'=>$o->id,'applicant_id'=>$r->user()->id,...$values]);
            }
            return response()->json(['status'=>$status]);
        });
    }
    public function download(string $opportunity_id,string $attachment_id,ProfileFiles $files)
    {
        V::check(['id'=>$opportunity_id,'attachment'=>$attachment_id],['id'=>'required|uuid','attachment'=>'required|uuid']);
        $this->query()->where('opportunities.id',$opportunity_id)->where('opportunities.status','OPEN')->where('visibility','VISIBLE_TO_ALL')->first() ?? throw new ApiError(404,'Opportunity not found');
        $a=D::table('opportunity_attachments')->newQuery()->where('id',$attachment_id)->where('opportunity_id',$opportunity_id)->first() ?? throw new ApiError(404,'Attachment not found');
        $path=$files->path($a->file_path) ?? throw new ApiError(404,'File not found');
        return response()->download($path,$a->file_name,['X-Content-Type-Options'=>'nosniff']);
    }
    public function adminShow(string $opp_id) { return response()->json($this->full(Q::record('opportunities',$opp_id,'Opportunity not found'))); }
    public function save(Request $r,?string $opp_id=null)
    {
        $rules=[];
        foreach (config('opportunities.rules') as $field=>$rule) $rules[$field]=(str_contains($field,'.')?'':(!$opp_id && in_array($field,config('opportunities.required'),true)?'present|':'sometimes|')).$rule;
        $data=V::check($r->all(),$rules);
        foreach ($data as $field=>$value) { if ($value==='' && preg_match('/(?:^|\|)(in:|integer|boolean|date_format:|uuid)/',config('opportunities.rules.'.$field,''))) V::fail($field,'Invalid '.$field); }
        foreach (['start_time','end_time'] as $field) {
            if (isset($data[$field])) {
                if (!preg_match('/\A([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(\.\d{1,6})?)?\z/',$data[$field])) V::fail($field,'Input should be a valid time');
                if (strlen($data[$field])===5) $data[$field].=':00';
            }
        }
        if (!$opp_id) $data=array_replace(config('opportunities.defaults'),$data,['status'=>'DRAFT','created_by'=>$r->user()->id]);
        return DB::transaction(function() use($opp_id,$data) {
            // Organization locks are also used by deletion, so a deleted organization cannot be linked concurrently.
            if (isset($data['organization_id'])) { Q::record('organizations',$data['organization_id'],'Organisation not found',true); }
            $opp=$opp_id?Q::record('opportunities',$opp_id,'Opportunity not found',true):D::table('opportunities');
            $opp->fill($data)->save(); return response()->json($this->full($opp->refresh()),$opp_id?200:201);
        });
    }
    public function publish(string $opp_id)
    {
        return DB::transaction(function() use($opp_id) {
            $opp=Q::record('opportunities',$opp_id,'Opportunity not found',true);
            if (!in_array($opp->status,['DRAFT','CLOSED'],true)) throw new ApiError(409,'Cannot publish opportunity with status '.$opp->status);
            if (!$opp->organization_id) throw new ApiError(422,'organization_id is required to publish');
            $opp->status='OPEN'; $opp->save(); return response()->json($this->full($opp->refresh()));
        });
    }
    public function archive(string $opp_id)
    {
        return DB::transaction(function() use($opp_id) { $opp=Q::record('opportunities',$opp_id,'Opportunity not found',true); $opp->status='ARCHIVED'; $opp->save(); return response()->json($this->full($opp->refresh())); });
    }
    public function delete(string $opp_id,ProfileFiles $files)
    {
        $paths=DB::transaction(function() use($opp_id) {
            $opp=Q::record('opportunities',$opp_id,'Opportunity not found',true);
            if ($opp->status!=='DRAFT') throw new ApiError(409,'Only DRAFT opportunities can be deleted');
            if (DB::table('applications')->where('opportunity_id',$opp_id)->exists()) throw new ApiError(409,'Cannot delete opportunity with linked applications');
            $paths=DB::table('opportunity_attachments')->where('opportunity_id',$opp_id)->pluck('file_path');
            $opp->delete(); return $paths;
        }); foreach ($paths as $path) $files->remove($path);
        return response('',204);
    }
    public function upload(Request $r,string $opp_id,ProfileFiles $files)
    {
        V::check($r->all(),['file'=>'required|file']); $path=null;
        try {
            $att=DB::transaction(function() use($r,$opp_id,&$path) {
                Q::record('opportunities',$opp_id,'Opportunity not found',true);
                if (DB::table('opportunity_attachments')->where('opportunity_id',$opp_id)->count()>=5) throw new ApiError(422,'Maximum 5 attachments allowed per opportunity');
                $file=$r->file('file');
                if (!$file->isValid() || $file->getSize()>10*1024*1024) throw new ApiError(422,'File exceeds 10 MB limit');
                if (!in_array(strtolower($file->getClientOriginalExtension()),['pdf','doc','docx','ppt','pptx'],true)) throw new ApiError(422,'File type not allowed. Allowed: .pdf, .doc, .docx, .ppt, .pptx');
                $name=basename(str_replace('\\','/',$file->getClientOriginalName())); $name=preg_replace('/[\x00-\x1f\x7f]/u','',$name) ?: 'document';
                // Stored path uses a UUID, avoiding filesystem filename length/encoding limits.
                $path='uploads/opportunities/'.$opp_id.'/'.Str::uuid().'.'.strtolower($file->getClientOriginalExtension());
                $att=D::table('opportunity_attachments');
                $att->fill(['opportunity_id'=>$opp_id,'file_name'=>mb_substr($name,0,300),'file_path'=>$path,'file_size_bytes'=>$file->getSize()]);
                $file->move(dirname(storage_path('app/'.$path)),basename($path));
                $att->save(); return $att->refresh();
            });
        } catch (\Throwable $e) { $files->remove($path); throw $e; }
        return response()->json($att,201);
    }
    public function deleteAttachment(string $opp_id,string $attachment_id,ProfileFiles $files)
    {
        $path=DB::transaction(function() use($opp_id,$attachment_id) {
            Q::record('opportunities',$opp_id,'Opportunity not found',true);
            $att=Q::record('opportunity_attachments',$attachment_id,'Attachment not found');
            if ($att->opportunity_id!==$opp_id) throw new ApiError(404,'Attachment not found');
            $path=$att->file_path; $att->delete(); return $path;
        }); $files->remove($path); return response('',204);
    }
}
