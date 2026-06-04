import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { animeService } from "../services/animeService";
import type { Anime, AnimePayload, EpisodePayload } from "../types/anime";
import AnimeCard from "../components/AnimeCard";
import ModalWrapper from "../modals/ModalWrapper";
import AnimeModal from "../modals/AnimeModal";
import EpisodeModal from "../modals/EpisodeModal";

type ModalMode = "anime" | "episode";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("anime");
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  useEffect(() => {
    animeService.getAll().then((res) => setAnimes(res.data));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const openAnimeModal = () => {
    setModalMode("anime");
    setShowModal(true);
  };
  const openEpisodeModal = (anime: Anime) => {
    setSelectedAnime(anime);
    setModalMode("episode");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedAnime(null);
  };

  const handleAnimeSubmit = async (
    payload: AnimePayload & { thumbnail?: File },
  ) => {
    const anime = await animeService.create(payload);
    setAnimes((prev) => [anime, ...prev]);
    closeModal();
  };

  const handleEpisodeSubmit = async (
    payload: EpisodePayload,
    onProgress: (p: number) => void,
  ) => {
    if (!selectedAnime) return;
    await animeService.uploadEpisode(selectedAnime.id, payload, onProgress);
    setAnimes((prev) =>
      prev.map((a) =>
        a.id === selectedAnime.id
          ? { ...a, episodes_count: (a.episodes_count ?? 0) + 1 }
          : a,
      ),
    );
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Navbar */}
      <nav className="bg-[#111113] border-b border-zinc-800/60 px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-white">AniUpload</span>
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

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-lg font-medium text-white">Anime Library</h1>
            <p className="text-xs text-zinc-700 mt-1">{animes.length} series</p>
          </div>
          <button
            onClick={openAnimeModal}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 bg-white text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <span className="text-base leading-none">+</span> New Anime
          </button>
        </div>

        {/* Grid */}
        {animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-4xl text-zinc-900">◻</span>
            <p className="text-sm text-zinc-700">
              No anime yet. Add your first series!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {animes.map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onAddEpisode={openEpisodeModal}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ModalWrapper
          title={
            modalMode === "anime"
              ? "New Anime Series"
              : `Add Episode — ${selectedAnime?.title}`
          }
          onClose={closeModal}
        >
          {modalMode === "anime" ? (
            <AnimeModal onClose={closeModal} onSubmit={handleAnimeSubmit} />
          ) : selectedAnime ? (
            <EpisodeModal
              anime={selectedAnime}
              onClose={closeModal}
              onSubmit={handleEpisodeSubmit}
            />
          ) : null}
        </ModalWrapper>
      )}
    </div>
  );
}
