// App.tsx - remove AuthProvider, keep just the router
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginForm from './components/LoginForm'
import Home from './pages/Home'
import Register from './pages/Register'
import './App.css'
import AnimeDetail from './pages/AnimeDetail'
import WatchEpisode from './pages/WatchEpisode'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
  <Route
  path="/"
  element={
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  }
/><Route
  path="/anime/:id/watch/:episodeId?"
  element={
    <ProtectedRoute>
      <WatchEpisode />
    </ProtectedRoute>
  }
/>
<Route path="/register" element={<Register />} />

<Route
  path="/anime/:id"
  element={
    <ProtectedRoute>
      <AnimeDetail />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App