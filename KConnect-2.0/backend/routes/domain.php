<?php
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AdministrationController as Admin;
use App\Http\Controllers\OpportunityController as Opportunities;
Route::middleware('bearer')->group(function() {
    Route::post('opportunities/{opportunity_id}/response',[Opportunities::class,'respond']);
    Route::get('opportunities/{opportunity_id}/attachments/{attachment_id}',[Opportunities::class,'download']);
    Route::get('opportunities',[Opportunities::class,'index']);
    Route::get('opportunities/{opportunity_id}',[Opportunities::class,'show']);
    Route::get('dashboard',fn(Request $r)=>response()->json(['message'=>'Dashboard coming soon','user_id'=>$r->user()->id,'user_type'=>$r->user()->user_type]));
    Route::get('users',fn()=>response()->json([]))->middleware('role:ADMIN');
    Route::get('organizations',fn()=>response()->json(['message'=>'Organization endpoints coming soon','items'=>[]]));
    Route::post('organizations',fn()=>response()->json(['message'=>'Organization creation coming soon'],201))->middleware('role:VENDOR,ADMIN');
    Route::get('applications',[Opportunities::class,'myApplications']);
    Route::post('applications',fn()=>response()->json(['message'=>'Application submission coming soon'],201));
    Route::prefix('admin')->middleware('role:SUPER_ADMIN')->group(function() {
        Route::get('dashboard',[Admin::class,'dashboard']);
        Route::get('applications',[Opportunities::class,'applications']);
        Route::get('applicants/{user_id}',[Admin::class,'applicantProfile']);
        Route::get('users',[Admin::class,'users']); Route::get('users/{user_id}',[Admin::class,'getUser']); Route::patch('users/{user_id}',[Admin::class,'updateUser']);
        Route::get('organisations',[Admin::class,'organizations']); Route::post('organisations',[Admin::class,'saveOrganization']);
        Route::get('organisations/{org_id}',[Admin::class,'getOrganization']); Route::put('organisations/{org_id}',[Admin::class,'saveOrganization']); Route::delete('organisations/{org_id}',[Admin::class,'deleteOrganization']);
        Route::get('categories',[Admin::class,'categories']); Route::post('categories',[Admin::class,'saveCategory']); Route::put('categories/{cat_id}',[Admin::class,'saveCategory']); Route::delete('categories/{cat_id}',[Admin::class,'deleteCategory']);
        Route::post('opportunities/{opportunity_id}/response',[Opportunities::class,'respond']);
    Route::get('opportunities/{opportunity_id}/attachments/{attachment_id}',[Opportunities::class,'download']);
    Route::get('opportunities',[Opportunities::class,'adminIndex']); Route::post('opportunities',[Opportunities::class,'save']);
        Route::get('opportunities/{opp_id}',[Opportunities::class,'adminShow']); Route::put('opportunities/{opp_id}',[Opportunities::class,'save']); Route::delete('opportunities/{opp_id}',[Opportunities::class,'delete']);
        Route::post('opportunities/{opp_id}/publish',[Opportunities::class,'publish']); Route::post('opportunities/{opp_id}/archive',[Opportunities::class,'archive']);
        Route::post('opportunities/{opp_id}/attachments',[Opportunities::class,'upload']); Route::delete('opportunities/{opp_id}/attachments/{attachment_id}',[Opportunities::class,'deleteAttachment']);
    });
});
