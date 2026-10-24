<?php
namespace App\Services;
use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
final class Tokens
{
    private function key(): string
    {
        $key = (string) config('tokens.secret');
        if (strlen($key) < 32) { throw new \RuntimeException('JWT secret is not configured'); }
        return $key;
    }
    public function create(User $user, string $type): string
    {
        $payload = ['sub'=>$user->id,'type'=>$type,'exp'=>time()+($type==='access' ? config('tokens.access_minutes')*60 : config('tokens.refresh_days')*86400)];
        if ($type==='access') { $payload['user_type']=$user->user_type; }
        else { $payload['jti']=(string) Str::uuid(); }
        return JWT::encode($payload, $this->key(), 'HS256');
    }
    public function decode(string $token, string $type): array
    {
        $data = (array) JWT::decode($token, new Key($this->key(), 'HS256'));
        if (($data['type']??null)!==$type || !is_string($data['sub']??null) || !Str::isUuid($data['sub']) || !is_int($data['exp']??null)) { throw new \UnexpectedValueException('Invalid claims'); }
        return $data;
    }
    public function issue(User $user): array
    {
        $refresh=$this->create($user,'refresh');
        DB::table('refresh_tokens')->insert(['id'=>(string)Str::uuid(),'user_id'=>$user->id,'token_hash'=>hash('sha256',$refresh),'expires_at'=>gmdate('Y-m-d H:i:s', $this->decode($refresh,'refresh')['exp']),'revoked'=>false,'created_at'=>now()]);
        return ['access_token'=>$this->create($user,'access'),'refresh_token'=>$refresh,'token_type'=>'bearer'];
    }
}
