import {
  doc, setDoc, getDoc, updateDoc, collection,
  query, where, getDocs, addDoc, deleteDoc,
  serverTimestamp, orderBy, limit, getCountFromServer
} from 'firebase/firestore'
import { db } from './firebase'

// ── USUARIOS ──────────────────────────────────────────────────

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
    lastActivity: serverTimestamp(),
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data() : null
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })
}

// Ranking global: top usuarios por cromos completados
export async function getLeaderboard(maxUsers = 10) {
  try {
    const snap = await getDocs(query(
      collection(db, 'users'),
      orderBy('catalogStats.tengo', 'desc'),
      limit(maxUsers)
    ))
    return snap.docs.map(d => d.data())
  } catch {
    // Si el índice no existe aún, devuelve vacío
    return []
  }
}

// Usuarios recientes (para "nuevos miembros")
export async function getRecentUsers(maxUsers = 6) {
  try {
    const snap = await getDocs(query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(maxUsers)
    ))
    return snap.docs.map(d => d.data())
  } catch {
    return []
  }
}

// Total de usuarios registrados
export async function getTotalUsers() {
  try {
    const snap = await getCountFromServer(collection(db, 'users'))
    return snap.data().count
  } catch {
    return 0
  }
}

// ── CATÁLOGO ──────────────────────────────────────────────────

export async function getUserCatalog(uid) {
  const colRef = collection(db, 'catalogs', uid, 'stickers')
  const snap = await getDocs(colRef)
  const catalog = {}
  snap.forEach(d => { catalog[d.id] = d.data() })
  return catalog
}

export async function updateStickerStatus(uid, stickerId, status, cantidad = 1) {
  const ref = doc(db, 'catalogs', uid, 'stickers', String(stickerId))
  
  if (status === null) {
    // Borrar el documento si status es null
    await deleteDoc(ref)
  } else {
    await setDoc(ref, {
      stickerId: String(stickerId),
      status,
      cantidad,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  // Log actividad (no crítico, no bloquea el guardado)
  logActivity(uid, {
    type: 'sticker',
    stickerId: String(stickerId),
    status,
  }).catch(() => {})
}

export async function updateMultipleStickers(uid, updates) {
  const promises = updates.map(({ stickerId, status, cantidad = 1 }) =>
    updateStickerStatus(uid, stickerId, status, cantidad)
  )
  await Promise.all(promises)
}

export async function recalcCatalogStats(uid, catalog) {
  const tengo = Object.values(catalog).filter(s => s.status === 'tengo').length
  const faltan = Object.values(catalog).filter(s => s.status === 'falta').length
  const repetidas = Object.values(catalog).filter(s => s.status === 'repetida').length
  await updateDoc(doc(db, 'users', uid), {
    catalogStats: { total: tengo + faltan + repetidas, tengo, faltan, repetidas },
    updatedAt: serverTimestamp(),
  })
}

// ── ACTIVIDAD ─────────────────────────────────────────────────
// Guarda las últimas acciones del usuario (para feed de actividad)

export async function logActivity(uid, activity) {
  try {
    await addDoc(collection(db, 'activity'), {
      uid,
      ...activity,
      createdAt: serverTimestamp(),
    })
  } catch {}
}

// Feed de actividad global (para el dashboard social)
export async function getGlobalFeed(maxItems = 20) {
  try {
    const snap = await getDocs(query(
      collection(db, 'activity'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    ))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

// ── MARKETPLACE ───────────────────────────────────────────────

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

  // Log actividad
  await logActivity(uid, {
    type: 'listing',
    listingType: data.type,
    stickers: data.stickers.slice(0, 5),
    displayName: user.displayName,
  })

  return ref.id
}

export async function getListings(filters = {}) {
  try {
    const constraints = [where('activo', '==', true)]
    if (filters.type) constraints.push(where('type', '==', filters.type))
    if (filters.uid) constraints.push(where('uid', '==', filters.uid))
    constraints.push(orderBy('createdAt', 'desc'))
    if (filters.limit) constraints.push(limit(filters.limit))

    const snap = await getDocs(query(collection(db, 'listings'), ...constraints))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    // Si falla por índice faltante, intentar sin orderBy
    try {
      const constraints2 = [where('activo', '==', true)]
      if (filters.uid) constraints2.push(where('uid', '==', filters.uid))
      const snap2 = await getDocs(query(collection(db, 'listings'), ...constraints2))
      const results = snap2.docs.map(d => ({ id: d.id, ...d.data() }))
      return results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    } catch {
      return []
    }
  }
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
    activo: false, updatedAt: serverTimestamp(),
  })
}

export async function updateListing(listingId, data) {
  await updateDoc(doc(db, 'listings', listingId), {
    ...data, updatedAt: serverTimestamp(),
  })
}

// ── MATCHES ───────────────────────────────────────────────────

export async function findMatches(uid) {
  const myCatalog = await getUserCatalog(uid)
  const missingIds = Object.entries(myCatalog)
    .filter(([, v]) => v.status === 'falta').map(([k]) => k)

  if (!missingIds.length) return []

  const chunkSize = 10
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

// ── COMENTARIOS / MURO SOCIAL ─────────────────────────────────
// Colección: comments/{commentId}
// { uid, displayName, pais, texto, createdAt }

export async function postComment(uid, texto) {
  const userSnap = await getDoc(doc(db, 'users', uid))
  const user = userSnap.data()
  await addDoc(collection(db, 'comments'), {
    uid,
    displayName: user.displayName,
    pais: user.pais || '',
    texto: texto.trim(),
    createdAt: serverTimestamp(),
  })
}

export async function getComments(maxItems = 30) {
  try {
    const snap = await getDocs(query(
      collection(db, 'comments'),
      orderBy('createdAt', 'desc'),
      limit(maxItems)
    ))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch {
    return []
  }
}

export async function deleteComment(commentId) {
  await deleteDoc(doc(db, 'comments', commentId))
}

// ── STATS GLOBALES ────────────────────────────────────────────

export async function getGlobalStats() {
  try {
    const [usersSnap, listingsSnap] = await Promise.all([
      getCountFromServer(collection(db, 'users')),
      getCountFromServer(query(collection(db, 'listings'), where('activo', '==', true))),
    ])
    return {
      usuarios: usersSnap.data().count,
      publicaciones: listingsSnap.data().count,
    }
  } catch {
    return { usuarios: 0, publicaciones: 0 }
  }
}
