import { useState, useEffect, useRef } from 'react'
import { useStore } from '../lib/store'
import { getListings, createListing, deactivateListing, findMatches } from '../lib/db'
import { ALL_STICKERS } from '../lib/albumData'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'
import toast from 'react-hot-toast'

function WhatsAppButton({ numero, mensaje }) {
  if (!numero) return null
  const url = `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      WhatsApp
    </a>
  )
}

function ListingCard({ listing, isOwn, onDeactivate }) {
  const initials = listing.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const typeLabels = { venta: '💰 Venta', intercambio: '🔄 Intercambio', busqueda: '🔍 Busco' }
  const typeColors = { venta: 'badge-venta', intercambio: 'badge-intercambio', busqueda: 'badge-falta' }

  const waMsg = listing.type === 'venta'
    ? `Hola ${listing.displayName}, vi tu publicación en el Álbum 3 Reyes y me interesa comprar los cromos: ${listing.stickers.join(', ')} por ${listing.precio} ${listing.moneda}`
    : `Hola ${listing.displayName}, vi que tienes los cromos ${listing.stickers.join(', ')} en el Álbum 3 Reyes. ¿Podemos hacer un intercambio?`

  return (
    <div className="card listing-card">
      {/* Foto del sticker si existe */}
      {listing.photoUrl && (
        <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', height: 160, background: 'var(--negro-4)' }}>
          <img src={listing.photoUrl} alt="Foto del cromo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div className="listing-header">
        <div className="listing-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            {listing.displayName}
            {listing.pais && <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>🌍 {listing.pais}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            <span className={`badge ${typeColors[listing.type]}`}>{typeLabels[listing.type]}</span>
            {listing.precio && (
              <span style={{ fontSize: 12, color: 'var(--dorado)', fontWeight: 600 }}>
                {listing.moneda} {listing.precio}
              </span>
            )}
          </div>
        </div>
        {isOwn && (
          <button className="btn btn-danger btn-sm" onClick={() => onDeactivate(listing.id)}>
            Eliminar
          </button>
        )}
      </div>

      <div className="listing-stickers">
        {listing.stickers.map(id => (
          <span key={id} className="sticker-pill">#{id}</span>
        ))}
      </div>

      {listing.descripcion && (
        <p style={{ fontSize: 13, color: 'var(--gris-300)', marginTop: 8, marginBottom: 8, lineHeight: 1.5 }}>
          {listing.descripcion}
        </p>
      )}

      <div style={{ marginTop: 10 }}>
        <WhatsAppButton numero={listing.whatsapp} mensaje={waMsg} />
      </div>
    </div>
  )
}

function NewListingModal({ onClose, onCreated }) {
  const { user, catalog } = useStore()
  const [type, setType] = useState('intercambio')
  const [stickerInput, setStickerInput] = useState('')
  const [selectedStickers, setSelectedStickers] = useState([])
  const [precio, setPrecio] = useState('')
  const [moneda, setMoneda] = useState('USD')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const fileRef = useRef()

  const suggestions = type === 'intercambio'
    ? Object.entries(catalog).filter(([, v]) => v.status === 'repetida').map(([k]) => k)
    : type === 'busqueda'
    ? Object.entries(catalog).filter(([, v]) => v.status === 'falta').map(([k]) => k)
    : []

  const addSticker = (id) => {
    const sid = String(id).trim()
    if (sid && !selectedStickers.includes(sid)) {
      setSelectedStickers(prev => [...prev, sid])
    }
    setStickerInput('')
  }

  const removeSticker = (id) => setSelectedStickers(prev => prev.filter(s => s !== id))

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La foto no puede superar 5MB')
      return
    }
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStickers.length) return toast.error('Agrega al menos un cromo')
    if (!user) return

    setLoading(true)
    try {
      let photoUrl = null

      // Subir foto si hay una
      if (photo) {
        setUploadingPhoto(true)
        const photoRef = ref(storage, `listings/${user.uid}/${Date.now()}_${photo.name}`)
        await uploadBytes(photoRef, photo)
        photoUrl = await getDownloadURL(photoRef)
        setUploadingPhoto(false)
      }

      const stickerInfo = selectedStickers.map(id => {
        const s = ALL_STICKERS.find(st => String(st.id) === id)
        return s ? { id, label: s.label, pais: s.pais, grupo: s.grupo } : { id, label: `Cromo #${id}` }
      })

      await createListing(user.uid, {
        type, stickers: selectedStickers, stickerInfo,
        precio, moneda, descripcion, photoUrl
      })

      toast.success('Publicación creada')
      onCreated()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Error al publicar')
    } finally {
      setLoading(false)
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Nueva publicación</div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>

          {/* Tipo */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Tipo de publicación</label>
            <div className="tabs">
              {[['intercambio','🔄 Intercambio'],['venta','💰 Venta'],['busqueda','🔍 Busco']].map(([k,l]) => (
                <button key={k} type="button" className={`tab ${type===k?'active':''}`} onClick={() => setType(k)}>{l}</button>
              ))}
            </div>
          </div>

          {/* Precio (solo venta) */}
          {type === 'venta' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Precio</label>
                <input className="input" type="number" value={precio} onChange={e => setPrecio(e.target.value)} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label className="form-label">Moneda</label>
                <select className="select" value={moneda} onChange={e => setMoneda(e.target.value)} style={{ width: 90 }}>
                  {['USD','DOP','PEN','COP','MXN','ARS','EUR'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Cromos */}
          <div className="form-group" style={{ marginBottom: 10 }}>
            <label className="form-label">Cromos (número del álbum)</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                className="input"
                value={stickerInput}
                onChange={e => setStickerInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSticker(stickerInput) } }}
                placeholder="Ej: 47, T-12"
              />
              <button type="button" className="btn btn-secondary" onClick={() => addSticker(stickerInput)}>+</button>
            </div>
          </div>

          {/* Sugerencias del catálogo */}
          {suggestions.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--gris-300)', marginBottom: 5 }}>
                {type === 'intercambio' ? '⭐ Tus repetidas' : '❌ Tus faltantes'} (click para agregar):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 72, overflowY: 'auto' }}>
                {suggestions.slice(0, 60).map(id => (
                  <button key={id} type="button" className="sticker-pill"
                    onClick={() => addSticker(id)}
                    style={{ cursor: 'pointer', border: '1px dashed var(--verde)', color: 'var(--verde)' }}>
                    #{id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seleccionados */}
          {selectedStickers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--gris-300)', marginBottom: 5 }}>
                Seleccionados ({selectedStickers.length}) — click para quitar:
              </div>
              <div className="listing-stickers">
                {selectedStickers.map(id => (
                  <span key={id} className="sticker-pill"
                    onClick={() => removeSticker(id)}
                    style={{ cursor: 'pointer', borderColor: 'var(--rojo)', color: 'var(--rojo)' }}>
                    #{id} ✕
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Foto del cromo */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">📸 Foto del cromo (opcional)</label>
            <input
              type="file"
              accept="image/*"
              ref={fileRef}
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            {photoPreview ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={photoPreview} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--gris-600)' }} />
                <button type="button" onClick={() => { setPhoto(null); setPhotoPreview(null) }}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', fontSize: 13 }}>
                  ✕
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current.click()}
                style={{ width: '100%', padding: '20px', border: '2px dashed var(--gris-600)', borderRadius: 8, background: 'transparent', color: 'var(--gris-300)', cursor: 'pointer', fontSize: 13, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--verde)'; e.currentTarget.style.color = 'var(--verde)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gris-600)'; e.currentTarget.style.color = 'var(--gris-300)' }}>
                📷 Subir foto del cromo
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>JPG, PNG · máx 5MB</div>
              </button>
            )}
          </div>

          {/* Descripción */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Descripción (opcional)</label>
            <textarea className="textarea" rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: En buen estado, envío por Zoom..." />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {uploadingPhoto ? 'Subiendo foto...' : loading ? 'Publicando...' : 'Publicar'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Marketplace() {
  const { user } = useStore()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [matches, setMatches] = useState([])

  const loadListings = async () => {
    setLoading(true)
    try {
      const data = await getListings({ type: filter === 'all' ? undefined : filter })
      setListings(data)
    } catch (err) {
      console.error(err)
      toast.error('Error cargando publicaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadListings() }, [filter])

  useEffect(() => {
    if (user) findMatches(user.uid).then(setMatches).catch(() => {})
  }, [user])

  const handleDeactivate = async (id) => {
    await deactivateListing(id)
    toast.success('Publicación eliminada')
    loadListings()
  }

  const myListings = listings.filter(l => l.uid === user?.uid)
  const otherListings = listings.filter(l => l.uid !== user?.uid)

  return (
    <div className="main-content">
      <div className="section-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="section-title">Mercado <span>de Cromos</span></h1>
          <p className="section-subtitle">Compra, vende e intercambia con otros coleccionistas</p>
        </div>
        {user && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Publicar
          </button>
        )}
      </div>

      {/* Matches */}
      {user && matches.length > 0 && (
        <div style={{ background: 'rgba(0,200,83,0.07)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 'var(--radius)', padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: 'var(--verde)', marginBottom: 4 }}>
            🎯 {matches.length} posibles intercambios para ti
          </div>
          <p style={{ fontSize: 13, color: 'var(--gris-300)' }}>
            Hay coleccionistas con cromos que te faltan. Revisa las publicaciones de intercambio abajo.
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="filter-bar">
        {[
          { key: 'all', label: 'Todo' },
          { key: 'intercambio', label: '🔄 Intercambios' },
          { key: 'venta', label: '💰 Ventas' },
          { key: 'busqueda', label: '🔍 Buscan' },
        ].map(f => (
          <button key={f.key} className={`filter-chip ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gris-300)' }}>Cargando...</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">Sin publicaciones</div>
          <div className="empty-state-desc">
            {user ? 'Sé el primero en publicar.' : 'Inicia sesión para publicar.'}
          </div>
          {!user && <a href="/registro" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Crear cuenta</a>}
        </div>
      ) : (
        <div>
          {myListings.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--gris-300)' }}>Mis publicaciones</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {myListings.map(l => (
                  <ListingCard key={l.id} listing={l} isOwn onDeactivate={handleDeactivate} />
                ))}
              </div>
            </div>
          )}

          {otherListings.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--gris-300)' }}>
                Publicaciones ({otherListings.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {otherListings.map(l => (
                  <ListingCard key={l.id} listing={l} isOwn={false} onDeactivate={handleDeactivate} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && <NewListingModal onClose={() => setShowModal(false)} onCreated={loadListings} />}
    </div>
  )
}
