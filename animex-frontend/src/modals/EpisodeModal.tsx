import { useRef, useState } from 'react'
import type { Anime, EpisodePayload } from '../types/anime'

interface Props {
  anime: Anime
  onClose: () => void
  onSubmit: (payload: EpisodePayload, onProgress: (p: number) => void) => Promise<void>
}

export default function EpisodeModal({ anime, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<EpisodePayload & { video: File | null }>({
    title: '', description: '', episode_number: 1, season_number: 1, video: null, thumbnail: undefined,
  })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState<string | null>(null)

  const videoInputRef   = useRef<HTMLInputElement>(null)
  const epThumbInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'episode_number' || name === 'season_number' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.video) return
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      await onSubmit({ ...form, video: form.video }, setProgress)
    } catch (err: any) {
      const errors = err.response?.data?.errors
      setError(errors ? (Object.values(errors)[0] as string[])[0] : err.response?.data?.message ?? 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">Season</label>
          <input
            type="number" name="season_number" min={1} value={form.season_number} onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1.5">Episode #</label>
          <input
            type="number" name="episode_number" min={1} value={form.episode_number} onChange={handleChange}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Title</label>
        <input
          type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="e.g. The Beginning" required
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
        <textarea
          name="description" value={form.description} onChange={handleChange}
          placeholder="Brief description..." rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Video file</label>
        <div
          onClick={() => videoInputRef.current?.click()}
          className="border border-dashed border-gray-300 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <p className="text-sm text-gray-400 truncate">
            {form.video ? form.video.name : 'Click to select MP4, WebM, or MOV'}
          </p>
        </div>
        <input
          ref={videoInputRef} type="file" name="video" accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => { if (e.target.files?.[0]) setForm((p) => ({ ...p, video: e.target.files![0] })) }}
          className="hidden"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Thumbnail <span className="text-gray-400">(optional)</span></label>
        <div
          onClick={() => epThumbInputRef.current?.click()}
          className="border border-dashed border-gray-300 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <p className="text-sm text-gray-400 truncate">
            {form.thumbnail ? form.thumbnail.name : 'Click to select JPG, PNG, or WebP'}
          </p>
        </div>
        <input
          ref={epThumbInputRef} type="file" name="thumbnail" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => { if (e.target.files?.[0]) setForm((p) => ({ ...p, thumbnail: e.target.files![0] })) }}
          className="hidden"
        />
      </div>

      {uploading && (
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Uploading...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-gray-900 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} disabled={uploading}
          className="flex-1 text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={uploading || !form.video}
          className="flex-1 text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {uploading ? `${progress}%` : 'Upload Episode'}
        </button>
      </div>
    </form>
  )
}