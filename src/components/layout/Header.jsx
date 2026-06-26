import { Link, NavLink, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useStore } from '../../lib/store'
import toast from 'react-hot-toast'
import { useState } from 'react'

const ADMIN_EMAIL = 'xultun18@gmail.com'

export default function Header() {
  const { user, userProfile, getCatalogStats } = useStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const stats = user ? getCatalogStats() : null

  const isAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL

  const handleLogout = async () => {
    await signOut(auth)
    toast.success('Sesión cerrada')
    navigate('/')
    setMenuOpen(false)
    setMobileOpen(false)
  }

  const initials = userProfile?.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const navLinkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <>
      <header className="header">
        <Link to="/" className="header-logo" onClick={() => setMobileOpen(false)}>
          ÁLBUM <span>3 REYES</span>
        </Link>

        {/* NAV DESKTOP */}
        <nav className="header-nav desktop-nav">
          <NavLink to="/mercado" className={navLinkClass}>
            <span>🔄</span> <span>Mercado</span>
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <span>🏠</span> <span>Dashboard</span>
              </NavLink>
              <NavLink to="/catalogo" className={navLinkClass}>
                <span>📋</span> <span>Mi Álbum</span>
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={navLinkClass} style={{ color: 'var(--rojo)' }}>
                  <span>⚙️</span> <span>Admin</span>
                </NavLink>
              )}
              {stats && (
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                  {stats.tengo}/{stats.tengo + stats.falta}
                </span>
              )}
              <div style={{ position: 'relative' }}>
                <div className="avatar" onClick={() => setMenuOpen(!menuOpen)} title={userProfile?.displayName}>
                  {initials}
                </div>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '110%',
                    background: 'var(--negro-3)', borderRadius: 'var(--radius)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    minWidth: 200, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)', zIndex: 200,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{userProfile?.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>{user.email}</div>
                    </div>
                    <Link to="/perfil" onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '10px 16px', fontSize: 14, color: 'var(--gris-300)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--gris-300)'}
                    >⚙️ Mi perfil</Link>
                    <button onClick={handleLogout} style={{
                      display: 'block', width: '100%', padding: '10px 16px',
                      textAlign: 'left', border: 'none', background: 'none',
                      fontSize: 14, cursor: 'pointer', color: 'var(--rojo)',
                    }}>🚪 Cerrar sesión</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Entrar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </nav>

        {/* HAMBURGUESA MOBILE */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          <span style={{ fontSize: 22, color: 'white' }}>{mobileOpen ? '✕' : '☰'}</span>
        </button>
      </header>

      {/* MENÚ MOBILE DESPLEGABLE */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', top: 'var(--header-h)', left: 0, right: 0, bottom: 0,
          background: 'rgba(8,12,16,0.98)', backdropFilter: 'blur(10px)',
          zIndex: 99, display: 'flex', flexDirection: 'column',
          padding: '20px 20px', gap: 6, overflowY: 'auto',
        }}>
          {/* Info usuario */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--negro-3)', borderRadius: 'var(--radius)', marginBottom: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{userProfile?.displayName}</div>
                <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>
                  {stats ? `${stats.tengo} cromos · ${Math.round(stats.tengo / 584 * 100)}% completado` : user.email}
                </div>
              </div>
            </div>
          )}

          {/* Links de navegación */}
          {[
            { to: '/mercado', icon: '🔄', label: 'Mercado' },
            ...(user ? [
              { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
              { to: '/catalogo', icon: '📋', label: 'Mi Álbum' },
              { to: '/perfil', icon: '⚙️', label: 'Mi Perfil' },
              ...(isAdmin ? [{ to: '/admin', icon: '🛡️', label: 'Panel Admin', admin: true }] : []),
            ] : [
              { to: '/login', icon: '🔑', label: 'Iniciar sesión' },
              { to: '/registro', icon: '✨', label: 'Crear cuenta gratis', highlight: true },
            ]),
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', borderRadius: 'var(--radius)',
                textDecoration: 'none', fontSize: 16, fontWeight: 500,
                background: isActive ? 'rgba(0,200,83,0.1)' : item.highlight ? 'var(--verde)' : item.admin ? 'rgba(255,68,68,0.1)' : 'var(--negro-3)',
                color: isActive ? 'var(--verde)' : item.highlight ? '#000' : item.admin ? 'var(--rojo)' : 'white',
                border: `1px solid ${isActive ? 'rgba(0,200,83,0.3)' : item.admin ? 'rgba(255,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`,
              })}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Botón cerrar sesión */}
          {user && (
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 'var(--radius)',
              background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)',
              color: 'var(--rojo)', fontSize: 16, fontWeight: 500, cursor: 'pointer',
              marginTop: 8, textAlign: 'left',
            }}>
              <span style={{ fontSize: 20 }}>🚪</span>
              Cerrar sesión
            </button>
          )}
        </div>
      )}
    </>
  )
}
