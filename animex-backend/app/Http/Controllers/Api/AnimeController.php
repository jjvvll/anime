<?php

namespace App\Http\Controllers\Api;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Anime;
use App\Models\Episode;
use Illuminate\Support\Facades\Storage;

class AnimeController extends Controller
{

    use AuthorizesRequests;

    public function index(Anime $anime)
    {
        $animes = Anime::with('user')
            ->withCount('episodes')   // adds episodes_count to each anime
            ->latest()
            ->paginate(12);

        return response()->json($animes);
    }

    public function show(Anime $anime, Episode $episode)
    {
        abort_if($episode->anime_id !== $anime->id, 404);
        return response()->json($episode);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title'       => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'genre'       => ['nullable', 'string', 'max:100'],
                'thumbnail'   => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            ]);

            $thumbnailPath = $request->hasFile('thumbnail')
                ? $request->file('thumbnail')->store('anime-thumbnails', 'public')
                : null;

            $anime = Anime::create([
                'user_id'        => $request->user()->id,
                'title'          => $validated['title'],
                'description'    => $validated['description'] ?? null,
                'genre'          => $validated['genre'] ?? null,
                'thumbnail_path' => $thumbnailPath,
            ]);

            return response()->json([
                'message' => 'Anime created successfully.',
                'anime'   => $anime,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }
    public function update(Request $request, Anime $anime, Episode $episode)
    {
        abort_if($episode->anime_id !== $anime->id, 404);
        $this->authorize('update', $anime);

        $validated = $request->validate([
            'title'          => ['sometimes', 'string', 'max:255'],
            'description'    => ['nullable', 'string'],
            'episode_number' => ['sometimes', 'integer', 'min:1'],
            'season_number'  => ['sometimes', 'integer', 'min:1'],
            'thumbnail'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('thumbnail')) {
            if ($episode->thumbnail_path) {
                Storage::disk('public')->delete($episode->thumbnail_path);
            }
            $validated['thumbnail_path'] = $request->file('thumbnail')
                ->store("episodes/{$anime->id}/thumbnails", 'public');
            unset($validated['thumbnail']);
        }

        $episode->update($validated);

        return response()->json([
            'message' => 'Episode updated successfully.',
            'episode' => $episode->fresh(),
        ]);
    }

    public function destroy(Anime $anime, Episode $episode)
    {
        abort_if($episode->anime_id !== $anime->id, 404);
        $this->authorize('update', $anime);

        Storage::disk('public')->delete($episode->video_path);
        if ($episode->thumbnail_path) {
            Storage::disk('public')->delete($episode->thumbnail_path);
        }

        $episode->delete();

        return response()->json(['message' => 'Episode deleted successfully.']);
    }
}
