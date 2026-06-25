import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { getUserProfile, getUserCatalog, updateStickerStatus } from '../lib/db'

export const useStore = create((set, get) => ({
  // Auth
  user: null,
  userProfile: null,
  authLoading: true,

  // Catálogo personal: { [stickerId]: { status, cantidad } }
  catalog: {},
  catalogLoading: false,

  // UI
  activeSection: 'all', // para filtros del catálogo

  // ─── AUTH ───────────────────────────────────────────────
  initAuth: () => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid)
        set({ user: firebaseUser, userProfile: profile, authLoading: false })
        // Cargar catálogo automáticamente al loguear
        get().loadCatalog(firebaseUser.uid)
      } else {
        set({ user: null, userProfile: null, catalog: {}, authLoading: false })
      }
    })
    return unsub
  },

  setUserProfile: (profile) => set({ userProfile: profile }),

  // ─── CATÁLOGO ────────────────────────────────────────────
  loadCatalog: async (uid) => {
    set({ catalogLoading: true })
    const catalog = await getUserCatalog(uid)
    set({ catalog, catalogLoading: false })
  },

  /**
   * Actualizar un sticker local + Firestore
   * status: 'tengo' | 'falta' | 'repetida' | null (para borrar)
   */
  setStickerStatus: async (stickerId, status, cantidad = 1) => {
    const { user, catalog } = get()
    if (!user) return

    const id = String(stickerId)

    // Actualización optimista (UI inmediata)
    if (status === null) {
      const newCatalog = { ...catalog }
      delete newCatalog[id]
      set({ catalog: newCatalog })
    } else {
      set({ catalog: { ...catalog, [id]: { stickerId: id, status, cantidad } } })
    }

    // Persistir en Firestore
    if (status !== null) {
      await updateStickerStatus(user.uid, id, status, cantidad)
    }
  },

  getStickerStatus: (stickerId) => {
    return get().catalog[String(stickerId)] || null
  },

  // Stats calculadas del catálogo
  getCatalogStats: () => {
    const catalog = get().catalog
    const values = Object.values(catalog)
    return {
      tengo: values.filter(v => v.status === 'tengo').length,
      falta: values.filter(v => v.status === 'falta').length,
      repetida: values.filter(v => v.status === 'repetida').length,
      total: values.length,
    }
  },

  setActiveSection: (section) => set({ activeSection: section }),
}))
