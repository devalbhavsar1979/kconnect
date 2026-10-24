<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
final class DomainRecord extends Model
{
    use HasUuids;
    protected $guarded=[];
    public function newUniqueId(): string { return (string)\Illuminate\Support\Str::uuid(); }
    protected function casts(): array { return ['is_active'=>'boolean','travel_required'=>'boolean','travel_reimbursement'=>'boolean','delivery_modes'=>'array','tags'=>'array','target_audience'=>'array','skills_required'=>'array','fee_amount'=>'decimal:2','number_of_openings'=>'integer','file_size_bytes'=>'integer','event_date'=>'date:Y-m-d','application_deadline'=>'date:Y-m-d','uploaded_at'=>'datetime']; }
    public static function table(string $table): self
    {
        if (!in_array($table,['categories','organizations','opportunities','opportunity_attachments'],true)) { throw new \InvalidArgumentException('Unsupported domain table'); }
        $model=(new self())->setTable($table);
        if ($table==='opportunity_attachments') { $model->timestamps=false; }
        return $model;
    }
}
