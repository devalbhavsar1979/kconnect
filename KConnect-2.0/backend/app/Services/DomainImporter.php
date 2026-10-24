<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
final class DomainImporter
{
    public const TABLES=['users','categories','organizations','academic_details','experience_entries','user_expertise','user_preferences','user_service_delivery','achievements','opportunities','applications','opportunity_attachments','refresh_tokens'];
    private const JSON=['skills','audience_levels','delivery_modes','geographic_preference','preferred_audience','services','training_topics','tags','target_audience','skills_required'];
    private function normalize(string $column,mixed $value,array $paths): mixed
    {
        if ($value===null) return null;
        if (in_array($column,self::JSON,true)) {
            $list=is_string($value)?json_decode($value,true,flags:JSON_THROW_ON_ERROR):$value;
            if (!is_array($list) || !array_is_list($list) || array_any($list,fn($item)=>!is_string($item))) throw new \InvalidArgumentException('Invalid array field');
            return json_encode($list,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);
        }
        if (str_ends_with($column,'_at')) return \Carbon\CarbonImmutable::parse($value)->utc()->format('Y-m-d H:i:s.u');
        if (in_array($column,['cv_file_path','profile_photo_path','file_path'],true) && $value!=='') {
            $value=$paths[$value]??$value;
            if (!is_string($value) || !str_starts_with($value,'uploads/') || str_contains($value,'..') || str_contains($value,'\\') || str_contains($value,"\0")) throw new \InvalidArgumentException('Upload path requires an explicit relative-path mapping');
        }
        if (in_array($column,['id','user_id','created_by','organization_id','opportunity_id','applicant_id'],true) && !Str::isUuid($value)) throw new \InvalidArgumentException('Invalid UUID');
        if ($column==='fee_amount') {
            if (!preg_match('/\A-?\d{1,10}(?:\.\d{1,2})?\z/',(string)$value)) throw new \InvalidArgumentException('Invalid decimal precision');
            return bcadd((string)$value,'0',2);
        }
        if (in_array($column,['start_time','end_time'],true)) {
            if (!preg_match('/\A\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?\z/',(string)$value)) throw new \InvalidArgumentException('Invalid time');
            [$time,$fraction]=array_pad(explode('.',$value,2),2,''); return $time.'.'.str_pad($fraction,6,'0');
        }
        return is_bool($value)?(int)$value:$value;
    }
    public function run(array $data,array $paths=[]): array
    {
        if (array_diff(array_keys($data),self::TABLES)) throw new \InvalidArgumentException('Unknown import table');
        return DB::transaction(function() use($data,$paths) {
            $result=[];
            foreach (self::TABLES as $table) {
                $rows=$data[$table]??[]; if (!is_array($rows) || !array_is_list($rows)) throw new \InvalidArgumentException('Expected row list');
                $result[$table]=['inserted'=>0,'matched'=>0]; $columns=Schema::getColumnListing($table);
                foreach ($rows as $row) {
                    if ($table==='refresh_tokens' && isset($row['token'])) { if (isset($row['token_hash'])) throw new \InvalidArgumentException('Ambiguous refresh token'); $row['token_hash']=hash('sha256',$row['token']); unset($row['token']); }
                    if (!is_array($row) || !isset($row['id']) || array_diff(array_keys($row),$columns)) throw new \InvalidArgumentException('Unknown or missing import fields');
                    foreach ($row as $key=>$value) $row[$key]=$this->normalize($key,$value,$paths);
                    if (in_array($table,['users','categories','organizations'],true)) {
                        $counts=app(ReferenceImporter::class)->run([$table=>[$row]]);
                        foreach ($counts as $key=>$count) $result[$table][$key]+=$count;
                        continue;
                    }
                    $existing=DB::table($table)->where('id',$row['id'])->first();
                    if ($existing) {
                        foreach ($row as $key=>$value) {
                            $actual=$this->normalize($key,$existing->$key,[]);
                            if (($actual===null)!==($value===null) || (string)$actual!==(string)$value) throw new \RuntimeException('Existing '.$table.' record differs; transaction rolled back');
                        }
                        $result[$table]['matched']++;
                    } else { DB::table($table)->insert($row); $result[$table]['inserted']++; }
                }
            }
            return $result;
        });
    }
}
