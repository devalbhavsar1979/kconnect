<?php
namespace App\Services;
use App\Exceptions\ApiError;
use Illuminate\Http\UploadedFile;
final class ProfileFiles
{
    public function store(UploadedFile $file,string $kind,string $owner,string $id): array
    {
        if (!$file->isValid()) { throw new ApiError(422,'File upload failed'); }
        $limit=$kind==='photos'?2:10;
        if ($file->getSize()>$limit*1024*1024) { throw new ApiError(422,($kind==='photos'?'Photo':'File').' must be smaller than '.$limit.' MB'); }
        $name=basename(str_replace('\\','/',$file->getClientOriginalName()));
        $name=preg_replace('/[\x00-\x1f\x7f]/u','',$name) ?: 'file';
        $name=mb_substr($name,0,200);
        $ext=strtolower(pathinfo($name,PATHINFO_EXTENSION));
        if ($kind==='photos') {
            $mime=$file->getMimeType();
            if (!in_array($mime,['image/jpeg','image/png'],true) || @getimagesize($file->getPathname())===false) { throw new ApiError(422,'Photo must be a JPEG or PNG image'); }
            $ext=$mime==='image/jpeg'?'jpg':'png';
            $relative='uploads/photos/'.$owner.'_'.bin2hex(random_bytes(8)).'.'.$ext;
        } else {
            if (!in_array($ext,['pdf','jpg','jpeg','png','docx'],true) && !in_array($file->getClientMimeType(),['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],true)) { throw new ApiError(422,'File must be PDF, JPG, PNG, or DOCX'); }
            $relative='uploads/achievements/'.$owner.'/'.$id.'_'.bin2hex(random_bytes(8)).'_'.$name;
        }
        $path=storage_path('app/'.$relative);
        try { $file->move(dirname($path),basename($path)); }
        catch (\Throwable $e) { if (is_file($path)) { @unlink($path); } throw $e; }
        return [$relative,$name];
    }
    public function path(string $relative): ?string
    {
        if (!str_starts_with($relative,'uploads/') || str_contains($relative,'..') || str_contains($relative,'\\') || str_contains($relative,"\0")) { return null; }
        $root=realpath(storage_path('app/uploads')); $file=realpath(storage_path('app/'.$relative));
        return $root && $file && str_starts_with($file,$root.DIRECTORY_SEPARATOR) && is_file($file) ? $file : null;
    }
    public function remove(?string $relative): void
    {
        if ($relative && ($path=$this->path($relative)) && !@unlink($path)) { \Illuminate\Support\Facades\Log::warning('Profile file cleanup failed', ['path_hash'=>hash('sha256',$relative)]); }
    }
}
