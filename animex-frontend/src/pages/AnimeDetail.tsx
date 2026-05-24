import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animeService } from '../services/animeService'
import type { Anime, Episode } from '../types/anime'
import ModalWrapper from '../modals/ModalWrapper'
import EpisodeModal from '../modals/EpisodeModal'

export default function AnimeDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [anime, setAnime]       = useState<Anime | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    animeService.getEpisodes(Number(id))
      .then(({ anime, episodes }) => {
        setAnime(anime)
        setEpisodes(episodes)
      })
      .catch(() => setError('Failed to load anime.'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleEpisodeSubmit = async (payload: any, onProgress: (p: number) => void) => {
    if (!anime) return
    const episode = await animeService.uploadEpisode(anime.id, payload, onProgress)
    setEpisodes((prev) => [...prev, episode].sort((a, b) =>
      a.season_number !== b.season_number
        ? a.season_number - b.season_number
        : a.episode_number - b.episode_number
    ))
    setShowModal(false)
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Group episodes by season
  const episodesBySeason = episodes.reduce<Record<number, Episode[]>>((acc, ep) => {
    const s = ep.season_number
    if (!acc[s]) acc[s] = []
    acc[s].push(ep)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-red-500">{error ?? 'Anime not found.'}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <span className="text-gray-300">|</span>
          <span className="font-medium text-gray-900">AniUpload</span>
        </div>
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

        {/* Anime Header */}
        <div className="flex gap-6 mb-8">
          <div className="w-36 h-48 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
            {anime.thumbnail_url ? (
              <img src={anime.thumbnail_url} alt={anime.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375a1.125 1.125 0 011.125-1.125h1.5" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-between py-1">
            <div>
              {anime.genre && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{anime.genre}</span>
              )}
              <h1 className="text-2xl font-medium text-gray-900 mt-2">{anime.title}</h1>
              {anime.description && (
                <p className="text-sm text-gray-500 mt-1 max-w-lg">{anime.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => setShowModal(true)}
                className="text-sm px-4 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                + Add Episode
              </button>
            </div>
          </div>
        </div>

        {/* Episodes */}
        {episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-sm">No episodes yet. Upload the first one!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(episodesBySeason).map(([season, eps]) => (
              <div key={season}>
                <h2 className="text-sm font-medium text-gray-500 mb-3">Season {season}</h2>
                <div className="space-y-2">
                  {eps.map((ep) => (
                    <div
                      key={ep.id}
                      className="bg-white border border-gray-200 rounded-xl flex items-center gap-4 p-3 hover:border-gray-300 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-28 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {ep.thumbnail_url ? (
                          <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 flex-shrink-0">EP {ep.episode_number}</span>
                          <p className="text-sm font-medium text-gray-900 truncate">{ep.title}</p>
                        </div>
                        {ep.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ep.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">{formatSize(ep.file_size)}</span>
                          <span className="text-xs text-gray-400">{formatDuration(ep.duration)}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            ep.status === 'ready'      ? 'bg-green-50 text-green-600' :
                            ep.status === 'processing' ? 'bg-yellow-50 text-yellow-600' :
                                                         'bg-red-50 text-red-600'
                          }`}>
                            {ep.status}
                          </span>
                        </div>
                      </div>

                      {/* Watch */}
                      <button
  onClick={() => navigate(`/anime/${id}/watch/${ep.id}`)}
  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
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
        <ModalWrapper title={`Add Episode — ${anime.title}`} onClose={() => setShowModal(false)}>
          <EpisodeModal anime={anime} onClose={() => setShowModal(false)} onSubmit={handleEpisodeSubmit} />
        </ModalWrapper>
      )}

    </div>
  )
}