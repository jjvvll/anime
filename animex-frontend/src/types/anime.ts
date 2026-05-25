export interface Anime {
  id: number
  user_id: number
  title: string
  description: string | null
  genre: string | null
  thumbnail_path: string | null
  thumbnail_url: string | null
     episodes_count?: number  
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
  episodes?: Episode[]
}

export interface Episode {
  id: number
  anime_id: number
  title: string
  description: string | null
  episode_number: number
  season_number: number
  video_path: string
  thumbnail_path: string | null
  video_url: string
  thumbnail_url: string | null
   episodes_count?: number  
  file_size: number | null
  duration: number | null
  status: 'processing' | 'ready' | 'failed'
  created_at: string
  updated_at: string
}

export interface AnimePayload {
  title: string
  description?: string
  genre?: string
  thumbnail?: File
}

export interface EpisodePayload {
  title: string
  description?: string
  episode_number: number
  season_number?: number
  video: File
  thumbnail?: File
}

export interface AnimePaginated {
  data: Anime[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}