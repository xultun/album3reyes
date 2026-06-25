import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './lib/store'
import './styles/global.css'

import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Catalog from './pages/Catalog'
import Marketplace from './pages/Marketplace'
import Profile from './pages/Profile'
import { Login, Register } from './pages/Login'

function ProtectedRoute({ children }) {
  const { user, authLoading } = useStore()
  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--gris-300)', fontSize: 14 }}>
      Cargando...
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return children
}

// Si está logueado, redirige al dashboard
function HomeRoute() {
  const { user, authLoading } = useStore()
  if (authLoading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <Home />
}

function App() {
  const { initAuth } = useStore()
  React.useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [])

  return (
    <BrowserRouter basename="/album3reyes">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#161b22', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="mercado" element={<Marketplace />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="catalogo" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
          <Route path="perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
