<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', commands: __DIR__.'/../routes/console.php')
    ->withMiddleware(function (Middleware $middleware): void {
        // No session/CSRF middleware on the future bearer API. Do not silently
        // trim strings or turn empty strings into null in compatibility requests.
        $middleware->remove([
            Illuminate\Foundation\Http\Middleware\TrimStrings::class,
            Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
        ]);
        $middleware->group('web', []);
        $middleware->alias(['bearer'=>App\Http\Middleware\BearerAuth::class,'role'=>App\Http\Middleware\RequireRole::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api', 'api/*', 'internal/*', 'uploads/*') || $request->expectsJson());
        $exceptions->render(function (Throwable $error, Request $request) {
            if (!$request->is('api', 'api/*', 'internal/*', 'uploads/*')) { return null; }
            if ($error instanceof App\Exceptions\ApiError) { return response()->json(['detail'=>$error->detail],$error->status,$error->headers)->header('Cache-Control','no-store'); }
            $status = $error instanceof HttpExceptionInterface ? $error->getStatusCode() : 500;
            $detail = match ($status) { 404 => 'Not Found', 405 => 'Method Not Allowed', 401 => 'Unauthorized', default => 'Request failed' };
            $headers = $error instanceof HttpExceptionInterface ? $error->getHeaders() : [];
            return response()->json(['detail' => $detail], $status, $headers);
        });
    })->create();
if ($shared = getenv('KCONNECT_SHARED_PATH')) {
    $app->useEnvironmentPath($shared);
    $app->useStoragePath($shared.'/storage');
}
return $app;
