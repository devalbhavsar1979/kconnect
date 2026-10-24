<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
final class ProfileRecord extends Model
{
    use HasUuids;
    protected $guarded=[];
    public function newUniqueId(): string { return (string)\Illuminate\Support\Str::uuid(); }
    protected function casts(): array
    {
        return array_merge(array_fill_keys(array_keys(config('profiles.service-delivery.defaults',[])),'boolean'),
          ['is_current'=>'boolean','willing_to_travel'=>'boolean','travel_reimbursement'=>'boolean','skills'=>'array','audience_levels'=>'array','delivery_modes'=>'array','geographic_preference'=>'array','preferred_audience'=>'array','services'=>'array','training_topics'=>'array','start_year'=>'integer','start_month'=>'integer','end_year'=>'integer','end_month'=>'integer']);
    }
    public static function forModule(string $module): self
    {
        $table=config('profiles.'.$module.'.table');
        if (!$table) { abort(404); }
        return (new self())->setTable($table);
    }
}
