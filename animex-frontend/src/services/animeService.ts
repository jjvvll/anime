import api from '../api/axtios'
import type { Anime, Episode, AnimePayload, EpisodePayload, AnimePaginated } from '../types/anime'

export const animeService = {
  // Anime CRUD
  async getAll(page = 1): Promise<AnimePaginated> {
    const { data } = await api.get<AnimePaginated>('/api/animes', { params: { page } })
    return data
  },

  async getOne(id: number): Promise<Anime> {
    const { data } = await api.get<Anime>(`/api/animes/${id}`)
    return data
  },

  async create(payload: AnimePayload): Promise<Anime> {
    const form = new FormData()
    form.append('title', payload.title)
    if (payload.description) form.append('description', payload.description)
    if (payload.genre)       form.append('genre', payload.genre)
    if (payload.thumbnail)   form.append('thumbnail', payload.thumbnail)

    const { data } = await api.post<{ message: string; anime: Anime }>('/api/animes', form, {
      headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
    })
    return data.anime
  },

  async update(id: number, payload: Partial<AnimePayload>): Promise<Anime> {
    const form = new FormData()
    form.append('_method', 'PUT')
    if (payload.title)       form.append('title', payload.title)
    if (payload.description) form.append('description', payload.description)
    if (payload.genre)       form.append('genre', payload.genre)
    if (payload.thumbnail)   form.append('thumbnail', payload.thumbnail)

    const { data } = await api.post<{ message: string; anime: Anime }>(`/api/animes/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
    })
    return data.anime
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/api/animes/${id}`)
  },

  // Episode CRUD
  async getEpisodes(animeId: number): Promise<{ anime: Anime; episodes: Episode[] }> {
    const { data } = await api.get(`/api/animes/${animeId}/episodes`)
    return data
  },

  async uploadEpisode(
    animeId: number,
    payload: EpisodePayload,
    onProgress?: (percent: number) => void
  ): Promise<Episode> {
    const form = new FormData()
    form.append('title', payload.title)
    form.append('video', payload.video)
    form.append('episode_number', String(payload.episode_number))
    if (payload.season_number) form.append('season_number', String(payload.season_number))
    if (payload.description)   form.append('description', payload.description)
    if (payload.thumbnail)     form.append('thumbnail', payload.thumbnail)

    const { data } = await api.post<{ message: string; episode: Episode }>(
      `/api/animes/${animeId}/episodes`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total))
          }
        },
      }
    )
    return data.episode
  },

  async updateEpisode(animeId: number, episodeId: number, payload: Partial<EpisodePayload>): Promise<Episode> {
    const form = new FormData()
    form.append('_method', 'PUT')
    if (payload.title)          form.append('title', payload.title)
    if (payload.description)    form.append('description', payload.description)
    if (payload.episode_number) form.append('episode_number', String(payload.episode_number))
    if (payload.season_number)  form.append('season_number', String(payload.season_number))
    if (payload.thumbnail)      form.append('thumbnail', payload.thumbnail)

    const { data } = await api.post<{ message: string; episode: Episode }>(
      `/api/animes/${animeId}/episodes/${episodeId}`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } }
    )
    return data.episode
  },

  async removeEpisode(animeId: number, episodeId: number): Promise<void> {
    await api.delete(`/api/animes/${animeId}/episodes/${episodeId}`)
  },
}