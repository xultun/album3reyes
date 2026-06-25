import { useState, useEffect } from 'react'
import { useStore } from '../lib/store'
import { updateUserProfile, getListings } from '../lib/db'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, userProfile, setUserProfile, getCatalogStats } = useStore()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ displayName: '', whatsapp: '', pais: '' })
  const [myListings, setMyListings] = useState([])
  const [saving, setSaving] = useState(false)

  const stats = getCatalogStats()
  const totalAlbum = 640 // aprox total
  const progress = Math.round((stats.tengo / totalAlbum) * 100)

  useEffect(() => {
    if (userProfile) {
      setForm({
        displayName: userProfile.displayName || '',
        whatsapp: userProfile.whatsapp || '',
        pais: userProfile.pais || '',
      })
    }
  }, [userProfile])

  useEffect(() => {
    if (user) {
      getListings({ uid: user.uid }).then(setMyListings).catch(() => {})
    }
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile(user.uid, form)
      setUserProfile({ ...userProfile, ...form })
      toast.success('Perfil actualizado')
      setEditing(false)
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initials = form.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="main-content" style={{ maxWidth: 700 }}>
      <h1 className="section-title" style={{ marginBottom: 24 }}>Mi <span>Perfil</span></h1>

      {/* Tarjeta de perfil */}
      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--verde)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{userProfile?.displayName || 'Sin nombre'}</div>
            <div style={{ color: 'var(--gris-500)', fontSize: 14 }}>{user.email}</div>
            {userProfile?.pais && <div style={{ color: 'var(--gris-500)', fontSize: 13 }}>🌍 {userProfile.pais}</div>}
          </div>
          <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancelar' : '✏️ Editar'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input className="input" value={form.displayName} onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp <span style={{ color: 'var(--gris-300)' }}>(con código de país)</span></label>
              <input className="input" value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+1 809 555 0000" />
              <span className="form-error" style={{ color: 'var(--gris-500)' }}>Este número lo verán otros para contactarte</span>
            </div>
            <div className="form-group">
              <label className="form-label">País</label>
              <select className="select" value={form.pais} onChange={e => setForm(p => ({ ...p, pais: e.target.value }))}>
                <option value="">Selecciona</option>
                {['República Dominicana','México','Colombia','Perú','Argentina','Venezuela','Ecuador','Bolivia','Chile','Uruguay','Paraguay','Brasil','España','Estados Unidos','Otro'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            <div>
              <div className="form-label" style={{ marginBottom: 2 }}>WhatsApp</div>
              <div style={{ fontSize: 14 }}>{userProfile?.whatsapp || <span style={{ color: 'var(--gris-300)' }}>No configurado</span>}</div>
            </div>
            <div>
              <div className="form-label" style={{ marginBottom: 2 }}>País</div>
              <div style={{ fontSize: 14 }}>{userProfile?.pais || <span style={{ color: 'var(--gris-300)' }}>No configurado</span>}</div>
            </div>
          </div>
        )}
      </div>

      {/* Stats del álbum */}
      <div className="card card-padded" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Mi colección</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--verde)' }}>{progress}%</div>
            <div className="stat-label">Completado</div>
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
        </div>
        <div className="progress-bar" style={{ marginTop: 16 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Mis publicaciones */}
      <div className="card card-padded">
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          Mis publicaciones ({myListings.length})
        </h2>
        {myListings.length === 0 ? (
          <p style={{ color: 'var(--gris-500)', fontSize: 14 }}>
            No tienes publicaciones activas. Ve al <a href="/mercado" style={{ color: 'var(--verde)' }}>mercado</a> para publicar.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myListings.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'var(--gris-50)', borderRadius: 'var(--radius-sm)' }}>
                <span className={`badge ${l.type === 'venta' ? 'badge-venta' : l.type === 'intercambio' ? 'badge-intercambio' : 'badge-falta'}`}>
                  {l.type}
                </span>
                <span style={{ fontSize: 13 }}>{l.stickers.slice(0, 5).map(s => `#${s}`).join(', ')}{l.stickers.length > 5 ? ` +${l.stickers.length - 5}` : ''}</span>
                {l.precio && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--verde)', marginLeft: 'auto' }}>{l.moneda} {l.precio}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
