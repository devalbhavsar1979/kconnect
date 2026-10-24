<?php
namespace App\Http\Middleware;
use App\Exceptions\ApiError;
use App\Models\User;
use App\Services\Tokens;
use Illuminate\Http\Request;
final class BearerAuth
{
    public function handle(Request $request, \Closure $next)
    {
        if (!$request->bearerToken()) { throw new ApiError(403,'Not authenticated'); }
        try { $data=app(Tokens::class)->decode($request->bearerToken(),'access'); }
        catch (\UnexpectedValueException|\DomainException $e) { throw new ApiError(401,'Could not validate credentials',['WWW-Authenticate'=>'Bearer']); }
        $user=User::whereKey($data['sub'])->where('is_active',true)->first();
        if (!$user) { throw new ApiError(401,'Could not validate credentials',['WWW-Authenticate'=>'Bearer']); }
        $request->setUserResolver(fn ()=>$user);
        $response=$next($request);
        $response->headers->set('Cache-Control','no-store');
        return $response;
    }
}
