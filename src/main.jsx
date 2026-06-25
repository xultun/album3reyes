import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useStore } from './lib/store'
import './styles/global.css'

import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Marketplace from './pages/Marketplace'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }) {
  const { user, authLoading } = useStore()
  if (authLoading) return <div className="main-content" style={{ textAlign: 'center', paddingTop: 80 }}>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

function App() {
  const { initAuth } = useStore()

  React.useEffect(() => {
    const unsub = initAuth()
    return unsub
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="mercado" element={<Marketplace />} />
          <Route path="login" element={<Login />} />
          <Route path="registro" element={<Register />} />
          <Route path="catalogo" element={
            <ProtectedRoute><Catalog /></ProtectedRoute>
          } />
          <Route path="perfil" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
