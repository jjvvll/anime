import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { animeService } from '../services/animeService'
import type { Anime, Episode } from '../types/anime'

export default function BrowseAnime() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [anime, setAnime]       = useState<Anime | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading]   = useState(true)
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

  const episodesBySeason = episodes.reduce<Record<number, Episode[]>>((acc, ep) => {
    if (!acc[ep.season_number]) acc[ep.season_number] = []
    acc[ep.season_number].push(ep)
    return acc
  }, {})

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-sm text-red-500">{error ?? 'Anime not found.'}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/browse')}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Browse
          </button>
          <span className="text-gray-700">|</span>
          <span className="font-medium text-white">AniUpload</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* Anime Hero */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-8 flex gap-6">
          <div className="w-32 h-44 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
            {anime.thumbnail_url ? (
              <img src={anime.thumbnail_url} alt={anime.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2">
            {anime.genre && (
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full w-fit">
                {anime.genre}
              </span>
            )}
            <h1 className="text-2xl font-medium text-white">{anime.title}</h1>
            {anime.description && (
              <p className="text-sm text-gray-400 max-w-lg">{anime.description}</p>
            )}
            <p className="text-xs text-gray-600">{episodes.length} episode{episodes.length !== 1 ? 's' : ''}</p>

            {/* Play first episode */}
            {episodes.length > 0 && (
              <button
                onClick={() => navigate(`/browse/${id}/watch/${episodes[0].id}`)}
                className="mt-2 w-fit flex items-center gap-2 text-sm px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play from start
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Episodes */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {episodes.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-600">No episodes available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(episodesBySeason).map(([season, eps]) => (
              <div key={season}>
                <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">
                  Season {season}
                </h2>
                <div className="space-y-2">
                  {eps.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => navigate(`/browse/${id}/watch/${ep.id}`)}
                      className="bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-4 p-3 cursor-pointer hover:border-gray-600 hover:bg-gray-800 transition-colors group"
                    >
                      {/* Thumbnail */}
                      <div className="w-28 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {ep.thumbnail_url ? (
                          <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 flex-shrink-0">EP {ep.episode_number}</span>
                          <p className="text-sm font-medium text-white truncate">{ep.title}</p>
                        </div>
                        {ep.description && (
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{ep.description}</p>
                        )}
                        <p className="text-xs text-gray-700 mt-1">{formatSize(ep.file_size)}</p>
                      </div>

                      <svg className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}