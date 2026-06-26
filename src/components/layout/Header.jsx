import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useStore } from '../../lib/store'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function Header() {
  const { user, userProfile, getCatalogStats } = useStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const stats = user ? getCatalogStats() : null

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Sesión cerrada')
    navigate('/')
    setMenuOpen(false)
  }

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        ÁLBUM <span>3 REYES</span> <span style={{ color: 'var(--dorado-claro)', fontSize: 14, verticalAlign: 'middle' }}>MUNDIAL</span>
      </Link>

      <nav className="header-nav">
        <NavLink to="/mercado" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span>🔄</span> <span>Mercado</span>
        </NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span>🏠</span> <span>Dashboard</span>
            </NavLink>
            <NavLink to="/catalogo" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span>📋</span> <span>Mi Álbum</span>
            </NavLink>

            {stats && (
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                {stats.tengo}/{stats.tengo + stats.falta}
              </span>
            )}

            <div style={{ position: 'relative' }}>
              <div className="avatar" onClick={() => setMenuOpen(!menuOpen)} title={userProfile?.displayName}>
                {initials}
              </div>

              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%', background: 'white',
                  borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
                  minWidth: 180, overflow: 'hidden', border: '1px solid var(--gris-100)',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gris-100)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{userProfile?.displayName}</div>
                    <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>{user.email}</div>
                  </div>
                  <Link
                    to="/perfil"
                    onClick={() => setMenuOpen(false)}
                    style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--gris-900)', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gris-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    ⚙️ Mi perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px',
                      textAlign: 'left', border: 'none', background: 'none',
                      fontSize: 14, cursor: 'pointer', color: 'var(--rojo)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--rojo-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Entrar</Link>
            <Link to="/registro" className="btn btn-dorado btn-sm">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  )
}
