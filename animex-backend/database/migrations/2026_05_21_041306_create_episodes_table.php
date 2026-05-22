<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained()->cascadeOnDelete(); // ← belongs to anime now
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('episode_number');
            $table->unsignedInteger('season_number')->default(1);
            $table->string('video_path');                 // ← video lives here now
            $table->string('thumbnail_path')->nullable();
            $table->unsignedInteger('duration')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->enum('status', ['processing', 'ready', 'failed'])->default('processing');
            $table->timestamps();

            $table->unique(['anime_id', 'season_number', 'episode_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
