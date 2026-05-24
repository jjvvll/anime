import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animeService } from '../services/animeService'
import type { Anime, Episode } from '../types/anime'

export default function WatchEpisode() {
  const { id, episodeId } = useParams<{ id: string; episodeId: string }>()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [anime, setAnime]       = useState<Anime | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [current, setCurrent]   = useState<Episode | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const videoRef                = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!id) return
    animeService.getEpisodes(Number(id))
      .then(({ anime, episodes }) => {
        setAnime(anime)
        setEpisodes(episodes)
        const target = episodeId
          ? episodes.find((ep) => ep.id === Number(episodeId))
          : episodes[0]
        setCurrent(target ?? episodes[0] ?? null)
      })
      .catch(() => setError('Failed to load episodes.'))
      .finally(() => setLoading(false))
  }, [id, episodeId])

  // Reset and play video when episode changes
  useEffect(() => {
    if (videoRef.current && current) {
      videoRef.current.load()
      videoRef.current.play().catch(() => {})
    }
  }, [current])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const goToEpisode = (ep: Episode) => {
    setCurrent(ep)
    navigate(`/anime/${id}/watch/${ep.id}`, { replace: true })
  }

  const goNext = () => {
    if (!current) return
    const idx = episodes.findIndex((ep) => ep.id === current.id)
    if (idx < episodes.length - 1) goToEpisode(episodes[idx + 1])
  }

  const goPrev = () => {
    if (!current) return
    const idx = episodes.findIndex((ep) => ep.id === current.id)
    if (idx > 0) goToEpisode(episodes[idx - 1])
  }

  const currentIndex  = episodes.findIndex((ep) => ep.id === current?.id)
  const hasNext       = currentIndex < episodes.length - 1
  const hasPrev       = currentIndex > 0

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Group by season for sidebar
  const episodesBySeason = episodes.reduce<Record<number, Episode[]>>((acc, ep) => {
    if (!acc[ep.season_number]) acc[ep.season_number] = []
    acc[ep.season_number].push(ep)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  if (error || !anime || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-red-500">{error ?? 'Episode not found.'}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/anime/${id}`)}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <span className="text-gray-700">|</span>
          <span className="text-sm font-medium text-white truncate max-w-xs">{anime.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">
            {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Video + Info */}
        <div className="flex-1 flex flex-col overflow-y-auto">

          {/* Video Player */}
          <div className="w-full bg-black aspect-video">
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              autoPlay
              onEnded={goNext}
            >
              <source src={current.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Episode Info */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Season {current.season_number} · Episode {current.episode_number}
                </p>
                <h1 className="text-lg font-medium text-white">{current.title}</h1>
                {current.description && (
                  <p className="text-sm text-gray-400 mt-1">{current.description}</p>
                )}
                <p className="text-xs text-gray-600 mt-2">{formatSize(current.file_size)}</p>
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={goPrev}
                  disabled={!hasPrev}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={goNext}
                  disabled={!hasNext}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Anime Info */}
          <div className="px-6 py-4 flex items-center gap-4">
            {anime.thumbnail_url && (
              <img
                src={anime.thumbnail_url}
                alt={anime.title}
                className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div>
              <p className="text-sm font-medium text-white">{anime.title}</p>
              {anime.genre && (
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full mt-1 inline-block">
                  {anime.genre}
                </span>
              )}
              {anime.description && (
                <p className="text-xs text-gray-500 mt-1 max-w-lg line-clamp-2">{anime.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Episode Sidebar */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col flex-shrink-0 hidden lg:flex">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-sm font-medium text-white">Episodes</p>
            <p className="text-xs text-gray-500 mt-0.5">{episodes.length} total</p>
          </div>

          <div className="overflow-y-auto flex-1">
            {Object.entries(episodesBySeason).map(([season, eps]) => (
              <div key={season}>
                <p className="text-xs text-gray-600 px-4 py-2 uppercase tracking-wider">
                  Season {season}
                </p>
                {eps.map((ep) => {
                  const isActive = ep.id === current.id
                  return (
                    <button
                      key={ep.id}
                      onClick={() => goToEpisode(ep)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                        isActive ? 'bg-gray-800 border-l-2 border-white' : ''
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                        {ep.thumbnail_url ? (
                          <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">EP {ep.episode_number}</p>
                        <p className={`text-sm truncate ${isActive ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {ep.title}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}