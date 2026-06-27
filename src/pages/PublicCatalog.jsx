import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUserProfile, getUserCatalog } from '../lib/db'
import { ALL_STICKERS, ESTADIOS, CAMPEONES, PRIMERA_VEZ, TROQUELADOS, STICKERS_EQUIPOS, GROUPS } from '../lib/albumData'

const TOTAL = ALL_STICKERS.length

function StickerChip({ sticker, status }) {
  const color = status?.status === 'tengo' ? 'var(--verde)'
    : status?.status === 'falta' ? 'var(--rojo)'
    : status?.status === 'repetida' ? 'var(--dorado)'
    : 'var(--gris-600)'

  const bg = status?.status === 'tengo' ? 'rgba(0,200,83,0.1)'
    : status?.status === 'falta' ? 'rgba(255,68,68,0.08)'
    : status?.status === 'repetida' ? 'rgba(255,215,0,0.08)'
    : 'rgba(255,255,255,0.03)'

  return (
    <div style={{
      border: `1px solid ${color}`,
      background: bg,
      borderRadius: 6, padding: '5px 4px',
      textAlign: 'center', minHeight: 64,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 3,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gris-300)' }}>
        #{sticker.id}
      </div>
      <div style={{ fontSize: 9, color: 'var(--gris-500)', lineHeight: 1.3 }}>
        {sticker.label?.replace(`${sticker.pais} — `, '').slice(0, 18)}
      </div>
      {status?.status && (
        <div style={{ fontSize: 8, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {status.status === 'tengo' ? '✓' : status.status === 'falta' ? '✗' : '★'}
        </div>
      )}
    </div>
  )
}

function PaisBlock({ pais, stickers, catalog }) {
  const [collapsed, setCollapsed] = useState(true)
  const tengo = stickers.filter(s => catalog[String(s.id)]?.status === 'tengo').length
  const falta = stickers.filter(s => catalog[String(s.id)]?.status === 'falta').length
  const repetida = stickers.filter(s => catalog[String(s.id)]?.status === 'repetida').length
  const total = stickers.length
  const pct = total > 0 ? Math.round((tengo / total) * 100) : 0
  const firstId = stickers[0]?.id
  const lastId = stickers[stickers.length - 1]?.id

  return (
    <div style={{ marginBottom: 10 }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--negro-4)', border: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{pais}</div>
          <div style={{ fontSize: 10, color: 'var(--gris-500)' }}>#{firstId}–#{lastId} · {total} cromos</div>
        </div>
        <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
          <span style={{ color: 'var(--verde)' }}>✓{tengo}</span>
          <span style={{ color: 'var(--rojo)' }}>✗{falta}</span>
          <span style={{ color: 'var(--dorado)' }}>★{repetida}</span>
        </div>
        <div style={{ minWidth: 70, textAlign: 'right' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? 'var(--verde)' : 'var(--gris-300)' }}>{pct}%</div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, height: 3, marginTop: 3 }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'var(--verde)' }} />
          </div>
        </div>
        <span style={{ color: 'var(--gris-500)', fontSize: 11 }}>{collapsed ? '▼' : '▲'}</span>
      </div>
      {!collapsed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 5, marginTop: 6 }}>
          {stickers.map(s => (
            <StickerChip key={s.id} sticker={s} status={catalog[String(s.id)]} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PublicCatalog() {
  const { uid } = useParams()
  const [profile, setProfile] = useState(null)
  const [catalog, setCatalog] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todos')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!uid) return
    Promise.all([getUserProfile(uid), getUserCatalog(uid)])
      .then(([p, c]) => { setProfile(p); setCatalog(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [uid])

  const stats = {
    tengo: Object.values(catalog).filter(v => v.status === 'tengo').length,
    falta: Object.values(catalog).filter(v => v.status === 'falta').length,
    repetida: Object.values(catalog).filter(v => v.status === 'repetida').length,
  }
  const pct = Math.round((stats.tengo / TOTAL) * 100)

  // Países en orden
  const paisesList = (() => {
    const seen = [], result = []
    STICKERS_EQUIPOS.forEach(s => {
      if (s.pais && !seen.includes(s.pais)) {
        seen.push(s.pais)
        result.push({ pais: s.pais, grupo: s.grupo, stickers: STICKERS_EQUIPOS.filter(x => x.pais === s.pais) })
      }
    })
    return result
  })()

  // Filtrar según vista activa
  const filterCatalog = (stickers) => {
    if (filter === 'todos') return stickers
    return stickers.filter(s => catalog[String(s.id)]?.status === filter)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚽</div>
      <div style={{ color: 'var(--gris-300)', fontSize: 14 }}>Cargando álbum...</div>
    </div>
  )

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }}>🔍</div>
      <div style={{ color: 'var(--gris-300)', fontSize: 15 }}>Usuario no encontrado</div>
      <Link to="/" className="btn btn-primary btn-sm">Ir al inicio</Link>
    </div>
  )

  return (
    <div className="main-content">
      {/* Header del perfil */}
      <div style={{ background: 'var(--negro-3)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(0,200,83,0.15)', border: '2px solid rgba(0,200,83,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 20, color: 'var(--verde)', flexShrink: 0,
          }}>
            {profile.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: 0 }}>
                {profile.displayName}
              </h1>
              <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', color: 'var(--gris-300)', padding: '2px 8px', borderRadius: 20 }}>
                👁 Vista pública
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--gris-300)', marginTop: 3 }}>
              {profile.pais && `🌍 ${profile.pais} · `}Álbum 3 Reyes Mundial
            </div>
          </div>

          {/* Copiar link */}
          <button onClick={copyLink} className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
            {copied ? '✓ Copiado' : '🔗 Copiar enlace'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
          {[
            { val: `${pct}%`, label: 'Completado', color: 'var(--verde)' },
            { val: stats.tengo, label: 'Tiene', color: 'var(--verde)' },
            { val: stats.falta, label: 'Le faltan', color: 'var(--rojo)' },
            { val: stats.repetida, label: 'Repetidas', color: 'var(--dorado)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--gris-300)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 5, marginTop: 12, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--verde-dim), var(--verde))', borderRadius: 99, transition: 'width 0.6s ease' }} />
        </div>

        {/* Contacto WhatsApp si tiene */}
        {profile.whatsapp && (
          <div style={{ marginTop: 14 }}>
            <a
              href={`https://wa.me/${profile.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${profile.displayName}, vi tu álbum en Album 3 Reyes Mundial y me gustaría intercambiar cromos contigo!`)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar para intercambio
            </a>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'todos', label: 'Todo el álbum' },
          { key: 'tengo', label: `✓ Tiene (${stats.tengo})` },
          { key: 'falta', label: `✗ Le faltan (${stats.falta})` },
          { key: 'repetida', label: `★ Repetidas (${stats.repetida})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`filter-chip ${filter === f.key ? 'active' : ''}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Estadios */}
      {(filter === 'todos' || filterCatalog(ESTADIOS).length > 0) && (
        <details style={{ marginBottom: 16 }}>
          <summary style={{ background: 'var(--negro-4)', border: '1px solid rgba(255,255,255,0.07)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--verde)', fontWeight: 700, fontSize: 13, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
            <span>🏟️ Estadios (1–16)</span>
            <span style={{ color: 'var(--gris-300)', fontWeight: 400 }}>{filterCatalog(ESTADIOS).length} cromos</span>
          </summary>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 5, marginTop: 8 }}>
            {filterCatalog(ESTADIOS).map(s => <StickerChip key={s.id} sticker={s} status={catalog[String(s.id)]} />)}
          </div>
        </details>
      )}

      {/* Países */}
      {paisesList.map(({ pais, stickers }) => {
        const filtered = filterCatalog(stickers)
        if (filter !== 'todos' && filtered.length === 0) return null
        return filter === 'todos'
          ? <PaisBlock key={pais} pais={pais} stickers={stickers} catalog={catalog} />
          : (
            <div key={pais} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gris-300)', marginBottom: 6, paddingLeft: 4 }}>{pais}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 5 }}>
                {filtered.map(s => <StickerChip key={s.id} sticker={s} status={catalog[String(s.id)]} />)}
              </div>
            </div>
          )
      })}

      {/* Campeones + Primera vez + Troquelados */}
      {[
        { title: '🏆 Campeones del Mundo (569–580)', stickers: CAMPEONES },
        { title: '🌟 Primera vez (581–584)', stickers: PRIMERA_VEZ },
        { title: '🔶 Troquelados (T-1 a T-48)', stickers: TROQUELADOS },
      ].map(({ title, stickers }) => {
        const filtered = filterCatalog(stickers)
        if (filter !== 'todos' && filtered.length === 0) return null
        return (
          <details key={title} style={{ marginBottom: 16 }}>
            <summary style={{ background: 'var(--negro-4)', border: '1px solid rgba(255,255,255,0.07)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--verde)', fontWeight: 700, fontSize: 13, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
              <span>{title}</span>
              <span style={{ color: 'var(--gris-300)', fontWeight: 400 }}>{(filter === 'todos' ? stickers : filtered).length} cromos</span>
            </summary>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 5, marginTop: 8 }}>
              {(filter === 'todos' ? stickers : filtered).map(s => <StickerChip key={s.id} sticker={s} status={catalog[String(s.id)]} />)}
            </div>
          </details>
        )
      })}

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: 32, padding: '20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <p style={{ color: 'var(--gris-300)', fontSize: 13, marginBottom: 12 }}>
          ¿Quieres registrar tu propio álbum?
        </p>
        <Link to="/registro" className="btn btn-primary">Crear cuenta gratis</Link>
      </div>
    </div>
  )
}
