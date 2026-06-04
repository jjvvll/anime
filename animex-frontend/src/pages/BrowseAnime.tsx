import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { animeService } from "../services/animeService";
import type { Anime, Episode } from "../types/anime";

export default function BrowseAnime() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    animeService
      .getEpisodes(Number(id))
      .then(({ anime, episodes }) => {
        setAnime(anime);
        setEpisodes(episodes);
      })
      .catch(() => setError("Failed to load anime."))
      .finally(() => setLoading(false));
  }, [id]);

  const episodesBySeason = episodes.reduce<Record<number, Episode[]>>(
    (acc, ep) => {
      if (!acc[ep.season_number]) acc[ep.season_number] = [];
      acc[ep.season_number].push(ep);
      return acc;
    },
    {},
  );

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusStyle: Record<string, string> = {
    ready: "bg-green-950 text-green-400 border border-green-900",
    processing: "bg-yellow-950 text-yellow-400 border border-yellow-900",
    failed: "bg-red-950 text-red-400 border border-red-900",
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <span className="text-sm text-zinc-600">Loading...</span>
      </div>
    );

  if (error || !anime)
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <span className="text-sm text-red-500">
          {error ?? "Anime not found."}
        </span>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navbar */}
      <nav className="bg-[#111113] border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/browse")}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            ← Browse
          </button>
          <span className="text-zinc-700">|</span>
          <span className="text-sm font-medium text-white">AniUpload</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="text-sm px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <div className="bg-[#111113] border-b border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-6 py-8 flex gap-6 items-start">
          {/* Poster */}
          <div className="w-28 h-40 sm:w-32 sm:h-44 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800">
            {anime.thumbnail_url ? (
              <img
                src={anime.thumbnail_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700 text-3xl">
                ◻
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-2.5 pt-1 flex-1">
            {anime.genre && (
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-700 w-fit">
                {anime.genre}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-medium text-white leading-tight">
              {anime.title}
            </h1>
            {anime.description && (
              <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
                {anime.description}
              </p>
            )}
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-600">
                {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
              </span>
            </div>
            {episodes.length > 0 && (
              <button
                onClick={() =>
                  navigate(`/browse/${id}/watch/${episodes[0].id}`)
                }
                className="mt-1 flex items-center gap-2 text-sm font-medium px-5 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors w-fit"
              >
                ▶ Play from start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Episodes */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {episodes.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-zinc-700">No episodes available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(episodesBySeason).map(([season, eps]) => (
              <div key={season}>
                <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-900">
                  Season {season}
                </p>
                <div className="space-y-1.5">
                  {eps.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => navigate(`/browse/${id}/watch/${ep.id}`)}
                      className="group flex items-center gap-4 p-2.5 rounded-xl border border-zinc-900 bg-[#111113] cursor-pointer hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-14 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                        {ep.thumbnail_url ? (
                          <img
                            src={ep.thumbnail_url}
                            alt={ep.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-zinc-700 text-lg">▶</span>
                        )}
                        <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <span className="text-white text-base opacity-0 group-hover:opacity-100 transition-opacity">
                            ▶
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-zinc-600 flex-shrink-0">
                            EP {ep.episode_number}
                          </span>
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {ep.title}
                          </p>
                        </div>
                        {ep.description && (
                          <p className="text-xs text-zinc-600 line-clamp-1 mb-1">
                            {ep.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-700">
                            {formatSize(ep.file_size)}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[ep.status] ?? ""}`}
                          >
                            {ep.status}
                          </span>
                        </div>
                      </div>

                      <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors text-sm flex-shrink-0">
                        ›
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
