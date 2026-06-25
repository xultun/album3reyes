import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ALL_STICKERS, GROUPS } from '../lib/albumData'
import {
  getLeaderboard, getRecentUsers, getListings,
  findMatches, getComments, postComment, deleteComment,
  getGlobalStats, recalcCatalogStats
} from '../lib/db'
import toast from 'react-hot-toast'

const TOTAL_ALBUM = ALL_STICKERS.length
const PAISES_FLAG = {
  'República Dominicana': '🇩🇴', 'México': '🇲🇽', 'Colombia': '🇨🇴',
  'Perú': '🇵🇪', 'Argentina': '🇦🇷', 'Venezuela': '🇻🇪', 'Ecuador': '🇪🇨',
  'Bolivia': '🇧🇴', 'Chile': '🇨🇱', 'Uruguay': '🇺🇾', 'Paraguay': '🇵🇾',
  'Brasil': '🇧🇷', 'España': '🇪🇸', 'Estados Unidos': '🇺🇸',
}

function Avatar({ name, size = 40, color = 'var(--verde)' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}22`, border: `1.5px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.3, color, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function ProgressRing({ pct, size = 80, stroke = 6 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="var(--verde)" strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease', filter: 'drop-shadow(0 0 6px rgba(0,200,83,0.5))' }}
      />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: size * 0.22, fill: 'white', letterSpacing: 1 }}>
        {pct}%
      </text>
    </svg>
  )
}

// Progreso por grupo
function GroupProgress({ catalog }) {
  const groups = Object.keys(GROUPS)
  const groupData = groups.map(g => {
    const stickers = ALL_STICKERS.filter(s => s.grupo === g)
    const tengo = stickers.filter(s => catalog[String(s.id)]?.status === 'tengo').length
    return { g, total: stickers.length, tengo, pct: stickers.length ? Math.round((tengo / stickers.length) * 100) : 0 }
  }).sort((a, b) => b.pct - a.pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {groupData.map(({ g, total, tengo, pct }) => (
        <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: pct > 50 ? 'rgba(0,200,83,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${pct > 50 ? 'rgba(0,200,83,0.4)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: pct > 50 ? 'var(--verde)' : 'var(--gris-300)', flexShrink: 0 }}>
            {g}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: pct > 70 ? 'var(--verde)' : pct > 40 ? 'var(--dorado)' : 'var(--rojo)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--gris-300)', minWidth: 52, textAlign: 'right' }}>{tengo}/{total}</div>
        </div>
      ))}
    </div>
  )
}

