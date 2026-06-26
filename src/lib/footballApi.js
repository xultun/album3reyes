// football-data.org con proxy CORS
// El proxy reenvía la request al servidor real evitando el bloqueo del navegador

const FD_TOKEN = '898839288bc1474bac83339edc569780'
const FD_BASE = 'https://api.football-data.org/v4'
const WC = 'WC'

// Intentamos primero sin proxy, si falla usamos el proxy
async function fdFetch(path) {
  const url = `${FD_BASE}${path}`
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`

  // Primer intento: directo
  try {
    const res = await fetch(url, {
      headers: { 'X-Auth-Token': FD_TOKEN }
    })
    if (res.ok) return await res.json()
  } catch {}

  // Segundo intento: con proxy CORS
  try {
    const res = await fetch(proxyUrl, {
      headers: { 'X-Auth-Token': FD_TOKEN }
    })
    if (res.ok) return await res.json()
  } catch {}

  // Tercer intento: proxy alternativo
  try {
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`, {
      headers: { 'X-Auth-Token': FD_TOKEN }
    })
    if (res.ok) return await res.json()
  } catch {}

  return null
}

export async function getLiveMatches() {
  const data = await fdFetch(`/competitions/${WC}/matches?status=LIVE`)
  return data?.matches || []
}

export async function getTodayMatches() {
  const today = new Date().toISOString().split('T')[0]
  const data = await fdFetch(`/competitions/${WC}/matches?dateFrom=${today}&dateTo=${today}`)
  return data?.matches || []
}

export async function getRecentMatches() {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const data = await fdFetch(`/competitions/${WC}/matches?status=FINISHED&dateFrom=${weekAgo}&dateTo=${today}`)
  return data?.matches?.reverse() || []
}

export async function getUpcomingMatches() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const data = await fdFetch(`/competitions/${WC}/matches?status=TIMED&dateFrom=${tomorrow}&dateTo=${weekLater}`)
  return data?.matches || []
}

export async function getStandings() {
  const data = await fdFetch(`/competitions/${WC}/standings`)
  return data?.standings || []
}

export async function getAllMatchData() {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  // Una sola llamada para todos los partidos del rango
  const [allMatches, standings] = await Promise.all([
    fdFetch(`/competitions/${WC}/matches?dateFrom=${weekAgo}&dateTo=${weekLater}`),
    fdFetch(`/competitions/${WC}/standings`),
  ])

  const matches = allMatches?.matches || []

  return {
    live: matches.filter(m => ['IN_PLAY','HALFTIME','PAUSED','EXTRA_TIME','PENALTY_SHOOTOUT'].includes(m.status)),
    today: matches.filter(m => m.utcDate?.startsWith(today) && ['TIMED','SCHEDULED'].includes(m.status)),
    recent: matches.filter(m => m.status === 'FINISHED').reverse().slice(0, 8),
    upcoming: matches.filter(m => !m.utcDate?.startsWith(today) && ['TIMED','SCHEDULED'].includes(m.status)).slice(0, 8),
    standings: standings?.standings || [],
  }
}
