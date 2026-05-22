<?php

namespace App\Providers;

use App\Models\Anime;
use App\Policies\AnimePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Anime::class, AnimePolicy::class);

        Password::defaults(function () {
            return Password::min(8);
        });
    }
}
