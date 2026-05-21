import type { Anime } from '../types/anime'

interface Props {
  anime: Anime
  onAddEpisode: (anime: Anime) => void
}

export default function AnimeCard({ anime, onAddEpisode }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="aspect-video bg-gray-100 relative">
        {anime.thumbnail_url ? (
          <img src={anime.thumbnail_url} alt={anime.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-.375a1.125 1.125 0 011.125-1.125h1.5m0 0A1.125 1.125 0 016 18.375m0 0v-9.75A1.125 1.125 0 017.125 7.5h9.75A1.125 1.125 0 0118 8.625v9.75A1.125 1.125 0 0116.875 19.5H6" />
            </svg>
          </div>
        )}
        {anime.genre && (
          <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
            {anime.genre}
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">{anime.title}</p>
        {anime.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{anime.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {anime.episodes_count ?? 0} episode{(anime.episodes_count ?? 0) !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => onAddEpisode(anime)}
            className="text-xs text-blue-600 hover:underline"
          >
            + Add Episode
          </button>
        </div>
      </div>
    </div>
  )
}