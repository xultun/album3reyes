import {
  doc, setDoc, getDoc, updateDoc, collection,
  query, where, getDocs, addDoc, deleteDoc,
  serverTimestamp, arrayUnion, arrayRemove, orderBy, limit
} from 'firebase/firestore'
import { db } from './firebase'

// ============================================================
// USUARIOS
// ============================================================

/**
 * Crear perfil de usuario en Firestore al registrarse
 * Estructura del documento users/{uid}:
 * {
 *   uid, displayName, email, photoURL, whatsapp,
 *   pais, createdAt, updatedAt,
 *   catalogStats: { total, tengo, faltan, repetidas }
 * }
 */
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    displayName: data.displayName || '',
    email: data.email || '',
    photoURL: data.photoURL || '',
    whatsapp: data.whatsapp || '',
    pais: data.pais || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    catalogStats: { total: 0, tengo: 0, faltan: 0, repetidas: 0 },
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ============================================================
// CATÁLOGO PERSONAL
// ============================================================

/**
 * Colección: catalogs/{uid}/stickers/{stickerId}
 * Cada documento:
 * {
 *   stickerId,        // ej: "47", "T-12", "A"
 *   status,           // 'tengo' | 'falta' | 'repetida'
 *   cantidad,         // número de copias (1, 2, 3...)
 *   updatedAt
 * }
 */
export async function getUserCatalog(uid) {
  const colRef = collection(db, 'catalogs', uid, 'stickers')
  const snap = await getDocs(colRef)
  const catalog = {}
  snap.forEach(d => { catalog[d.id] = d.data() })
  return catalog
}

export async function updateStickerStatus(uid, stickerId, status, cantidad = 1) {
  const ref = doc(db, 'catalogs', uid, 'stickers', String(stickerId))
  await setDoc(ref, {
    stickerId: String(stickerId),
    status, // 'tengo' | 'falta' | 'repetida'
    cantidad,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function updateMultipleStickers(uid, updates) {
  // updates: [{ stickerId, status, cantidad }]
  const promises = updates.map(({ stickerId, status, cantidad = 1 }) =>
    updateStickerStatus(uid, stickerId, status, cantidad)
  )
  await Promise.all(promises)
}

// Recalcular stats del catálogo
export async function recalcCatalogStats(uid, catalog) {
  const total = Object.keys(catalog).length
  const tengo = Object.values(catalog).filter(s => s.status === 'tengo').length
  const faltan = Object.values(catalog).filter(s => s.status === 'falta').length
  const repetidas = Object.values(catalog).filter(s => s.status === 'repetida').length
  await updateDoc(doc(db, 'users', uid), {
    catalogStats: { total, tengo, faltan, repetidas },
    updatedAt: serverTimestamp(),
  })
}

// ============================================================
// MARKETPLACE: PUBLICACIONES
// ============================================================

/**
 * Colección: listings/{listingId}
 * {
 *   uid, displayName, whatsapp, photoURL,
 *   type,          // 'venta' | 'intercambio' | 'busqueda'
 *   stickers,      // array de stickerId que ofrece/busca
 *   stickerInfo,   // array de { id, label, pais, grupo }
 *   descripcion,
 *   precio,        // solo si type === 'venta'
 *   moneda,        // 'USD' | 'DOP' | 'PEN' | etc
 *   activo,
 *   createdAt, updatedAt
 * }
 */
export async function createListing(uid, data) {
  const userSnap = await getDoc(doc(db, 'users', uid))
  const user = userSnap.data()

  const ref = await addDoc(collection(db, 'listings'), {
    uid,
    displayName: user.displayName,
    whatsapp: user.whatsapp,
    photoURL: user.photoURL || '',
    pais: user.pais || '',
    type: data.type,
    stickers: data.stickers,
    stickerInfo: data.stickerInfo || [],
    descripcion: data.descripcion || '',
    precio: data.precio || null,
    moneda: data.moneda || 'USD',
    activo: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getListings(filters = {}) {
  let q = collection(db, 'listings')
  const constraints = [where('activo', '==', true)]

  if (filters.type) constraints.push(where('type', '==', filters.type))
  if (filters.uid) constraints.push(where('uid', '==', filters.uid))

  constraints.push(orderBy('createdAt', 'desc'))
  if (filters.limit) constraints.push(limit(filters.limit))

  const snap = await getDocs(query(q, ...constraints))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getListingsBySticker(stickerId) {
  const snap = await getDocs(query(
    collection(db, 'listings'),
    where('stickers', 'array-contains', String(stickerId)),
    where('activo', '==', true),
    orderBy('createdAt', 'desc')
  ))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deactivateListing(listingId) {
  await updateDoc(doc(db, 'listings', listingId), {
    activo: false,
    updatedAt: serverTimestamp(),
  })
}

export async function updateListing(listingId, data) {
  await updateDoc(doc(db, 'listings', listingId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

// ============================================================
// BUSCAR MATCHES: usuarios que tienen lo que me falta y viceversa
// ============================================================

/**
 * Busca usuarios cuyo catálogo tenga repetidas que yo necesito
 * Returns array de { uid, displayName, whatsapp, matches: [stickerId] }
 */
export async function findMatches(uid) {
  const myCatalog = await getUserCatalog(uid)

  const missingIds = Object.entries(myCatalog)
    .filter(([, v]) => v.status === 'falta')
    .map(([k]) => k)

  const myRepeated = Object.entries(myCatalog)
    .filter(([, v]) => v.status === 'repetida')
    .map(([k]) => k)

  if (!missingIds.length) return []

  // Buscar listings de intercambio que tengan alguna de mis faltantes
  const chunkSize = 10 // Firestore limit para array-contains-any
  const chunks = []
  for (let i = 0; i < missingIds.length; i += chunkSize) {
    chunks.push(missingIds.slice(i, i + chunkSize))
  }

  const results = []
  for (const chunk of chunks) {
    const snap = await getDocs(query(
      collection(db, 'listings'),
      where('type', '==', 'intercambio'),
      where('activo', '==', true),
      where('stickers', 'array-contains-any', chunk)
    ))
    snap.docs.forEach(d => {
      const listing = { id: d.id, ...d.data() }
      if (listing.uid !== uid) results.push(listing)
    })
  }

  return results
}
