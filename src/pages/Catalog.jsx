import { useState, useMemo, useCallback } from 'react'
import { useStore } from '../lib/store'
import {
  ALL_STICKERS, GROUPS, TROQUELADOS,
  ESTADIOS, CAMPEONES, PRIMERA_VEZ, getMVPs
} from '../lib/albumData'
import toast from 'react-hot-toast'

const STATUS_CYCLE = [null, 'tengo', 'falta', 'repetida']
const STATUS_LABELS = { tengo: '✓ Tengo', falta: '✗ Falta', repetida: '★ Repetida', null: 'Sin marcar' }

function StickerCard({ sticker, status, onToggle }) {
  const statusClass = status?.status || ''
  return (
    <div
      className={`sticker-card ${statusClass} ${sticker.special ? 'special' : ''} ${sticker.isMVP ? 'mvp' : ''}`}
      onClick={() => onToggle(sticker.id)}
      title={`${sticker.label} — Click para cambiar estado`}
    >
      {status && <div className={`sticker-status-dot ${status.status}`} />}
      <div className="sticker-id">
        {String(sticker.id).startsWith('T-') || ['A','B','C','D','E','F'].includes(String(sticker.id))
          ? sticker.id : `#${sticker.id}`}
      </div>
      <div className="sticker-label">
        {sticker.isMVP && <span style={{ color: 'var(--dorado)', fontSize: 9 }}>MVP ★ </span>}
        {sticker.label.replace(`${sticker.pais} — `, '')}
      </div>
      {status?.cantidad > 1 && (
        <span style={{ fontSize: 9, background: 'var(--dorado)', color: 'white', borderRadius: 20, padding: '1px 5px' }}>
          x{status.cantidad}
        </span>
      )}
    </div>
  )
}

