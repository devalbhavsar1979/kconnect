<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
final class User extends Authenticatable
{
    use HasUuids;
    protected $guarded = ['id', 'user_type', 'is_verified', 'is_active', 'password_hash'];
    protected $hidden = ['password_hash'];
    protected $authPasswordName = 'password_hash';
    protected function casts(): array { return ['is_active'=>'boolean','is_verified'=>'boolean','consent'=>'boolean','date_of_birth'=>'date:Y-m-d']; }
    public function newUniqueId(): string { return (string) \Illuminate\Support\Str::uuid(); }
}
