import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { animeService } from '../services/animeService'
import type { Anime } from '../types/anime'

const GENRES = ['All', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller']

export default function Browse() {
  const navigate = useNavigate()

  const [animes, setAnimes]       = useState<Anime[]>([])
  const [filtered, setFiltered]   = useState<Anime[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [genre, setGenre]         = useState('All')
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)

  useEffect(() => {
    setLoading(true)
    animeService.getAll(page)
      .then((res) => {
        setAnimes(res.data)
        setFiltered(res.data)
        setLastPage(res.last_page)
      })
      .finally(() => setLoading(false))
  }, [page])

  // Filter locally by search + genre
  useEffect(() => {
    let result = animes
    if (genre !== 'All') {
      result = result.filter((a) => a.genre === genre)
    }
    if (search.trim()) {
      result = result.filter((a) =>
        a.title.toLowerCase().includes(search.toLowerCase())
      )
    }
    setFiltered(result)
  }, [search, genre, animes])

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <span className="font-medium text-white">AniUpload</span>
        <button
          onClick={() => navigate('/login')}
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
        >
          Sign in
        </button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-white mb-1">Browse Anime</h1>
          <p className="text-sm text-gray-500">Watch the latest uploaded episodes</p>
        </div>

        {/* Search + Genre Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anime..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-gray-600 transition-colors"
          />
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`text-xs px-3 py-1.5 rounded-full flex-shrink-0 transition-colors ${
                  genre === g
                    ? 'bg-white text-gray-900 font-medium'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <p className="text-sm text-gray-600">No anime found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((anime) => (
              <div
                key={anime.id}
                onClick={() => navigate(`/browse/${anime.id}`)}
                className="cursor-pointer group"
              >
                {/* Poster */}
                <div className="aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden mb-2 relative">
                  {anime.thumbnail_url ? (
                    <img
                      src={anime.thumbnail_url}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375a1.125 1.125 0 011.125-1.125h1.5" />
                      </svg>
                    </div>
                  )}
                  {anime.genre && (
                    <span className="absolute top-2 left-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded-full">
                      {anime.genre}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <p className="text-sm font-medium text-white truncate group-hover:text-gray-300 transition-colors">
                  {anime.title}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {anime.episodes_count ?? 0} ep{(anime.episodes_count ?? 0) !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm px-4 py-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-600">Page {page} of {lastPage}</span>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="text-sm px-4 py-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}