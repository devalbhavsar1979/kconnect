<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class FoundationController
{
    public function health()
    {
        return response()->json(['status' => 'healthy'])->header('X-KConnect-Release', $this->release())->header('Cache-Control', 'no-store');
    }

    public function readiness(Request $request)
    {
        $token = config('deployment.readiness_token');
        if (!$token || !hash_equals($token, (string) $request->header('X-Readiness-Token'))) {
            return response()->json(['detail' => 'Unauthorized'], 401)->header('Cache-Control', 'no-store');
        }
        try {
            DB::select('SELECT 1');
            foreach (config('deployment.required_tables') as $table) {
                if (!Schema::hasTable($table)) { throw new \RuntimeException('Schema not ready'); }
            }
            if (!is_writable(storage_path()) || !is_file(resource_path('spa/index.html'))) {
                throw new \RuntimeException('Storage or frontend not ready');
            }
        } catch (\Throwable) {
            return response()->json(['status' => 'not_ready'], 503)->header('Cache-Control', 'no-store');
        }
        return response()->json(['status' => 'ready', 'release' => $this->release()])->header('Cache-Control', 'no-store');
    }

    public function frontend(Request $request, string $path = '')
    {
        if (preg_match('~(^|/)(?:\.|uploads(?:/|$)|internal(?:/|$))~', $path) || str_contains($path, '\\') || str_contains($path, '..')) { abort(404); }
        $base = resource_path('spa');
        $file = realpath($base.'/'.$path);
        $root = realpath($base);
        if ($path !== '' && $file && $root && str_starts_with($file, $root.DIRECTORY_SEPARATOR) && is_file($file)) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            $types = ['js' => 'application/javascript', 'css' => 'text/css', 'json' => 'application/json', 'webmanifest' => 'application/manifest+json', 'svg' => 'image/svg+xml', 'png' => 'image/png', 'ico' => 'image/x-icon', 'txt' => 'text/plain', 'woff2' => 'font/woff2'];
            if (!isset($types[$ext])) { abort(404); }
            return response()->file($file, ['Content-Type' => $types[$ext], 'Cache-Control' => 'no-cache']);
        }
        if (str_contains(basename($path), '.') || str_starts_with($path, 'assets/')) { abort(404); }
        if (!is_file($base.'/index.html')) { return response('Frontend build unavailable', 503)->header('Cache-Control', 'no-store'); }
        return response()->file($base.'/index.html', ['Content-Type' => 'text/html', 'Cache-Control' => 'no-cache']);
    }

    private function release(): string
    {
        $path = base_path('release-id');
        return is_file($path) ? trim(file_get_contents($path)) : 'development';
    }
}
