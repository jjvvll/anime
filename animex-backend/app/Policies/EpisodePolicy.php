<?php

namespace App\Policies;

use App\Models\Episode;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EpisodePolicy
{
    public function update(User $user, Episode $episode): bool
    {
        return $user->id === $episode->anime->user_id;
    }

    public function delete(User $user, Episode $episode): bool
    {
        return $user->id === $episode->anime->user_id;
    }
}
