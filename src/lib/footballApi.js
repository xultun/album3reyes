const FD_TOKEN = '898839288bc1474bac83339edc569780'
const FD_BASE = 'https://api.football-data.org/v4'
const WC = 'WC'

// Proxy que funciona con GitHub Pages
const PROXY = 'https://api.allorigins.win/raw?url='

async function fdFetch(path) {
  const url = `${FD_BASE}${path}`
  
  // Intentar con allorigins (más confiable para GitHub Pages)
  try {
    const proxyUrl = `${PROXY}${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl, {
      headers: { 'X-Auth-Token': FD_TOKEN }
    })
    if (res.ok) {
      const text = await res.text()
      return JSON.parse(text)
    }
  } catch {}

  // Segundo intento con corsproxy
  try {
    const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
      headers: { 'X-Auth-Token': FD_TOKEN }
    })
    if (res.ok) return await res.json()
  } catch {}

  // Tercer intento con thingproxy
  try {
    const res = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`, {
      headers: { 'X-Auth-Token': FD_TOKEN }
    })
    if (res.ok) return await res.json()
  } catch {}

  return null
}

export async function getAllMatchData() {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

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
