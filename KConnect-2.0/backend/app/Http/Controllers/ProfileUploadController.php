<?php
namespace App\Http\Controllers;
use App\Exceptions\ApiError;
use App\Models\ProfileRecord;
use App\Models\User;
use App\Services\ProfileFiles;
use App\Services\ProfileValidation as V;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
final class ProfileUploadController
{
    public function photo(Request $request,ProfileFiles $files)
    {
        V::check($request->all(),['photo'=>'required|file']); $new=null; $old=null;
        try {
            $user=DB::transaction(function() use($request,$files,&$new,&$old) {
                $user=User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
                $old=$user->profile_photo_path;
                [$new]=$files->store($request->file('photo'),'photos',$user->id,$user->id);
                $user->profile_photo_path=$new; $user->save(); return $user->refresh();
            });
        } catch (\Throwable $e) { $files->remove($new); throw $e; }
        $files->remove($old); return response()->json($user);
    }
    private function query(Request $r) { return ProfileRecord::forModule('achievements')->newQuery()->where('user_id',$r->user()->id); }
    private function record(Request $r,string $id): ProfileRecord
    {
        if (!Str::isUuid($id)) { V::fail('entry_id','Input should be a valid UUID'); }
        return $this->query($r)->whereKey($id)->first() ?? throw new ApiError(404,'Achievement not found');
    }
    public function index(Request $r) { return response()->json($this->query($r)->orderByDesc('created_at')->get()); }
    public function create(Request $r,ProfileFiles $files) { return $this->save($r,$files,null); }
    public function update(Request $r,ProfileFiles $files,string $entry_id) { return $this->save($r,$files,$entry_id); }
    private function save(Request $r,ProfileFiles $files,?string $id)
    {
        $data=V::check($r->all(),['title'=>($id?'sometimes|':'required|').'string|max:200','description'=>($id?'sometimes|':'required|').'string','file'=>'sometimes|nullable|file','clear_file'=>'sometimes|nullable|string']);
        foreach (['title','description'] as $field) { if (array_key_exists($field,$data)) { $data[$field]=trim($data[$field]); if ($data[$field]==='') { throw new ApiError(422,ucfirst($field).' cannot be blank'); } } }
        if ($id && str_contains((string)$r->header('Content-Type'),'multipart/form-data') && !$r->all()) { throw new ApiError(422,'Multipart upload could not be parsed; check hosting upload limits'); }
        $old=null; $new=null;
        try {
            $entry=DB::transaction(function() use($r,$data,$id,$files,&$old,&$new) {
                User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
                $entry=$id?$this->record($r,$id):ProfileRecord::forModule('achievements');
                if (!$id) { $entry->id=(string)Str::uuid(); $entry->user_id=$r->user()->id; }
                foreach (['title','description'] as $field) { if (array_key_exists($field,$data)) { $entry->$field=$data[$field]; } }
                if ($r->file('file')) {
                    $old=$entry->file_path;
                    [$new,$name]=$files->store($r->file('file'),'achievements',$r->user()->id,$entry->id);
                    $entry->file_path=$new; $entry->file_name=$name;
                } elseif (($data['clear_file']??null)==='true') { $old=$entry->file_path; $entry->file_path=null; $entry->file_name=null; }
                $entry->save(); return $entry->refresh();
            });
        } catch (\Throwable $e) { $files->remove($new); throw $e; }
        $files->remove($old); return response()->json($entry,$id?200:201);
    }
    public function delete(Request $r,ProfileFiles $files,string $entry_id)
    {
        $old=DB::transaction(function() use($r,$entry_id) {
            User::whereKey($r->user()->id)->lockForUpdate()->firstOrFail();
            $entry=$this->record($r,$entry_id); $path=$entry->file_path; $entry->delete(); return $path;
        });
        $files->remove($old); return response('',204);
    }
    public function download(Request $r,ProfileFiles $files,string $path)
    {
        $relative='uploads/'.$path; $user=$r->user(); $name=null; $photo=false;
        if ($relative===$user->profile_photo_path) { $photo=true; }
        elseif ($relative===$user->cv_file_path) { $name=basename($relative); }
        elseif (str_starts_with($relative,'uploads/opportunities/') && $user->user_type==='SUPER_ADMIN') {
            $att=DB::table('opportunity_attachments')->where('file_path',$relative)->first();
            if (!$att) { throw new ApiError(404,'Not Found'); }
            $name=$att->file_name;
        }
        else { $entry=$this->query($r)->where('file_path',$relative)->first(); if (!$entry) { throw new ApiError(404,'Not Found'); } $name=$entry->file_name; }
        $file=$files->path($relative); if (!$file) { throw new ApiError(404,'Not Found'); }
        $mime=(new \finfo(FILEINFO_MIME_TYPE))->file($file);
        $safe=['image/png','image/jpeg','application/pdf'];
        $headers=['Cache-Control'=>'private, no-store','X-Content-Type-Options'=>'nosniff','Content-Security-Policy'=>"sandbox; default-src 'none'",'Content-Type'=>in_array($mime,$safe,true)?$mime:'application/octet-stream'];
        if ($photo || in_array($mime,$safe,true)) { return response()->file($file,$headers); }
        return response()->download($file,$name??basename($file),$headers);
    }
}
