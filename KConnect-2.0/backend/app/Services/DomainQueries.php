<?php
namespace App\Services;
use App\Exceptions\ApiError;
use App\Models\DomainRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
final class DomainQueries
{
    public static function record(string $table,string $id,string $message,bool $lock=false): DomainRecord
    {
        ProfileValidation::check(['id'=>$id],['id'=>'required|uuid']);
        $q=DomainRecord::table($table)->newQuery()->whereKey($id);
        if ($lock) { $q->lockForUpdate(); }
        return $q->first() ?? throw new ApiError(404,$message);
    }
    public static function page(Request $request,int $default=20,int $maximum=100): array
    {
        return array_replace(['page'=>1,'size'=>$default],ProfileValidation::check($request->query(),['page'=>'sometimes|integer|min:1','size'=>'sometimes|integer|min:1|max:'.$maximum]));
    }
    public static function paginate($q,array $page,callable $map): array
    {
        $total=(clone $q)->count();
        return ['items'=>$q->skip(((int)$page['page']-1)*(int)$page['size'])->take((int)$page['size'])->get()->map($map)->all(),'total'=>$total,'page'=>(int)$page['page'],'size'=>(int)$page['size']];
    }
    public static function search($q,array $columns,?string $value): void
    {
        if ($value===null || $value==='') { return; }
        $q->where(function($query) use($columns,$value) { foreach ($columns as $column) { $query->orWhereRaw('LOWER('.$column.') LIKE ?', [mb_strtolower('%'.$value.'%')]); } });
    }
    public static function arrayText(string $column): string
    {
        // Match PostgreSQL array_to_string(..., ',') including searches spanning items.
        if (DB::getDriverName()==='sqlite') { return "(SELECT group_concat(value, ',') FROM json_each($column))"; }
        DB::statement('SET SESSION group_concat_max_len = 16777216');
        return "(SELECT GROUP_CONCAT(j.value ORDER BY j.ord SEPARATOR ',') FROM JSON_TABLE($column, '$[*]' COLUMNS (ord FOR ORDINALITY, value LONGTEXT PATH '$')) AS j)";
    }
}
