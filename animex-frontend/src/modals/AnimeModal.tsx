import { useRef, useState } from 'react'
import type { AnimePayload } from '../types/anime'

const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller']

interface Props {
  onClose: () => void
  onSubmit: (payload: AnimePayload & { thumbnail?: File }) => Promise<void>
}

export default function AnimeModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<AnimePayload & { thumbnail?: File }>({
    title: '', description: '', genre: '', thumbnail: undefined,
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const thumbInputRef             = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUploading(true)
    try {
      await onSubmit(form)
    } catch (err: any) {
      const errors = err.response?.data?.errors
      setError(errors ? (Object.values(errors)[0] as string[])[0] : err.response?.data?.message ?? 'Failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Title</label>
        <input
          type="text" name="title" value={form.title} onChange={handleChange}
          placeholder="e.g. One Piece" required
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
        <label className="block text-sm text-gray-500 mb-1.5">Genre <span className="text-gray-400">(optional)</span></label>
        <select
          name="genre" value={form.genre} onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
        >
          <option value="">Select genre</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-1.5">Thumbnail <span className="text-gray-400">(optional)</span></label>
        <div
          onClick={() => thumbInputRef.current?.click()}
          className="border border-dashed border-gray-300 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
        >
          <p className="text-sm text-gray-400 truncate">
            {form.thumbnail ? form.thumbnail.name : 'Click to select JPG, PNG, or WebP'}
          </p>
        </div>
        <input
          ref={thumbInputRef} type="file" name="thumbnail" accept="image/jpeg,image/png,image/webp"
          onChange={(e) => { if (e.target.files?.[0]) setForm((p) => ({ ...p, thumbnail: e.target.files![0] })) }}
          className="hidden"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} disabled={uploading}
          className="flex-1 text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={uploading}
          className="flex-1 text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {uploading ? 'Creating...' : 'Create Anime'}
        </button>
      </div>
    </form>
  )
}