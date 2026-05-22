<?php

namespace App\Policies;

use App\Models\Anime;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class AnimePolicy
{
    public function update(User $user, Anime $anime): bool
    {
        return $user->id === $anime->user_id;
    }

    public function delete(User $user, Anime $anime): bool
    {
        return $user->id === $anime->user_id;
    }
}