function GroupSection({ groupKey, stickers, catalog, onToggle }) {
  const stats = {
    tengo: stickers.filter(s => catalog[String(s.id)]?.status === 'tengo').length,
    total: stickers.length,
  }
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="group-header">
        <div className="group-badge">{groupKey}</div>
        Grupo {groupKey}
        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 400, opacity: 0.8 }}>
          {stats.tengo}/{stats.total}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 6 }}>
        {stickers.map(s => (
          <StickerCard key={s.id} sticker={s} status={catalog[String(s.id)]} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}

function SectionBlock({ title, emoji, stickers, catalog, onToggle }) {
  const [collapsed, setCollapsed] = useState(false)
  const stats = {
    tengo: stickers.filter(s => catalog[String(s.id)]?.status === 'tengo').length,
    total: stickers.length,
  }
  return (
    <div style={{ marginBottom: 32 }}>
      <div
        className="group-header"
        style={{ cursor: 'pointer', background: 'var(--gris-900)' }}
        onClick={() => setCollapsed(!collapsed)}
      >
        <span>{emoji}</span> {title}
        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 400 }}>
          {stats.tengo}/{stats.total} {collapsed ? '▼' : '▲'}
        </span>
      </div>
      {!collapsed && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 6, marginTop: 8 }}>
          {stickers.map(s => (
            <StickerCard key={s.id} sticker={s} status={catalog[String(s.id)]} onToggle={onToggle} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Catalog() {
  const { catalog, setStickerStatus, getCatalogStats } = useStore()
  const [view, setView] = useState('grupos') // 'grupos' | 'todos' | 'faltan' | 'repetidas'
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')

  const stats = getCatalogStats()
  const totalAlbum = ALL_STICKERS.length
  const progress = totalAlbum > 0 ? Math.round((stats.tengo / totalAlbum) * 100) : 0

  // Ciclar estado al hacer click
  const handleToggle = useCallback(async (stickerId) => {
    const current = catalog[String(stickerId)]
    const currentIdx = STATUS_CYCLE.indexOf(current?.status || null)
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length]

    await setStickerStatus(stickerId, nextStatus)
    if (nextStatus) toast.success(STATUS_LABELS[nextStatus], { duration: 1000 })
  }, [catalog, setStickerStatus])

  // Stickers filtrados según la vista activa
  const filteredStickers = useMemo(() => {
    let stickers = ALL_STICKERS

    if (view === 'faltan') stickers = stickers.filter(s => catalog[String(s.id)]?.status === 'falta')
    if (view === 'repetidas') stickers = stickers.filter(s => catalog[String(s.id)]?.status === 'repetida')
    if (view === 'tengo') stickers = stickers.filter(s => catalog[String(s.id)]?.status === 'tengo')

    if (selectedGroup !== 'all') stickers = stickers.filter(s => s.grupo === selectedGroup)
    if (search) {
      const q = search.toLowerCase()
      stickers = stickers.filter(s =>
        String(s.id).includes(q) || s.label.toLowerCase().includes(q) || s.pais?.toLowerCase().includes(q)
      )
    }
    return stickers
  }, [catalog, view, search, selectedGroup])

  // Stickers agrupados por grupo para la vista principal
  const stickersByGroup = useMemo(() => {
    const grouped = {}
    const groupStickers = ALL_STICKERS.filter(s => s.grupo)
    Object.keys(GROUPS).forEach(g => {
      grouped[g] = groupStickers.filter(s => s.grupo === g)
    })
    return grouped
  }, [])

  return (
    <div className="main-content">
      {/* Stats header */}
      <div className="section-header">
        <h1 className="section-title">Mi <span>Álbum</span></h1>
        <p className="section-subtitle">
          Click en un cromo para marcarlo: Sin marcar → Tengo → Falta → Repetida
        </p>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--verde)' }}>{progress}%</div>
          <div className="stat-label">Completado</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="stat-card stat-tengo">
          <div className="stat-value">{stats.tengo}</div>
          <div className="stat-label">Tengo</div>
        </div>
        <div className="stat-card stat-falta">
          <div className="stat-value">{stats.falta}</div>
          <div className="stat-label">Me faltan</div>
        </div>
        <div className="stat-card stat-repetida">
          <div className="stat-value">{stats.repetida}</div>
          <div className="stat-label">Repetidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--gris-500)' }}>{totalAlbum - stats.tengo - stats.falta}</div>
          <div className="stat-label">Sin marcar</div>
        </div>
      </div>

      {/* Leyenda de colores */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, fontSize: 12 }}>
        {[
          { color: 'var(--verde)', label: '✓ Tengo' },
          { color: 'var(--rojo)', label: '✗ Me falta' },
          { color: 'var(--dorado)', label: '★ Repetida' },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} />
            {label}
          </span>
        ))}
        <span style={{ color: 'var(--gris-500)' }}>| Sin marcar = gris</span>
      </div>

      {/* Controles */}
      <div className="catalog-controls" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="catalog-tabs tabs" style={{ flex: 'none' }}>
          {[
            { key: 'grupos', label: 'Por grupos' },
            { key: 'todos', label: 'Todos' },
            { key: 'tengo', label: `Tengo (${stats.tengo})` },
            { key: 'faltan', label: `Faltan (${stats.falta})` },
            { key: 'repetidas', label: `Repetidas (${stats.repetida})` },
          ].map(t => (
            <button key={t.key} className={`tab ${view === t.key ? 'active' : ''}`} onClick={() => setView(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <input
          className="input"
          placeholder="Buscar por número, país o nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />

        {(view === 'todos' || view === 'grupos') && (
          <select className="select" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} style={{ maxWidth: 140 }}>
            <option value="all">Todos los grupos</option>
            {Object.keys(GROUPS).map(g => <option key={g} value={g}>Grupo {g}</option>)}
          </select>
        )}
      </div>

      {/* Contenido del álbum */}
      {view === 'grupos' ? (
        <>
          {/* Estadios (1-16) */}
          <SectionBlock
            title="Estadios del Mundial 2026"
            emoji="🏟️"
            stickers={ESTADIOS}
            catalog={catalog}
            onToggle={handleToggle}
          />
          {/* Grupos A-L con plantillas (17-568) */}
          {Object.keys(GROUPS)
            .filter(g => selectedGroup === 'all' || g === selectedGroup)
            .map(g => (
              <GroupSection
                key={g}
                groupKey={g}
                stickers={stickersByGroup[g] || []}
                catalog={catalog}
                onToggle={handleToggle}
              />
            ))
          }
          {/* Campeones del Mundo (569-580) */}
          <SectionBlock
            title="Campeones del Mundo (1978–2022)"
            emoji="🏆"
            stickers={CAMPEONES}
            catalog={catalog}
            onToggle={handleToggle}
          />
          {/* Primera vez en el Mundial (581-584) */}
          <SectionBlock
            title="Primera Vez en el Mundial"
            emoji="🌟"
            stickers={PRIMERA_VEZ}
            catalog={catalog}
            onToggle={handleToggle}
          />
          {/* Escudos Troquelados (T-1 a T-48) */}
          <SectionBlock
            title="Escudos Troquelados (T-1 a T-48)"
            emoji="🔶"
            stickers={TROQUELADOS}
            catalog={catalog}
            onToggle={handleToggle}
          />
        </>
      ) : (
        <div>
          <p style={{ color: 'var(--gris-500)', fontSize: 13, marginBottom: 16 }}>
            {filteredStickers.length} cromos
          </p>
          {filteredStickers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">Sin resultados</div>
              <div className="empty-state-desc">Cambia los filtros o la búsqueda</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 6 }}>
              {filteredStickers.map(s => (
                <StickerCard key={s.id} sticker={s} status={catalog[String(s.id)]} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
