<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Anime extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'genre',
        'thumbnail_path',
    ];

    protected $appends = ['thumbnail_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function episodes()
    {
        return $this->hasMany(Episode::class)->orderBy('season_number')->orderBy('episode_number');
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->thumbnail_path
            ? asset('storage/' . $this->thumbnail_path)
            : null;
    }
}
