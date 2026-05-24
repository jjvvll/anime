<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anime;
use App\Models\Episode;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EpisodeController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Anime $anime)
    {
        try {
            $this->authorize('update', $anime);

            $validated = $request->validate([
                'title'          => ['required', 'string', 'max:255'],
                'description'    => ['nullable', 'string'],
                'episode_number' => ['required', 'integer', 'min:1'],
                'season_number'  => ['sometimes', 'integer', 'min:1'],
                'video'          => ['required', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:512000'],
                'thumbnail'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            ]);

            $exists = $anime->episodes()
                ->where('season_number', $validated['season_number'] ?? 1)
                ->where('episode_number', $validated['episode_number'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Episode number already exists for this season.',
                ], 422);
            }

            $videoPath     = $request->file('video')->store("episodes/{$anime->id}", 'public');
            $thumbnailPath = $request->hasFile('thumbnail')
                ? $request->file('thumbnail')->store("episodes/{$anime->id}/thumbnails", 'public')
                : null;

            $episode = $anime->episodes()->create([
                'title'          => $validated['title'],
                'description'    => $validated['description'] ?? null,
                'episode_number' => $validated['episode_number'],
                'season_number'  => $validated['season_number'] ?? 1,
                'video_path'     => $videoPath,
                'thumbnail_path' => $thumbnailPath,
                'file_size'      => $request->file('video')->getSize(),
                'status'         => 'ready',
            ]);

            return response()->json([
                'message' => 'Episode uploaded successfully.',
                'episode' => $episode,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ], 500);
        }
    }

    public function update(Request $request, Anime $anime, Episode $episode)
    {
        try {
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
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ], 500);
        }
    }

    public function destroy(Anime $anime, Episode $episode)
    {
        try {
            abort_if($episode->anime_id !== $anime->id, 404);
            $this->authorize('delete', $anime);

            Storage::disk('public')->delete($episode->video_path);

            if ($episode->thumbnail_path) {
                Storage::disk('public')->delete($episode->thumbnail_path);
            }

            $episode->delete();

            return response()->json(['message' => 'Episode deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ], 500);
        }
    }

    public function index(Anime $anime)
    {
        try {
            return response()->json([
                'anime'    => $anime,
                'episodes' => $anime->episodes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ], 500);
        }
    }

    public function show(Anime $anime, Episode $episode)
    {
        try {
            abort_if($episode->anime_id !== $anime->id, 404);
            return response()->json($episode);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ], 500);
        }
    }
}
