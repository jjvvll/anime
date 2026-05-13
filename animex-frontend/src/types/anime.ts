export interface AnimeVideo {
  id: number
  user_id: number
  title: string
  description: string | null
  genre: string | null
  video_path: string
  thumbnail_path: string | null
  video_url: string
  thumbnail_url: string | null
  file_size: number | null
  duration: number | null
  status: 'processing' | 'ready' | 'failed'
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface AnimeVideoPayload {
  title: string
  description?: string
  genre?: string
  video: File
  thumbnail?: File
}

export interface AnimeVideoPaginated {
  data: AnimeVideo[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}