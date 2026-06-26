import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import {
  collection, getDocs, query, orderBy, limit,
  deleteDoc, doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { ALL_STICKERS } from '../lib/albumData'
import toast from 'react-hot-toast'

const ADMIN_EMAIL = 'xultun18@gmail.com'
const TOTAL_ALBUM = ALL_STICKERS.length

// ── DB helpers ────────────────────────────────────────────────

async function getAllUsers() {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

async function getAllListings() {
  const snap = await getDocs(query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(100)))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

async function getAllComments() {
  const snap = await getDocs(query(collection(db, 'comments'), orderBy('createdAt', 'desc'), limit(100)))
  return snap.docs.map(d => ({ ...d.data(), id: d.id }))
}

async function getUserCatalogAdmin(uid) {
  const snap = await getDocs(collection(db, 'catalogs', uid, 'stickers'))
  const catalog = {}
  snap.forEach(d => { catalog[d.id] = d.data() })
  return catalog
}

async function deleteUserAdmin(uid) {
  // Eliminar catálogo
  const catSnap = await getDocs(collection(db, 'catalogs', uid, 'stickers'))
  await Promise.all(catSnap.docs.map(d => deleteDoc(d.ref)))
  // Eliminar listings
  const listSnap = await getDocs(query(collection(db, 'listings'), ))
  // Eliminar perfil
  await deleteDoc(doc(db, 'users', uid))
}

async function deleteListing(id) {
  await deleteDoc(doc(db, 'listings', id))
}

async function deleteComment(id) {
  await deleteDoc(doc(db, 'comments', id))
}

async function toggleListingStatus(id, activo) {
  await updateDoc(doc(db, 'listings', id), { activo: !activo, updatedAt: serverTimestamp() })
}

// ── Mini components ───────────────────────────────────────────

function StatBox({ icon, value, label, color = 'var(--verde)' }) {
  return (
    <div style={{ background: 'var(--negro-3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color, letterSpacing: 1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--gris-300)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  )
}

function Avatar({ name, size = 36 }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(0,200,83,0.15)', border: '1px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.3, color: 'var(--verde)', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

// Gráfica de barras simple
function BarChart({ data, color = 'var(--verde)' }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: `${(d.value / max) * 64}px`, minHeight: d.value > 0 ? 4 : 0, opacity: 0.85, transition: 'height 0.5s ease' }} />
          <div style={{ fontSize: 9, color: 'var(--gris-500)', textAlign: 'center' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

// Modal de catálogo de usuario
function UserCatalogModal({ user, onClose }) {
  const [catalog, setCatalog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserCatalogAdmin(user.uid).then(c => { setCatalog(c); setLoading(false) })
  }, [user.uid])

  const tengo = catalog ? Object.values(catalog).filter(s => s.status === 'tengo').length : 0
  const falta = catalog ? Object.values(catalog).filter(s => s.status === 'falta').length : 0
  const repetida = catalog ? Object.values(catalog).filter(s => s.status === 'repetida').length : 0
  const pct = TOTAL_ALBUM > 0 ? Math.round((tengo / TOTAL_ALBUM) * 100) : 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--negro-3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, width: '100%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={user.displayName} size={40} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>{user.displayName}</div>
            <div style={{ fontSize: 12, color: 'var(--gris-300)' }}>{user.email} · {user.pais || 'Sin país'}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--gris-300)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gris-300)' }}>Cargando catálogo...</div>
        ) : (
          <div style={{ overflowY: 'auto', padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { val: `${pct}%`, label: 'Completado', color: 'var(--verde)' },
                { val: tengo, label: 'Tiene', color: 'var(--verde)' },
                { val: falta, label: 'Le faltan', color: 'var(--rojo)' },
                { val: repetida, label: 'Repetidas', color: 'var(--dorado)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, height: 6, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--verde)', borderRadius: 8 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: 4 }}>
              {ALL_STICKERS.slice(0, 200).map(s => {
                const st = catalog[String(s.id)]
                const color = st?.status === 'tengo' ? 'rgba(0,200,83,0.3)' : st?.status === 'falta' ? 'rgba(255,68,68,0.3)' : st?.status === 'repetida' ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.04)'
                const border = st?.status === 'tengo' ? 'rgba(0,200,83,0.5)' : st?.status === 'falta' ? 'rgba(255,68,68,0.5)' : st?.status === 'repetida' ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.08)'
                return (
                  <div key={s.id} style={{ background: color, border: `1px solid ${border}`, borderRadius: 4, padding: '4px 2px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gris-300)' }}>#{s.id}</div>
                    <div style={{ fontSize: 8, color: 'var(--gris-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.pais?.slice(0, 6)}</div>
                  </div>
                )
              })}
            </div>
            {TOTAL_ALBUM > 200 && <p style={{ fontSize: 11, color: 'var(--gris-500)', textAlign: 'center', marginTop: 8 }}>Mostrando primeros 200 de {TOTAL_ALBUM} cromos</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN ADMIN PAGE ───────────────────────────────────────────

export default function Admin() {
  const { user, authLoading } = useStore()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('stats')
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchUser, setSearchUser] = useState('')
  const [searchListing, setSearchListing] = useState('')

  const isAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim()

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    if (!isAdmin) { navigate('/dashboard'); return }
    loadAll()
  }, [user, authLoading, isAdmin])

  async function loadAll() {
    setLoading(true)
    try {
      const [u, l, c] = await Promise.all([getAllUsers(), getAllListings(), getAllComments()])
      setUsers(u)
      setListings(l)
      setComments(c)
    } finally {
      setLoading(false)
    }
  }

  // Stats calculadas
  const totalUsers = users.length
  const totalListings = listings.length
  const activeListings = listings.filter(l => l.activo).length
  const totalComments = comments.length
  const avgCompletion = users.length > 0
    ? Math.round(users.reduce((acc, u) => acc + (u.catalogStats?.tengo || 0), 0) / users.length)
    : 0
  const topUser = users.reduce((a, b) => (a.catalogStats?.tengo || 0) > (b.catalogStats?.tengo || 0) ? a : b, {})

  // Registros por día (últimos 7 días)
  const registrosPorDia = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('es', { weekday: 'short' })
    const value = users.filter(u => {
      if (!u.createdAt?.seconds) return false
      const ud = new Date(u.createdAt.seconds * 1000)
      return ud.toDateString() === d.toDateString()
    }).length
    return { label, value }
  })

  // Distribución por país
  const porPais = users.reduce((acc, u) => {
    const p = u.pais || 'Sin país'
    acc[p] = (acc[p] || 0) + 1
    return acc
  }, {})
  const topPaises = Object.entries(porPais).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const handleDeleteUser = async (uid, name) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    try {
      await deleteUserAdmin(uid)
      setUsers(prev => prev.filter(u => u.uid !== uid))
      toast.success('Usuario eliminado')
    } catch { toast.error('Error al eliminar') }
  }

  const handleDeleteListing = async (id) => {
    if (!confirm('¿Eliminar esta publicación?')) return
    await deleteListing(id)
    setListings(prev => prev.filter(l => l.id !== id))
    toast.success('Publicación eliminada')
  }

  const handleDeleteComment = async (id) => {
    await deleteComment(id)
    setComments(prev => prev.filter(c => c.id !== id))
    toast.success('Comentario eliminado')
  }

  const handleToggleListing = async (id, activo) => {
    await toggleListingStatus(id, activo)
    setListings(prev => prev.map(l => l.id === id ? { ...l, activo: !activo } : l))
  }

  const timeAgo = (ts) => {
    if (!ts?.seconds) return '—'
    const diff = Date.now() / 1000 - ts.seconds
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.pais?.toLowerCase().includes(searchUser.toLowerCase())
  )

  const filteredListings = listings.filter(l =>
    l.displayName?.toLowerCase().includes(searchListing.toLowerCase()) ||
    l.type?.includes(searchListing.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32 }}>⚙️</div>
        <div style={{ color: 'var(--gris-300)', fontSize: 14 }}>Cargando panel de administración...</div>
      </div>
    )
  }

  if (!user || !isAdmin) return null

  const TABS = [
    { key: 'stats', label: '📊 Estadísticas' },
    { key: 'users', label: `👥 Usuarios (${totalUsers})` },
    { key: 'listings', label: `📢 Mercado (${totalListings})` },
    { key: 'comments', label: `💬 Muro (${totalComments})` },
  ]

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', borderRadius: 20, padding: '3px 10px', marginBottom: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rojo)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--rojo)', fontWeight: 700, letterSpacing: 1 }}>PANEL DE ADMINISTRACIÓN</span>
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 1, color: 'white' }}>
            Control <span style={{ color: 'var(--verde)' }}>Total</span>
          </h1>
          <p style={{ color: 'var(--gris-300)', fontSize: 13 }}>Acceso exclusivo — {ADMIN_EMAIL}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadAll} className="btn btn-secondary btn-sm">🔄 Actualizar</button>
          <Link to="/dashboard" className="btn btn-ghost btn-sm">← Volver</Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--negro-4)', padding: 4, borderRadius: 10, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 16px', border: 'none', borderRadius: 7, cursor: 'pointer',
            fontSize: 13, fontWeight: 500, transition: 'all 0.15s',
            background: activeTab === t.key ? 'var(--negro-3)' : 'transparent',
            color: activeTab === t.key ? 'var(--verde)' : 'var(--gris-300)',
            boxShadow: activeTab === t.key ? '0 0 10px rgba(0,200,83,0.1)' : 'none',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ESTADÍSTICAS ───────────────────────────────── */}
      {activeTab === 'stats' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
            <StatBox icon="👥" value={totalUsers} label="Usuarios registrados" color="var(--verde)" />
            <StatBox icon="📢" value={activeListings} label="Publicaciones activas" color="#a855f7" />
            <StatBox icon="💬" value={totalComments} label="Mensajes en el muro" color="var(--azul)" />
            <StatBox icon="⭐" value={avgCompletion} label="Promedio cromos/usuario" color="var(--dorado)" />
            <StatBox icon="🏆" value={topUser.displayName?.split(' ')[0] || '—'} label="Líder del ranking" color="var(--dorado)" />
            <StatBox icon="🔄" value={listings.filter(l => l.activo && l.type === 'intercambio').length} label="Intercambios activos" color="var(--verde)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            {/* Registros por día */}
            <div className="card card-padded">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>📈 Registros últimos 7 días</h3>
              <BarChart data={registrosPorDia} color="var(--verde)" />
            </div>

            {/* Por país */}
            <div className="card card-padded">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>🌍 Usuarios por país</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topPaises.map(([pais, count]) => (
                  <div key={pais} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--gris-300)', minWidth: 120 }}>{pais}</span>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 6 }}>
                      <div style={{ width: `${(count / totalUsers) * 100}%`, height: '100%', borderRadius: 99, background: 'var(--verde)' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--verde)', minWidth: 24, textAlign: 'right' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribución de tipo de publicaciones */}
          <div className="card card-padded">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>📊 Publicaciones por tipo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { type: 'intercambio', label: '🔄 Intercambios', color: '#a855f7' },
                { type: 'venta', label: '💰 Ventas', color: 'var(--dorado)' },
                { type: 'busqueda', label: '🔍 Búsquedas', color: 'var(--azul)' },
              ].map(({ type, label, color }) => {
                const count = listings.filter(l => l.type === type).length
                const pct = totalListings > 0 ? Math.round((count / totalListings) * 100) : 0
                return (
                  <div key={type} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color, lineHeight: 1 }}>{count}</div>
                    <div style={{ fontSize: 12, color: 'var(--gris-300)', marginBottom: 8 }}>{label}</div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 4 }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: color }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gris-500)', marginTop: 4 }}>{pct}% del total</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── USUARIOS ───────────────────────────────────── */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <input className="input" placeholder="Buscar por nombre, email o país..." value={searchUser} onChange={e => setSearchUser(e.target.value)} style={{ maxWidth: 360 }} />
            <span style={{ fontSize: 13, color: 'var(--gris-300)' }}>{filteredUsers.length} usuarios</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredUsers.map(u => {
              const tengo = u.catalogStats?.tengo || 0
              const pct = TOTAL_ALBUM > 0 ? Math.round((tengo / TOTAL_ALBUM) * 100) : 0
              const isAdmin = u.email === ADMIN_EMAIL
              return (
                <div key={u.uid} style={{ background: 'var(--negro-3)', border: isAdmin ? '1px solid rgba(255,215,0,0.3)' : '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <Avatar name={u.displayName} size={42} />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>{u.displayName || 'Sin nombre'}</span>
                      {isAdmin && <span style={{ fontSize: 10, background: 'rgba(255,215,0,0.2)', color: 'var(--dorado)', border: '1px solid rgba(255,215,0,0.4)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>ADMIN</span>}
                      {u.pais && <span style={{ fontSize: 11, color: 'var(--gris-500)' }}>{u.pais}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gris-300)' }}>{u.email}</div>
                    {u.whatsapp && <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>📱 {u.whatsapp}</div>}
                  </div>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>Álbum</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--verde)' }}>{tengo} ({pct}%)</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 4 }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'var(--verde)' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, fontSize: 10, color: 'var(--gris-500)' }}>
                      <span style={{ color: 'var(--verde)' }}>✓{u.catalogStats?.tengo || 0}</span>
                      <span style={{ color: 'var(--rojo)' }}>✗{u.catalogStats?.faltan || 0}</span>
                      <span style={{ color: 'var(--dorado)' }}>★{u.catalogStats?.repetidas || 0}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gris-500)', minWidth: 60, textAlign: 'right' }}>
                    hace {timeAgo(u.createdAt)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setSelectedUser(u)} className="btn btn-secondary btn-sm">👁 Ver álbum</button>
                    {!isAdmin && (
                      <button onClick={() => handleDeleteUser(u.uid, u.displayName)} className="btn btn-danger btn-sm">🗑</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── MERCADO ────────────────────────────────────── */}
      {activeTab === 'listings' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="input" placeholder="Buscar por usuario o tipo..." value={searchListing} onChange={e => setSearchListing(e.target.value)} style={{ maxWidth: 300 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              {['all','intercambio','venta','busqueda'].map(t => (
                <button key={t} onClick={() => setSearchListing(t === 'all' ? '' : t)} className={`filter-chip ${searchListing === (t === 'all' ? '' : t) ? 'active' : ''}`}>
                  {t === 'all' ? 'Todos' : t}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: 'var(--gris-300)' }}>{filteredListings.length} publicaciones</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredListings.map(l => (
              <div key={l.id} style={{ background: 'var(--negro-3)', border: `1px solid ${l.activo ? 'rgba(255,255,255,0.07)' : 'rgba(255,68,68,0.2)'}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', opacity: l.activo ? 1 : 0.6 }}>
                <div style={{ fontSize: 20 }}>{l.type === 'intercambio' ? '🔄' : l.type === 'venta' ? '💰' : '🔍'}</div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'white' }}>{l.displayName}</span>
                    <span style={{ fontSize: 11, background: l.activo ? 'rgba(0,200,83,0.15)' : 'rgba(255,68,68,0.15)', color: l.activo ? 'var(--verde)' : 'var(--rojo)', border: `1px solid ${l.activo ? 'rgba(0,200,83,0.3)' : 'rgba(255,68,68,0.3)'}`, padding: '1px 6px', borderRadius: 10 }}>
                      {l.activo ? 'Activa' : 'Inactiva'}
                    </span>
                    {l.pais && <span style={{ fontSize: 11, color: 'var(--gris-500)' }}>{l.pais}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gris-300)', marginTop: 2 }}>
                    {l.stickers?.slice(0, 8).map(s => `#${s}`).join(', ')}{l.stickers?.length > 8 ? ` +${l.stickers.length - 8}` : ''}
                  </div>
                  {l.descripcion && <div style={{ fontSize: 11, color: 'var(--gris-500)', marginTop: 2 }}>{l.descripcion}</div>}
                </div>
                {l.precio && <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--dorado)' }}>{l.moneda} {l.precio}</span>}
                <div style={{ fontSize: 11, color: 'var(--gris-500)' }}>hace {timeAgo(l.createdAt)}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => handleToggleListing(l.id, l.activo)} className="btn btn-secondary btn-sm">
                    {l.activo ? '⏸ Pausar' : '▶ Activar'}
                  </button>
                  <button onClick={() => handleDeleteListing(l.id)} className="btn btn-danger btn-sm">🗑</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MURO ───────────────────────────────────────── */}
      {activeTab === 'comments' && (
        <div>
          <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--gris-300)' }}>
            {comments.length} mensajes en el muro de la comunidad
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {comments.map(c => (
              <div key={c.id} style={{ background: 'var(--negro-3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Avatar name={c.displayName} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--verde)' }}>{c.displayName}</span>
                    {c.pais && <span style={{ fontSize: 11, color: 'var(--gris-500)' }}>{c.pais}</span>}
                    <span style={{ fontSize: 11, color: 'var(--gris-500)', marginLeft: 'auto' }}>hace {timeAgo(c.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'white', lineHeight: 1.5 }}>{c.texto}</div>
                </div>
                <button onClick={() => handleDeleteComment(c.id)} className="btn btn-danger btn-sm">🗑</button>
              </div>
            ))}
            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--gris-300)' }}>Sin mensajes en el muro</div>
            )}
          </div>
        </div>
      )}

      {/* Modal catálogo de usuario */}
      {selectedUser && <UserCatalogModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  )
}
