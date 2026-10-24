<?php
namespace App\Http\Middleware;
use App\Exceptions\ApiError;
use Illuminate\Http\Request;
final class RequireRole
{
    public function handle(Request $request, \Closure $next, string ...$roles)
    {
        if (!$request->user() || !in_array($request->user()->user_type,$roles,true)) {
            throw new ApiError(403,$roles===['SUPER_ADMIN'] ? 'Super admin access required' : 'You do not have permission to perform this action');
        }
        return $next($request);
    }
}
