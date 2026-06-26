// Cloudflare Worker proxy — evita CORS desde GitHub Pages
const PROXY = 'https://football-proxy.xultun18.workers.dev'
const WC = 'WC'

async function fdFetch(path) {
  try {
    const res = await fetch(`${PROXY}/competitions/${WC}${path}`)
    if (res.ok) return await res.json()
  } catch {}
  return null
}

export async function getAllMatchData() {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const weekLater = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const [allMatches, standings] = await Promise.all([
    fdFetch(`/matches?dateFrom=${weekAgo}&dateTo=${weekLater}`),
    fdFetch(`/standings`),
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
