<?php
namespace App\Http\Middleware;
use Illuminate\Http\Request;
final class ProfileFileAuth
{
    public function handle(Request $request,\Closure $next)
    {
        // Cookie authenticates GET downloads only; JSON APIs still require bearer headers.
        if (!$request->bearerToken() && $request->cookies->has('kconnect_files')) { $request->headers->set('Authorization','Bearer '.$request->cookie('kconnect_files')); }
        if (!$request->bearerToken()) { abort(404); }
        return app(BearerAuth::class)->handle($request,$next);
    }
}
