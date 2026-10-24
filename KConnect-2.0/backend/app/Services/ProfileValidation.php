<?php
namespace App\Services;
use App\Exceptions\ApiError;
use Illuminate\Support\Facades\Validator;
final class ProfileValidation
{
    public static function fail(string $field,string $message): never { throw new ApiError(422,[['type'=>'value_error','loc'=>['body',$field],'msg'=>$message]]); }
    public static function check(array $input,array $rules): array
    {
        foreach ($rules as $field=>$rule) {
            if (str_contains($rule,'boolean') && isset($input[$field]) && is_string($input[$field])) {
                $v=strtolower($input[$field]);
                if (in_array($v,['true','yes','on','1','t','y'],true)) { $input[$field]=true; }
                elseif (in_array($v,['false','no','off','0','f','n'],true)) { $input[$field]=false; }
            }
            if (str_contains($rule,'array') && isset($input[$field]) && is_array($input[$field]) && !array_is_list($input[$field])) { self::fail($field,'Input should be a list'); }
        }
        $validator=Validator::make($input,$rules);
        if ($validator->fails()) {
            $errors=[];
            foreach ($validator->errors()->messages() as $field=>$messages) { foreach ($messages as $message) { $errors[]=['type'=>'value_error','loc'=>array_merge(['body'],explode('.',$field)),'msg'=>$message]; } }
            throw new ApiError(422,$errors);
        }
        return $validator->validated();
    }
    public static function module(string $module,array $input,bool $partial=false): array
    {
        $config=config('profiles.'.$module); $rules=[];
        foreach ($config['rules'] as $field=>$rule) { $rules[$field]=(str_contains($field,'.')?'':(!$partial && in_array($field,$config['required'],true)?'required|':'sometimes|')).$rule; }
        $data=self::check($input,$rules);
        if (!$partial) { $data=array_replace($config['defaults'],$data); }
        if (!$partial && in_array($module,['academic','experience','expertise'],true)) {
            foreach ($config['required'] as $field) { if (isset($data[$field]) && str_contains($config['rules'][$field],'string')) { $data[$field]=trim($data[$field]); if ($data[$field]==='') { self::fail($field,'This field cannot be blank'); } } }
        }
        if ($module==='academic' && !$partial && ($data['end_year']??0)>(int)date('Y')) { self::fail('end_year','End year cannot be in the future'); }
        if ($module==='experience' && !$partial) {
            if (isset($data['skills'])) { $data['skills']=array_values(array_filter(array_map('trim',$data['skills']),fn($v)=>$v!=='')); if (count($data['skills'])>20 || array_any($data['skills'],fn($s)=>mb_strlen($s)>100)) { self::fail('skills','Maximum 20 skills, each 100 characters or less'); } }
            if ($data['is_current'] && (isset($data['end_month']) || isset($data['end_year']))) { self::fail('end_year',"End date must be empty when 'currently working here' is checked"); }
            if (!$data['is_current'] && isset($data['end_month'])!==isset($data['end_year'])) { self::fail('end_year','Provide both end month and end year, or neither'); }
        }
        if ($module==='preferences') {
            $data['training_topics']=array_values(array_filter(array_map('trim',$data['training_topics']),fn($v)=>$v!==''));
            if (!$data['training_topics']) { self::fail('training_topics','At least one non-blank training topic is required'); }
            if (!$data['willing_to_travel']) { $data['max_travel_distance']=null; }
            elseif (!in_array($data['max_travel_distance'],['25 km','50 km','100 km','200 km','500 km','Any distance'],true)) { self::fail('max_travel_distance','Maximum travel distance is required when willing to travel'); }
        }
        return $data;
    }
}
