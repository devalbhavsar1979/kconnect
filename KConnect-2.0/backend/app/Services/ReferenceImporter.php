<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
final class ReferenceImporter
{
    // Insert-only. Existing records must match every supplied column; never overwrite.
    public function run(array $data): array
    {
        if (array_diff(array_keys($data),['users','categories','organizations'])) { throw new \InvalidArgumentException('Only users/categories/organizations are supported'); }
        return DB::transaction(function () use ($data) {
            $counts=['inserted'=>0,'matched'=>0];
            foreach (['users','categories','organizations'] as $table) {
                $rows=$data[$table]??[];
                if (!is_array($rows) || !array_is_list($rows)) { throw new \InvalidArgumentException('Expected a row list'); }
                $columns=Schema::getColumnListing($table);
                foreach ($rows as $row) {
                    if (!is_array($row) || array_diff(array_keys($row),$columns)) { throw new \InvalidArgumentException('Unknown import fields'); }
                    $rules=['id'=>'required|uuid'];
                    if ($table==='users') { $rules+=['first_name'=>'required|string|max:150','last_name'=>'required|string|max:150','email'=>'required|email:rfc|max:255','password_hash'=>['required','regex:/^\$2[aby]\$\d{2}\$[.\/A-Za-z0-9]{53}$/'],'user_type'=>'required|in:SUPER_ADMIN,ADMIN,SME,PROFESSIONAL_SERVICE_PROVIDER,VENDOR,TRAINER,FREELANCER,CONSULTANT']; }
                    if ($table==='categories') { $rules+=['name'=>'required|string|max:100']; }
                    if ($table==='organizations') { $rules+=['organization_name'=>'required|string|max:255','created_by'=>'required|uuid']; }
                    if (Validator::make($row,$rules)->fails()) { throw new \InvalidArgumentException('Invalid '.$table.' import row'); }
                    foreach ($row as $column=>&$value) {
                        if (str_ends_with($column,'_at') && $value!==null) { $value=\Carbon\CarbonImmutable::parse($value)->utc()->format('Y-m-d H:i:s.u'); }
                    } unset($value);
                    $existing=DB::table($table)->where('id',$row['id'])->first();
                    if ($existing) {
                        foreach ($row as $column=>$value) {
                            $actual=$existing->$column;
                            if (str_ends_with($column,'_at') && $actual!==null) { $actual=\Carbon\CarbonImmutable::parse($actual)->utc()->format('Y-m-d H:i:s.u'); }
                            if (($actual===null)!==($value===null) || (string)$actual!==(string)$value) { throw new \RuntimeException('Existing '.$table.' record differs; import stopped without overwriting'); }
                        }
                        $counts['matched']++; continue;
                    }
                    DB::table($table)->insert($row); $counts['inserted']++;
                }
            }
            return $counts;
        });
    }
}
