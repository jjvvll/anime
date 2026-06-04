import { useNavigate } from "react-router-dom";
import type { Anime } from "../types/anime";

interface Props {
  anime: Anime;
  onAddEpisode: (anime: Anime) => void;
}

export default function AnimeCard({ anime, onAddEpisode }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#111113] border border-zinc-900 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Poster */}
      <div
        className="aspect-[3/4] bg-zinc-900 relative flex items-center justify-center cursor-pointer"
        onClick={() => navigate(`/anime/${anime.id}`)}
      >
        {anime.thumbnail_url ? (
          <img
            src={anime.thumbnail_url}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl text-zinc-800">◻</span>
        )}
        {anime.genre && (
          <span className="absolute top-2 left-2 text-xs bg-black/70 text-zinc-300 px-2 py-0.5 rounded-full">
            {anime.genre}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p
          className="text-xs font-medium text-zinc-300 truncate mb-1.5 cursor-pointer hover:text-white transition-colors"
          onClick={() => navigate(`/anime/${anime.id}`)}
        >
          {anime.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-700">
            {anime.episodes_count ?? 0} ep
            {(anime.episodes_count ?? 0) !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => onAddEpisode(anime)}
            className="text-xs text-zinc-600 hover:text-white transition-colors"
          >
            + Add ep
          </button>
        </div>
      </div>
    </div>
  );
}
