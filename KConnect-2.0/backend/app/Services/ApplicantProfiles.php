<?php
namespace App\Services;
use Illuminate\Support\Facades\DB;

final class ApplicantProfiles
{
    public static function summaries(array $ids): array
    {
        $users=DB::table('users')->whereIn('id',$ids)->get(['id','first_name','last_name','user_type']);
        $education=DB::table('academic_details')->whereIn('user_id',$ids)->whereNotNull('end_year')->orderByDesc('end_year')->orderByDesc('end_month')->orderBy('id')->get()->groupBy('user_id');
        $experience=DB::table('experience_entries')->whereIn('user_id',$ids)->orderBy('start_year')->orderBy('start_month')->orderBy('id')->get()->groupBy('user_id');
        $result=[];
        $today=now('Asia/Kolkata');
        $currentMonth=$today->year*12+$today->month;
        foreach ($users as $user) {
            $skills=[]; $earliest=null;
            foreach ($experience->get($user->id,collect()) as $entry) {
                $month=(int)$entry->start_year*12+(int)$entry->start_month;
                if ($entry->start_year>0 && $entry->start_month>=1 && $entry->start_month<=12 && $month<=$currentMonth) $earliest=$earliest===null?$month:min($earliest,$month);
                foreach (json_decode($entry->skills??'[]',true)??[] as $skill) {
                    if (!is_string($skill) || trim($skill)==='') continue;
                    $skill=trim($skill); $skills[mb_strtolower($skill)]??=$skill;
                }
            }
            $degree=$education->get($user->id,collect())->first();
            $result[$user->id]=['id'=>$user->id,'name'=>trim($user->first_name.' '.$user->last_name),'role'=>$user->user_type,'latest_degree'=>$degree?->degree,'completion_year'=>$degree?->end_year,'experience_months'=>$earliest===null?null:$currentMonth-$earliest,'skills'=>array_values($skills)];
        }
        return $result;
    }
}
