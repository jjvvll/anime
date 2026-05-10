import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-medium text-gray-900">MyApp</span>
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

      {/* Content */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-2">
        <h1 className="text-2xl font-medium text-gray-900">Welcome, {user?.name} 👋</h1>
        <p className="text-sm text-gray-500">You're successfully logged in.</p>
      </main>

    </div>
  )
}