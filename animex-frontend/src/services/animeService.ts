import api from '../api/axtios'
import type { AnimeVideo, AnimeVideoPayload, AnimeVideoPaginated } from '../types/anime'

export const animeService = {
  async getAll(page = 1): Promise<AnimeVideoPaginated> {
    const { data } = await api.get<AnimeVideoPaginated>('/api/anime-videos', {
      params: { page },
    })
    return data
  },

  async getOne(id: number): Promise<AnimeVideo> {
    const { data } = await api.get<AnimeVideo>(`/api/anime-videos/${id}`)
    return data
  },

  async upload(payload: AnimeVideoPayload, onProgress?: (percent: number) => void): Promise<AnimeVideo> {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('video', payload.video)
    if (payload.description) form.append('description', payload.description)
    if (payload.genre)       form.append('genre', payload.genre)
    if (payload.thumbnail)   form.append('thumbnail', payload.thumbnail)

    const { data } = await api.post<{ message: string; video: AnimeVideo }>('/api/anime-videos', form, {
     headers: {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',   // ← keep this even on multipart
  },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })
    return data.video
  },

  async update(id: number, payload: Partial<Omit<AnimeVideoPayload, 'video'>>): Promise<AnimeVideo> {
    const form = new FormData()
    if (payload.title)       form.append('title', payload.title)
    if (payload.description) form.append('description', payload.description)
    if (payload.genre)       form.append('genre', payload.genre)
    if (payload.thumbnail)   form.append('thumbnail', payload.thumbnail)
    form.append('_method', 'PUT') // Laravel method spoofing for multipart

    const { data } = await api.post<{ message: string; video: AnimeVideo }>(`/api/anime-videos/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.video
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/anime-videos/${id}`)
  },
}