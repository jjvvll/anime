<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Episode extends Model
{
    protected $fillable = [
        'anime_id',
        'title',
        'description',
        'episode_number',
        'season_number',
        'video_path',
        'thumbnail_path',
        'duration',
        'file_size',
        'status',
    ];

    protected $appends = ['video_url', 'thumbnail_url'];

    public function anime()
    {
        return $this->belongsTo(Anime::class);
    }

    public function getVideoUrlAttribute(): string
    {
        return asset('storage/' . $this->video_path);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path
            ? asset('storage/' . $this->thumbnail_path)
            : null;
    }
}
