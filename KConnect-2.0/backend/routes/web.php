<?php

use App\Http\Controllers\FoundationController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [FoundationController::class, 'health']);
Route::get('/internal/readiness', [FoundationController::class, 'readiness']);
Route::prefix('api/v1')->middleware(App\Http\Middleware\ProfileFileSession::class)->group(function () {
    require __DIR__.'/domain.php';
    foreach (['register','login','refresh','logout'] as $action) { Route::post('auth/'.$action,[App\Http\Controllers\AuthController::class,$action]); }
    foreach (['auth/me','users/me','users/me/profile'] as $path) { Route::get($path,[App\Http\Controllers\AuthController::class,'me'])->middleware('bearer'); }
    Route::prefix('users/me')->middleware('bearer')->group(function () {
        $profile=App\Http\Controllers\ProfileController::class;
        $uploads=App\Http\Controllers\ProfileUploadController::class;
        Route::put('profile',[$profile,'updateProfile']);
        Route::get('completion',[$profile,'completion']);
        Route::post('profile/photo',[$uploads,'photo']);
        foreach (['academic','experience'] as $module) {
            Route::get($module,[$profile,'index'])->defaults('module',$module);
            Route::post($module,[$profile,'create'])->defaults('module',$module);
            Route::put($module.'/{entry_id}',[$profile,'update'])->defaults('module',$module);
            Route::delete($module.'/{entry_id}',[$profile,'delete'])->defaults('module',$module);
        }
        foreach (['expertise','preferences','service-delivery'] as $module) {
            Route::get($module,[$profile,'singleton'])->defaults('module',$module);
            Route::put($module,[$profile,'upsert'])->defaults('module',$module);
        }
        Route::get('achievements',[$uploads,'index']); Route::post('achievements',[$uploads,'create']);
        Route::put('achievements/{entry_id}',[$uploads,'update']); Route::delete('achievements/{entry_id}',[$uploads,'delete']);
    });
});
Route::get('/uploads/{path}',[App\Http\Controllers\ProfileUploadController::class,'download'])->where('path','.*')->middleware(App\Http\Middleware\ProfileFileAuth::class);
Route::any('/api/{path?}', fn () => response()->json(['detail' => 'Not Found'], 404))->where('path', '.*');
Route::get('/{path?}', [FoundationController::class, 'frontend'])->where('path', '.*');
