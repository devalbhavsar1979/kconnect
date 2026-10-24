<?php
namespace App\Services;
use App\Exceptions\ApiError;
use App\Models\User;
final class Ownership
{
    public static function enforce(User $user, string $ownerId): void
    {
        if (!hash_equals($user->id,$ownerId)) { throw new ApiError(404,'Not Found'); }
    }
}
