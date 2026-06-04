import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { animeService } from "../services/animeService";
import type { Anime, Episode } from "../types/anime";
import ModalWrapper from "../modals/ModalWrapper";
import EpisodeModal from "../modals/EpisodeModal";

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleEpisodeSubmit = async (
    payload: any,
    onProgress: (p: number) => void,
  ) => {
    if (!anime) return;
    const episode = await animeService.uploadEpisode(
      anime.id,
      payload,
      onProgress,
    );
    setEpisodes((prev) =>
      [...prev, episode].sort((a, b) =>
        a.season_number !== b.season_number
          ? a.season_number - b.season_number
          : a.episode_number - b.episode_number,
      ),
    );
    setShowModal(false);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return null;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const statusStyle: Record<string, string> = {
    ready: "bg-green-950 text-green-400 border border-green-900",
    processing: "bg-yellow-950 text-yellow-400 border border-yellow-900",
    failed: "bg-red-950 text-red-400 border border-red-900",
  };

  const episodesBySeason = episodes.reduce<Record<number, Episode[]>>(
    (acc, ep) => {
      if (!acc[ep.season_number]) acc[ep.season_number] = [];
      acc[ep.season_number].push(ep);
      return acc;
    },
    {},
  );

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
            onClick={() => navigate("/")}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <span className="text-zinc-800">|</span>
          <span className="text-sm font-medium text-white">AniUpload</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">
            Hello, <span className="text-zinc-400">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-[#111113] border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-7 flex gap-5 items-start">
          <div className="w-28 h-40 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-800 flex items-center justify-center">
            {anime.thumbnail_url ? (
              <img
                src={anime.thumbnail_url}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-zinc-800">◻</span>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-1 flex-1">
            {anime.genre && (
              <span className="text-xs bg-zinc-900 text-zinc-500 px-2.5 py-1 rounded-full border border-zinc-800 w-fit">
                {anime.genre}
              </span>
            )}
            <h1 className="text-xl font-medium text-white leading-tight">
              {anime.title}
            </h1>
            {anime.description && (
              <p className="text-sm text-zinc-500 leading-relaxed max-w-lg">
                {anime.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-zinc-700">
                {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-medium px-4 py-1.5 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                + Add Episode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <main className="max-w-4xl mx-auto px-6 py-7">
        {episodes.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-zinc-700">
              No episodes yet. Upload the first one!
            </p>
          </div>
        ) : (
          <div className="space-y-7">
            {Object.entries(episodesBySeason).map(([season, eps]) => (
              <div key={season}>
                <p className="text-xs text-zinc-700 uppercase tracking-widest mb-3 pb-2 border-b border-zinc-900">
                  Season {season}
                </p>
                <div className="space-y-1.5">
                  {eps.map((ep) => (
                    <div
                      key={ep.id}
                      className="group flex items-center gap-3 p-2.5 rounded-xl border border-zinc-900 bg-[#111113] hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-14 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {ep.thumbnail_url ? (
                          <img
                            src={ep.thumbnail_url}
                            alt={ep.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-zinc-700 text-base">▶</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-zinc-700 flex-shrink-0">
                            EP {ep.episode_number}
                          </span>
                          <p className="text-sm font-medium text-zinc-300 truncate">
                            {ep.title}
                          </p>
                        </div>
                        {ep.description && (
                          <p className="text-xs text-zinc-600 line-clamp-1 mb-1">
                            {ep.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          {formatSize(ep.file_size) && (
                            <span className="text-xs text-zinc-700">
                              {formatSize(ep.file_size)}
                            </span>
                          )}
                          {formatDuration(ep.duration) && (
                            <span className="text-xs text-zinc-700">
                              {formatDuration(ep.duration)}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${statusStyle[ep.status] ?? ""}`}
                          >
                            {ep.status}
                          </span>
                        </div>
                      </div>

                      {/* Watch */}
                      <button
                        onClick={() => navigate(`/anime/${id}/watch/${ep.id}`)}
                        className="text-xs px-3 py-1.5 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors flex-shrink-0"
                      >
                        Watch
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && anime && (
        <ModalWrapper
          title={`Add Episode — ${anime.title}`}
          onClose={() => setShowModal(false)}
        >
          <EpisodeModal
            anime={anime}
            onClose={() => setShowModal(false)}
            onSubmit={handleEpisodeSubmit}
          />
        </ModalWrapper>
      )}
    </div>
  );
}
