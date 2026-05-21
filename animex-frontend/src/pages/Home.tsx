import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animeService } from '../services/animeService'
import type { Anime, AnimePayload, EpisodePayload } from '../types/anime'
import AnimeCard from '../components/AnimeCard'
import ModalWrapper from '../components/modals/ModalWrapper'
import AnimeModal from '../components/modals/AnimeModal'
import EpisodeModal from '../components/modals/EpisodeModal'

type ModalMode = 'anime' | 'episode'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [animes, setAnimes]               = useState<Anime[]>([])
  const [showModal, setShowModal]         = useState(false)
  const [modalMode, setModalMode]         = useState<ModalMode>('anime')
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null)

  useEffect(() => {
    animeService.getAll().then((res) => setAnimes(res.data))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const openAnimeModal = () => {
    setModalMode('anime')
    setShowModal(true)
  }

  const openEpisodeModal = (anime: Anime) => {
    setSelectedAnime(anime)
    setModalMode('episode')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedAnime(null)
  }

  const handleAnimeSubmit = async (payload: AnimePayload & { thumbnail?: File }) => {
    const anime = await animeService.create(payload)
    setAnimes((prev) => [anime, ...prev])
    closeModal()
  }

  const handleEpisodeSubmit = async (payload: EpisodePayload, onProgress: (p: number) => void) => {
    if (!selectedAnime) return
    await animeService.uploadEpisode(selectedAnime.id, payload, onProgress)
    setAnimes((prev) =>
      prev.map((a) =>
        a.id === selectedAnime.id
          ? { ...a, episodes_count: (a.episodes_count ?? 0) + 1 }
          : a
      )
    )
    closeModal()
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-medium text-gray-900">AniUpload</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Hello, <span className="font-medium text-gray-900">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Anime Library</h1>
            <p className="text-sm text-gray-500 mt-0.5">{animes.length} series</p>
          </div>
          <button
            onClick={openAnimeModal}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            + New Anime
          </button>
        </div>

        {animes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-sm">No anime yet. Add your first series!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {animes.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} onAddEpisode={openEpisodeModal} />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <ModalWrapper
          title={modalMode === 'anime' ? 'New Anime Series' : `Add Episode — ${selectedAnime?.title}`}
          onClose={closeModal}
        >
          {modalMode === 'anime' ? (
            <AnimeModal onClose={closeModal} onSubmit={handleAnimeSubmit} />
          ) : selectedAnime ? (
            <EpisodeModal anime={selectedAnime} onClose={closeModal} onSubmit={handleEpisodeSubmit} />
          ) : null}
        </ModalWrapper>
      )}

    </div>
  )
}