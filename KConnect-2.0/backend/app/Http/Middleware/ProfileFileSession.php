<?php
namespace App\Http\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Cookie;
final class ProfileFileSession
{
    public function handle(Request $request,\Closure $next)
    {
        $response=$next($request);
        if ($request->is('api/v1/auth/logout')) { $response->headers->clearCookie('kconnect_files','/uploads'); return $response; }
        if ($response->getStatusCode()>=200 && $response->getStatusCode()<300) {
            $data=$response instanceof \Illuminate\Http\JsonResponse?$response->getData(true):[];
            $token=$data['access_token']??($request->user()?$request->bearerToken():null);
            if ($token) { $response->headers->setCookie(new Cookie('kconnect_files',$token,time()+config('tokens.access_minutes')*60,'/uploads',null,$request->isSecure(),true,false,'strict')); }
        }
        return $response;
    }
}
