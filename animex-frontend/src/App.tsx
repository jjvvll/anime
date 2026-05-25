// App.tsx - remove AuthProvider, keep just the router
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginForm from "./components/LoginForm";
import Home from "./pages/Home";
import Register from "./pages/Register";
import "./App.css";
import AnimeDetail from "./pages/AnimeDetail";
import WatchEpisode from "./pages/WatchEpisode";
import Browse from "./pages/Browse";
import BrowseAnime from "./pages/BrowseAnime";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />

        {/* Public - no auth required */}
        <Route
          path="/browse"
          element={
            <PublicRoute>
              <Browse />
            </PublicRoute>
          }
        />
        <Route
          path="/browse/:id"
          element={
            <PublicRoute>
              <BrowseAnime />
            </PublicRoute>
          }
        />
        <Route
          path="/browse/:id/watch/:episodeId?"
          element={
            <PublicRoute>
              <WatchEpisode />
            </PublicRoute>
          }
        />

        {/* Protected - auth required */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anime/:id"
          element={
            <ProtectedRoute>
              <AnimeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/anime/:id/watch/:episodeId?"
          element={
            <ProtectedRoute>
              <WatchEpisode />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/browse" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
