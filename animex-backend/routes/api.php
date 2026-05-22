<?php

use App\Http\Controllers\Api\AnimeController;
use App\Http\Controllers\Api\AnimeVideoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EpisodeController;
use Illuminate\Support\Facades\Route;

// Guest only
Route::middleware(['web', 'guest'])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Public
Route::get('/animes',                              [AnimeController::class, 'index']);
Route::get('/animes/{anime}',                      [AnimeController::class, 'show']);
Route::get('/animes/{anime}/episodes',             [EpisodeController::class, 'index']);
Route::get('/animes/{anime}/episodes/{episode}',   [EpisodeController::class, 'show']);

// Authenticated
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',    [AuthController::class, 'user']);

    Route::post('/animes',                             [AnimeController::class, 'store']);
    Route::post('/animes/{anime}',                     [AnimeController::class, 'update']); // _method: PUT
    Route::delete('/animes/{anime}',                   [AnimeController::class, 'destroy']);

    Route::post('/animes/{anime}/episodes',            [EpisodeController::class, 'store']);
    Route::post('/animes/{anime}/episodes/{episode}',  [EpisodeController::class, 'update']); // _method: PUT
    Route::delete('/animes/{anime}/episodes/{episode}', [EpisodeController::class, 'destroy']);
});
