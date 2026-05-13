import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { animeService } from '../services/animeService'
import type { AnimeVideo, AnimeVideoPayload } from '../types/anime'

const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Slice of Life', 'Thriller']

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [videos, setVideos] = useState<AnimeVideo[]>([])
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<AnimeVideoPayload, 'video'> & { video: File | null }>({
    title: '',
    description: '',
    genre: '',
    video: null,
    thumbnail: undefined,
  })

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    animeService.getAll().then((res) => setVideos(res.data))
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files?.[0]) setForm((prev) => ({ ...prev, [name]: files[0] }))
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.video) return
    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      const uploaded = await animeService.upload(
        { ...form, video: form.video },
        setProgress
      )
      setVideos((prev) => [uploaded, ...prev])
      setShowModal(false)
      setForm({ title: '', description: '', genre: '', video: null, thumbnail: undefined })
    } catch (err: any) {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0] as string[]
        setError(first[0])
      } else {
        setError(err.response?.data?.message ?? 'Upload failed.')
      }
    } finally {
      setUploading(false)
    }
  }

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '—'
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-medium text-gray-900">AniUpload</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Hello, <span className="font-medium text-gray-900">{user?.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Anime Videos</h1>
            <p className="text-sm text-gray-500 mt-0.5">{videos.length} video{videos.length !== 1 ? 's' : ''} uploaded</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Upload Video
          </button>
        </div>

        {/* Video Grid */}
        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-400 text-sm">No videos yet. Upload your first one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-100 relative">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  )}
                  {video.genre && (
                    <span className="absolute top-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                      {video.genre}
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                  {video.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{video.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{formatSize(video.file_size)}</span>
                    < a
                      href={video.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                       Watch
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-lg">

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-gray-900">Upload Anime Video</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
              )}

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. One Piece Episode 1"
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Genre <span className="text-gray-400">(optional)</span></label>
                <select
                  name="genre"
                  value={form.genre}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="">Select genre</option>
                  {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Video File */}
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Video file</label>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {form.video ? (
                    <p className="text-sm text-gray-700 truncate">{form.video.name}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Click to select MP4, WebM, or MOV</p>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  name="video"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="block text-sm text-gray-500 mb-1.5">Thumbnail <span className="text-gray-400">(optional)</span></label>
                <div
                  onClick={() => thumbInputRef.current?.click()}
                  className="border border-dashed border-gray-300 rounded-lg px-4 py-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  {form.thumbnail ? (
                    <p className="text-sm text-gray-700 truncate">{form.thumbnail.name}</p>
                  ) : (
                    <p className="text-sm text-gray-400">Click to select JPG, PNG, or WebP</p>
                  )}
                </div>
                <input
                  ref={thumbInputRef}
                  type="file"
                  name="thumbnail"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Progress */}
              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-gray-900 h-1.5 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                  className="flex-1 text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !form.video}
                  className="flex-1 text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? `${progress}%` : 'Upload'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}