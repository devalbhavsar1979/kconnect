<?php
namespace App\Http\Controllers;
use App\Exceptions\ApiError;
use App\Models\User;
use App\Services\Tokens;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Database\UniqueConstraintViolationException;
final class AuthController
{
    private function validate(Request $request, array $rules): array
    {
        $validator=Validator::make($request->all(),$rules);
        if ($validator->fails()) {
            $errors=[];
            foreach ($validator->errors()->messages() as $field=>$messages) { foreach ($messages as $message) { $errors[]=['type'=>'value_error','loc'=>['body',$field],'msg'=>$message]; } }
            throw new ApiError(422,$errors);
        }
        return $validator->validated();
    }
    private function json(array $data, int $status=200) { return response()->json($data,$status)->header('Cache-Control','no-store'); }
    public function register(Request $request, Tokens $tokens)
    {
        $data=$this->validate($request,['first_name'=>'required|string|max:150','last_name'=>'required|string|max:150','email'=>'required|string|max:255|email:rfc','password'=>'required|string','confirm_password'=>'required|string','mobile_number'=>'nullable|string|max:20','user_type'=>'sometimes|string|in:SUPER_ADMIN,ADMIN,SME,PROFESSIONAL_SERVICE_PROVIDER,VENDOR,TRAINER,FREELANCER,CONSULTANT','date_of_birth'=>'nullable|date_format:Y-m-d']);
        if ($data['password']!==$data['confirm_password']) { throw new ApiError(422,'Passwords do not match'); }
        if (mb_strlen($data['password'])<8) { throw new ApiError(422,'Password must be at least 8 characters'); }
        if (in_array($data['user_type']??'FREELANCER',['ADMIN','SUPER_ADMIN'],true)) { throw new ApiError(403,'Privileged roles cannot be registered publicly'); }
        if (User::where('email',$data['email'])->exists()) { throw new ApiError(409,'An account with this email already exists'); }
        $file=$request->file('cv'); $path=null;
        if ($file) {
            if (!$file->isValid()) { throw new ApiError(422,'CV upload failed'); }
            $ext=strtolower($file->getClientOriginalExtension());
            if (!in_array($ext,['pdf','doc','docx'],true)) { throw new ApiError(422,'CV must be a PDF, DOC, or DOCX file'); }
            if ($file->getSize()>5*1024*1024) { throw new ApiError(422,'CV file must be smaller than 5 MB'); }
        }
        $id=(string)Str::uuid();
        try {
            $result=DB::transaction(function () use ($data,$file,$id,&$path,$tokens) {
                $user=new User();
                $user->forceFill(['id'=>$id,'first_name'=>trim($data['first_name']),'last_name'=>trim($data['last_name']),'email'=>$data['email'],'mobile_number'=>($data['mobile_number']??null)?:null,'user_type'=>$data['user_type']??'FREELANCER','date_of_birth'=>($data['date_of_birth']??null)?:null,'password_hash'=>password_hash(substr($data['password'],0,72),PASSWORD_BCRYPT,['cost'=>12])]);
                if ($file && $file->getSize()>0) {
                    $relative='uploads/cvs/'.$id.'.'.strtolower($file->getClientOriginalExtension());
                    $path=storage_path('app/'.$relative);
                    $file->move(dirname($path),basename($path));
                    $user->cv_file_path=$relative;
                }
                $user->save(); $user->refresh();
                return $tokens->issue($user);
            });
        } catch (\Throwable $e) {
            if ($path && is_file($path)) { unlink($path); }
            if ($e instanceof UniqueConstraintViolationException) { throw new ApiError(409,'An account with this email already exists'); }
            throw $e;
        }
        return $this->json($result,201);
    }
    public function login(Request $request, Tokens $tokens)
    {
        $data=$this->validate($request,['email'=>'required|string|email:rfc','password'=>'required|string']);
        $user=User::where('email',$data['email'])->first();
        $hash=$user?->password_hash ?? '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
        $valid=password_verify(substr($data['password'],0,72),$hash);
        if (!$user || !$valid) { throw new ApiError(401,'Invalid email or password'); }
        if (!$user->is_active) { throw new ApiError(403,'Account is disabled'); }
        return $this->json($tokens->issue($user));
    }
    public function refresh(Request $request, Tokens $tokens)
    {
        $data=$this->validate($request,['refresh_token'=>'required|string']);
        try { $payload=$tokens->decode($data['refresh_token'],'refresh'); }
        catch (\UnexpectedValueException|\DomainException $e) { throw new ApiError(401,'Invalid or expired refresh token'); }
        return DB::transaction(function () use ($data,$payload,$tokens) {
            $stored=DB::table('refresh_tokens')->where('user_id',$payload['sub'])->where('token_hash',hash('sha256',$data['refresh_token']))->where('revoked',false)->where('expires_at','>',now())->lockForUpdate()->first();
            $user=User::whereKey($payload['sub'])->where('is_active',true)->first();
            if (!$stored || !$user) { throw new ApiError(401,'Invalid or expired refresh token'); }
            return $this->json(['access_token'=>$tokens->create($user,'access'),'token_type'=>'bearer']);
        });
    }
    public function logout(Request $request, Tokens $tokens)
    {
        $data=$this->validate($request,['refresh_token'=>'required|string']);
        try { $payload=$tokens->decode($data['refresh_token'],'refresh'); }
        catch (\UnexpectedValueException|\DomainException $e) { return response('',204)->header('Cache-Control','no-store'); }
        DB::table('refresh_tokens')->where('user_id',$payload['sub'])->where('token_hash',hash('sha256',$data['refresh_token']))->update(['revoked'=>true]);
        return response('',204)->header('Cache-Control','no-store');
    }
    public function me(Request $request) { return $this->json($request->user()->toArray()); }
}