// Muro de comentarios
function CommentWall({ currentUser, userProfile }) {
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    loadComments()
    const interval = setInterval(loadComments, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadComments() {
    const data = await getComments(40)
    setComments(data)
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !currentUser) return
    setSending(true)
    try {
      await postComment(currentUser.uid, text)
      setText('')
      await loadComments()
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      toast.error('Error al enviar')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id) {
    await deleteComment(id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const timeAgo = (ts) => {
    if (!ts?.seconds) return 'ahora'
    const diff = Date.now() / 1000 - ts.seconds
    if (diff < 60) return 'ahora'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px', maxHeight: 340 }}>
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--gris-300)', fontSize: 13 }}>
            Sé el primero en escribir algo 👋
          </div>
        ) : (
          [...comments].reverse().map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Avatar name={c.displayName} size={32} color={c.uid === currentUser?.uid ? 'var(--dorado)' : 'var(--verde)'} />
              <div style={{ flex: 1, background: c.uid === currentUser?.uid ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${c.uid === currentUser?.uid ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: c.uid === currentUser?.uid ? 'var(--dorado)' : 'var(--verde)' }}>{c.displayName}</span>
                  {c.pais && <span style={{ fontSize: 11 }}>{PAISES_FLAG[c.pais] || '🌍'}</span>}
                  <span style={{ fontSize: 10, color: 'var(--gris-500)', marginLeft: 'auto' }}>{timeAgo(c.createdAt)}</span>
                  {c.uid === currentUser?.uid && (
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', color: 'var(--gris-500)', cursor: 'pointer', fontSize: 11, padding: '0 2px' }}>✕</button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--blanco)', lineHeight: 1.5 }}>{c.texto}</div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {currentUser ? (
        <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 8 }}>
          <input
            className="input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Escribe algo a la comunidad..."
            maxLength={200}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !text.trim()}>
            {sending ? '...' : '↑'}
          </button>
        </form>
      ) : (
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', textAlign: 'center', fontSize: 13, color: 'var(--gris-300)' }}>
          <Link to="/login" style={{ color: 'var(--verde)' }}>Inicia sesión</Link> para participar
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, userProfile, catalog, getCatalogStats } = useStore()
  const stats = getCatalogStats()
  const progress = TOTAL_ALBUM > 0 ? Math.round((stats.tengo / TOTAL_ALBUM) * 100) : 0

  const [leaderboard, setLeaderboard] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [myListings, setMyListings] = useState([])
  const [matches, setMatches] = useState([])
  const [globalStats, setGlobalStats] = useState({ usuarios: 0, publicaciones: 0 })
  const [recentListings, setRecentListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [user])

  // Sync stats en Firestore cada vez que cambia el catálogo
  useEffect(() => {
    if (user && Object.keys(catalog).length > 0) {
      recalcCatalogStats(user.uid, catalog).catch(() => {})
    }
  }, [catalog])

  async function loadAll() {
    setLoading(true)
    try {
      const [lb, ru, ml, gs, rl] = await Promise.all([
        getLeaderboard(10),
        getRecentUsers(6),
        user ? getListings({ uid: user.uid, limit: 5 }) : [],
        getGlobalStats(),
        getListings({ limit: 6 }),
      ])
      setLeaderboard(lb)
      setRecentUsers(ru)
      setMyListings(ml)
      setGlobalStats(gs)
      setRecentListings(rl.filter(l => l.uid !== user?.uid))

      if (user) {
        findMatches(user.uid).then(setMatches).catch(() => {})
      }
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (ts) => {
    if (!ts?.seconds) return ''
    const diff = Date.now() / 1000 - ts.seconds
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const typeLabel = { intercambio: '🔄', venta: '💰', busqueda: '🔍' }
  const typeColor = { intercambio: '#a855f7', venta: 'var(--dorado)', busqueda: 'var(--azul)' }

  return (
    <div className="main-content">

      {/* ── BIENVENIDA ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, letterSpacing: 1, color: 'white' }}>
            Hola, <span style={{ color: 'var(--verde)', textShadow: '0 0 20px rgba(0,200,83,0.4)' }}>{userProfile?.displayName?.split(' ')[0] || 'Coleccionista'}</span> 👋
          </h1>
          <p style={{ color: 'var(--gris-300)', fontSize: 14, marginTop: 2 }}>
            {PAISES_FLAG[userProfile?.pais] || '🌍'} {userProfile?.pais || 'Sin país'} · Miembro de la comunidad
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/catalogo" className="btn btn-primary">+ Marcar cromos</Link>
          <Link to="/mercado" className="btn btn-ghost">Ver mercado</Link>
        </div>
      </div>

      {/* ── STATS GLOBALES ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 28 }}>
        {[
          { val: globalStats.usuarios, label: 'Coleccionistas', icon: '👥', color: 'var(--verde)' },
          { val: globalStats.publicaciones, label: 'Publicaciones activas', icon: '📢', color: '#a855f7' },
          { val: stats.tengo, label: 'Tus cromos', icon: '✅', color: 'var(--verde)' },
          { val: stats.repetida, label: 'Repetidas', icon: '♻️', color: 'var(--dorado)' },
          { val: stats.falta, label: 'Te faltan', icon: '❌', color: 'var(--rojo)' },
          { val: matches.length, label: 'Matches disponibles', icon: '🎯', color: '#0088ff' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px', borderColor: `${s.color}22` }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: s.color, letterSpacing: 1, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--gris-300)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: 16, marginBottom: 16 }}>

        {/* Progreso del álbum */}
        <div className="card card-padded" style={{ gridColumn: '1 / 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Mi progreso</h3>
            <Link to="/catalogo" style={{ fontSize: 12, color: 'var(--verde)', textDecoration: 'none' }}>Ver álbum →</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
            <ProgressRing pct={progress} size={90} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Tengo', val: stats.tengo, color: 'var(--verde)', pct: Math.round(stats.tengo / TOTAL_ALBUM * 100) },
                  { label: 'Me faltan', val: stats.falta, color: 'var(--rojo)', pct: Math.round(stats.falta / TOTAL_ALBUM * 100) },
                  { label: 'Repetidas', val: stats.repetida, color: 'var(--dorado)', pct: Math.round(stats.repetida / TOTAL_ALBUM * 100) },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>{s.label}</span>
                      <span style={{ fontSize: 11, color: s.color, fontWeight: 600 }}>{s.val}</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 4 }}>
                      <div style={{ width: `${s.pct}%`, height: '100%', borderRadius: 99, background: s.color, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--gris-300)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Por grupo</div>
            <GroupProgress catalog={catalog} />
          </div>
        </div>

        {/* Mis publicaciones + Matches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Matches */}
          {matches.length > 0 && (
            <div className="card" style={{ padding: 16, border: '1px solid rgba(0,136,255,0.25)', background: 'rgba(0,136,255,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Matches para ti</span>
                <span style={{ background: 'var(--azul)', color: 'white', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, marginLeft: 'auto' }}>{matches.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {matches.slice(0, 3).map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                    <Avatar name={m.displayName} size={30} color="var(--azul)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{m.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>{m.stickers.length} cromos en común</div>
                    </div>
                    {m.whatsapp && (
                      <a href={`https://wa.me/${m.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${m.displayName}, vi que tienes cromos que me interesan del Álbum 3 Reyes`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm">
                        WA
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {matches.length > 3 && (
                <Link to="/mercado" style={{ fontSize: 12, color: 'var(--azul)', textDecoration: 'none', display: 'block', textAlign: 'center', marginTop: 10 }}>
                  Ver {matches.length - 3} más →
                </Link>
              )}
            </div>
          )}

          {/* Mis publicaciones */}
          <div className="card card-padded" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Mis publicaciones</h3>
              <Link to="/mercado" style={{ fontSize: 12, color: 'var(--verde)', textDecoration: 'none' }}>+ Nueva</Link>
            </div>
            {myListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>📭</div>
                <div style={{ fontSize: 13, color: 'var(--gris-300)' }}>No tienes publicaciones activas</div>
                <Link to="/mercado" className="btn btn-outline btn-sm" style={{ marginTop: 10, display: 'inline-flex' }}>Publicar ahora</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myListings.map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ fontSize: 16 }}>{typeLabel[l.type]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: typeColor[l.type], fontWeight: 600, textTransform: 'capitalize' }}>{l.type}</div>
                      <div style={{ fontSize: 11, color: 'var(--gris-300)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.stickers.slice(0, 6).map(s => `#${s}`).join(', ')}{l.stickers.length > 6 ? ` +${l.stickers.length-6}` : ''}
                      </div>
                    </div>
                    {l.precio && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--dorado)', whiteSpace: 'nowrap' }}>{l.moneda} {l.precio}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Muro social */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Muro de la comunidad</span>
            <span style={{ fontSize: 11, color: 'var(--gris-300)', marginLeft: 'auto' }}>30s auto-refresh</span>
          </div>
          <CommentWall currentUser={user} userProfile={userProfile} />
        </div>
      </div>

      {/* ── SEGUNDA FILA ───────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Ranking */}
        <div className="card card-padded">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Ranking de coleccionistas</h3>
          </div>
          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
              Sé el primero en marcar cromos para aparecer aquí
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.map((u, i) => {
                const pct = TOTAL_ALBUM > 0 ? Math.round((u.catalogStats?.tengo || 0) / TOTAL_ALBUM * 100) : 0
                const medals = ['🥇', '🥈', '🥉']
                const isMe = u.uid === user?.uid
                return (
                  <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: isMe ? 'rgba(0,200,83,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 8, border: isMe ? '1px solid rgba(0,200,83,0.2)' : '1px solid transparent' }}>
                    <span style={{ fontSize: i < 3 ? 18 : 13, minWidth: 24, textAlign: 'center', color: 'var(--gris-300)', fontWeight: 700 }}>
                      {i < 3 ? medals[i] : i + 1}
                    </span>
                    <Avatar name={u.displayName} size={32} color={isMe ? 'var(--dorado)' : 'var(--verde)'} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isMe ? 'var(--dorado)' : 'white' }}>{u.displayName}</span>
                        {isMe && <span style={{ fontSize: 10, color: 'var(--verde)', background: 'rgba(0,200,83,0.1)', padding: '1px 5px', borderRadius: 10 }}>Tú</span>}
                        {u.pais && <span style={{ fontSize: 11 }}>{PAISES_FLAG[u.pais] || ''}</span>}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 3, marginTop: 4 }}>
                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: i === 0 ? 'var(--dorado)' : 'var(--verde)' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: i === 0 ? 'var(--dorado)' : 'var(--verde)', lineHeight: 1 }}>{u.catalogStats?.tengo || 0}</div>
                      <div style={{ fontSize: 10, color: 'var(--gris-500)' }}>{pct}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actividad reciente del mercado + nuevos miembros */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Nuevos miembros */}
          <div className="card card-padded">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Nuevos miembros</h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {recentUsers.length === 0 ? (
                <p style={{ color: 'var(--gris-300)', fontSize: 13 }}>Cargando...</p>
              ) : (
                recentUsers.map(u => (
                  <div key={u.uid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Avatar name={u.displayName} size={28} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{u.displayName}</div>
                      <div style={{ fontSize: 10, color: 'var(--gris-300)' }}>{PAISES_FLAG[u.pais] || '🌍'} {u.pais || 'Sin país'}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Últimas publicaciones del mercado */}
          <div className="card card-padded" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>📢</span>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Mercado reciente</h3>
              </div>
              <Link to="/mercado" style={{ fontSize: 12, color: 'var(--verde)', textDecoration: 'none' }}>Ver todo →</Link>
            </div>
            {recentListings.length === 0 ? (
              <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sin publicaciones recientes</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentListings.slice(0, 5).map(l => (
                  <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: 14 }}>{typeLabel[l.type]}</span>
                    <Avatar name={l.displayName} size={28} color={typeColor[l.type]} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{l.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>
                        {l.stickers.length} cromos · {l.tipo === 'venta' ? `${l.moneda} ${l.precio}` : l.type}
                      </div>
                    </div>
                    {l.whatsapp && (
                      <a href={`https://wa.me/${l.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${l.displayName}, vi tu publicación en el Álbum 3 Reyes`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm" style={{ padding: '4px 8px', fontSize: 11 }}>
                        WA
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── ACCESOS RÁPIDOS ─────────────────────────────── */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16 }}>Accesos rápidos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { to: '/catalogo', icon: '📋', label: 'Mi álbum', desc: 'Marcar cromos', color: 'var(--verde)' },
            { to: '/mercado', icon: '🔄', label: 'Intercambios', desc: `${stats.repetida} repetidas disponibles`, color: '#a855f7' },
            { to: '/mercado', icon: '💰', label: 'Vender', desc: 'Publicar cromos', color: 'var(--dorado)' },
            { to: '/perfil', icon: '⚙️', label: 'Mi perfil', desc: 'Editar datos', color: 'var(--gris-300)' },
          ].map(item => (
            <Link key={item.label} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color + '44'; e.currentTarget.style.background = item.color + '08' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
