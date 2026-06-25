import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

// API key de api-sports.io
const API_KEY = '54687b12fffc7622033dc1406570b5fc'
const API_URL = 'https://v3.football.api-sports.io'

// ID del Mundial 2026 en api-sports.io = 1 (FIFA World Cup)
// Liga ID para el Mundial es 1, temporada 2026
const WC_LEAGUE = 1
const WC_SEASON = 2026

async function fetchFixtures(params) {
  try {
    const query = new URLSearchParams({ league: WC_LEAGUE, season: WC_SEASON, ...params })
    const res = await fetch(`${API_URL}/fixtures?${query}`, {
      headers: { 'x-apisports-key': API_KEY }
    })
    const data = await res.json()
    return data.response || []
  } catch {
    return []
  }
}

function MatchCard({ fixture, compact = false }) {
  const { fixture: f, teams, goals, score } = fixture
  const isLive = ['1H','HT','2H','ET','BT','P','SUSP','INT','LIVE'].includes(f.status.short)
  const isFinished = f.status.short === 'FT'
  const isPending = f.status.short === 'NS'

  const minute = f.status.elapsed

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
        borderRadius: 8, border: isLive ? '1px solid rgba(255,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
        minWidth: 220, flexShrink: 0,
      }}>
        {isLive && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff4444', animation: 'pulse-live 1s infinite', flexShrink: 0 }} />}
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'white', textAlign: 'right' }}>{teams.home.name}</span>
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, color: isLive ? '#00c853' : isFinished ? 'white' : '#8b949e', letterSpacing: 2, minWidth: 50, textAlign: 'center' }}>
          {isFinished || isLive ? `${goals.home ?? 0}–${goals.away ?? 0}` : isPending ? new Date(f.date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : 'vs'}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, color: 'white', textAlign: 'left' }}>{teams.away.name}</span>
        {isLive && minute && <span style={{ fontSize: 11, color: '#ff6b6b', whiteSpace: 'nowrap' }}>{minute}'</span>}
      </div>
    )
  }

  return (
    <div style={{
      background: isLive ? 'rgba(255,68,68,0.06)' : 'var(--negro-3)',
      border: isLive ? '1px solid rgba(255,68,68,0.3)' : '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: '16px 20px', minWidth: 240, flexShrink: 0,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        {isLive ? (
          <span style={{ fontSize: 11, color: '#ff4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', display: 'inline-block', animation: 'pulse-live 1s infinite' }} />
            EN VIVO {minute && `${minute}'`}
          </span>
        ) : isFinished ? (
          <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>Finalizado</span>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>
            {new Date(f.date).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(f.date).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <span style={{ fontSize: 10, color: 'var(--gris-500)', background: 'var(--negro-4)', padding: '2px 6px', borderRadius: 4 }}>
          {f.venue?.name?.slice(0, 15) || 'Mundial 2026'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, textAlign: 'right' }}>
          {teams.home.logo && <img src={teams.home.logo} style={{ width: 32, height: 32, objectFit: 'contain', marginBottom: 4 }} />}
          <div style={{ fontSize: 14, fontWeight: 700 }}>{teams.home.name}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, letterSpacing: 3, color: isLive ? 'var(--verde)' : isFinished ? 'white' : 'var(--gris-300)' }}>
            {isFinished || isLive ? `${goals.home ?? 0} – ${goals.away ?? 0}` : 'VS'}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          {teams.away.logo && <img src={teams.away.logo} style={{ width: 32, height: 32, objectFit: 'contain', marginBottom: 4 }} />}
          <div style={{ fontSize: 14, fontWeight: 700 }}>{teams.away.name}</div>
        </div>
      </div>
    </div>
  )
}

function StandingRow({ team, pos }) {
  const isQ = pos <= 2
  return (
    <tr style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <td style={{ padding: '8px 10px', color: isQ ? 'var(--verde)' : 'var(--gris-300)', fontWeight: 700, fontSize: 13 }}>{pos}</td>
      <td style={{ padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {team.logo && <img src={team.logo} style={{ width: 20, height: 20, objectFit: 'contain' }} />}
          <span style={{ fontSize: 13, fontWeight: isQ ? 600 : 400, color: 'white' }}>{team.name}</span>
        </div>
      </td>
      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 13, color: 'var(--gris-300)' }}>{team.all?.played ?? 0}</td>
      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 13, color: 'var(--gris-300)' }}>{team.goalsDiff > 0 ? `+${team.goalsDiff}` : team.goalsDiff}</td>
      <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 15, fontWeight: 700, color: isQ ? 'var(--verde)' : 'var(--dorado)', fontFamily: 'Bebas Neue, sans-serif' }}>{team.points}</td>
    </tr>
  )
}

export default function Home() {
  const { user, getCatalogStats } = useStore()
  const stats = user ? getCatalogStats() : null

  const [liveMatches, setLiveMatches] = useState([])
  const [todayMatches, setTodayMatches] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [standings, setStandings] = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [activeTab, setActiveTab] = useState('hoy')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadLive, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadLive() {
    const live = await fetchFixtures({ live: 'all' })
    setLiveMatches(live)
  }

  async function loadData() {
    setLoadingMatches(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [live, todays, recent, stand] = await Promise.all([
        fetchFixtures({ live: 'all' }),
        fetchFixtures({ date: today }),
        fetchFixtures({ last: 6 }),
        fetch(`${API_URL}/standings?league=${WC_LEAGUE}&season=${WC_SEASON}`, {
          headers: { 'x-apisports-key': API_KEY }
        }).then(r => r.json()).then(d => d.response || []),
      ])
      setLiveMatches(live)
      setTodayMatches(todays.filter(f => f.fixture.status.short === 'NS'))
      setRecentMatches(recent.filter(f => f.fixture.status.short === 'FT'))
      if (stand.length > 0 && stand[0].league?.standings) {
        const groups = stand[0].league.standings
        setStandings(groups)
        setActiveGroup(0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMatches(false)
    }
  }

  const allMatches = [...liveMatches, ...todayMatches, ...recentMatches]
  const hasLive = liveMatches.length > 0

  return (
    <div style={{ background: 'var(--negro)' }}>

      {/* ── LIVE TICKER ──────────────────────────────────── */}
      {hasLive && (
        <div style={{
          background: 'rgba(255,68,68,0.08)', borderBottom: '1px solid rgba(255,68,68,0.2)',
          padding: '7px 24px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ color: '#ff4444', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', display: 'inline-block', animation: 'pulse-live 1s infinite' }} />
            EN VIVO
          </span>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', fontSize: 12 }}>
            {liveMatches.map(f => (
              <span key={f.fixture.id} style={{ whiteSpace: 'nowrap', color: 'var(--gris-300)' }}>
                <strong style={{ color: 'white' }}>{f.teams.home.name}</strong>
                <span style={{ color: 'var(--verde)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, margin: '0 6px', letterSpacing: 1 }}>
                  {f.goals.home ?? 0}–{f.goals.away ?? 0}
                </span>
                <strong style={{ color: 'white' }}>{f.teams.away.name}</strong>
                <span style={{ color: '#ff6b6b', marginLeft: 5 }}>{f.fixture.status.elapsed}'</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(0,200,83,0.06) 0%, transparent 60%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '60px 24px 0',
      }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>

            {/* Left: Title + CTA */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'var(--verde)', fontWeight: 600, letterSpacing: 1 }}>COMUNIDAD OFICIAL DE COLECCIONISTAS</span>
              </div>

              <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 72, lineHeight: 0.9, letterSpacing: 2, color: 'white', marginBottom: 16 }}>
                ÁLBUM<br />
                <span style={{ color: 'var(--verde)', textShadow: '0 0 30px rgba(0,200,83,0.5)' }}>3 REYES</span><br />
                <span style={{ color: 'var(--dorado)', textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>MUNDIAL</span>
              </h1>

              <p style={{ color: 'var(--gris-300)', fontSize: 15, lineHeight: 1.6, maxWidth: 420, marginBottom: 28 }}>
                Registra tu colección, intercambia repetidas y conecta con coleccionistas de todo el mundo.
              </p>

              {user && stats ? (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                    {[
                      { val: stats.tengo, label: 'Tengo', color: 'var(--verde)' },
                      { val: stats.falta, label: 'Faltan', color: 'var(--rojo)' },
                      { val: stats.repetida, label: 'Repetidas', color: 'var(--dorado)' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 36, color: s.color, lineHeight: 1 }}>{s.val}</div>
                        <div style={{ fontSize: 11, color: 'var(--gris-300)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Link to="/catalogo" className="btn btn-primary btn-lg">Mi álbum →</Link>
                    <Link to="/mercado" className="btn btn-ghost btn-lg">Mercado</Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Link to="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
                  <Link to="/mercado" className="btn btn-ghost btn-lg">Ver mercado</Link>
                </div>
              )}

              {/* Stats rápidas */}
              <div style={{ display: 'flex', gap: 24, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
                {[
                  { n: '584+', label: 'Cromos' },
                  { n: '48', label: 'Equipos' },
                  { n: '12', label: 'Grupos' },
                  { n: 'T-48', label: 'Troquelados' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--dorado)', letterSpacing: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: 'var(--gris-300)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Matches panel */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
              {/* Panel header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>⚽ Mundial 2026</span>
                {hasLive && (
                  <span style={{ background: 'var(--rojo)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    {liveMatches.length} EN VIVO
                  </span>
                )}
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { key: 'hoy', label: hasLive ? `🔴 En vivo (${liveMatches.length})` : 'Hoy' },
                  { key: 'resultados', label: 'Resultados' },
                  { key: 'posiciones', label: 'Posiciones' },
                ].map(t => (
                  <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                    flex: 1, padding: '10px 8px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 500, color: activeTab === t.key ? 'var(--verde)' : 'var(--gris-300)',
                    borderBottom: activeTab === t.key ? '2px solid var(--verde)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div style={{ padding: 16, maxHeight: 380, overflowY: 'auto' }}>
                {loadingMatches ? (
                  <div style={{ textAlign: 'center', padding: 32, color: 'var(--gris-300)', fontSize: 13 }}>
                    Cargando datos del Mundial...
                  </div>
                ) : activeTab === 'hoy' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...liveMatches, ...todayMatches].length === 0 ? (
                      <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No hay partidos hoy</p>
                    ) : (
                      [...liveMatches, ...todayMatches].map(f => <MatchCard key={f.fixture.id} fixture={f} compact />)
                    )}
                  </div>
                ) : activeTab === 'resultados' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recentMatches.length === 0 ? (
                      <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Sin resultados recientes</p>
                    ) : (
                      recentMatches.map(f => <MatchCard key={f.fixture.id} fixture={f} compact />)
                    )}
                  </div>
                ) : (
                  <div>
                    {standings.length === 0 ? (
                      <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Posiciones no disponibles aún</p>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                          {standings.map((group, i) => (
                            <button key={i} onClick={() => setActiveGroup(i)} style={{
                              padding: '3px 10px', border: 'none', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                              background: activeGroup === i ? 'var(--verde)' : 'var(--negro-4)',
                              color: activeGroup === i ? '#000' : 'var(--gris-300)',
                            }}>
                              {group[0]?.group?.replace('Group ', 'G') || `G${i+1}`}
                            </button>
                          ))}
                        </div>
                        {activeGroup !== null && standings[activeGroup] && (
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                {['#','Equipo','PJ','DG','PTS'].map(h => (
                                  <th key={h} style={{ fontSize: 10, color: 'var(--gris-500)', fontWeight: 600, padding: '4px 8px', textAlign: h === 'Equipo' ? 'left' : 'center', textTransform: 'uppercase' }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {standings[activeGroup].map((row, i) => (
                                <StandingRow key={row.team.id} team={{ ...row.team, all: row.all, goalsDiff: row.goalsDiff, points: row.points }} pos={i + 1} />
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <div className="main-content" style={{ paddingTop: 56 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <h2 className="section-title">Todo para tu <span>colección</span></h2>
          <p className="section-subtitle">La plataforma más completa para el Álbum 3 Reyes</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 56 }}>
          {[
            { icon: '📋', title: 'Catálogo digital', desc: 'Marca cada cromo como Tengo, Falta o Repetida. Progreso en tiempo real.', color: 'var(--verde)' },
            { icon: '🔄', title: 'Intercambios', desc: 'Publica tus repetidas y encuentra lo que te falta. Match automático.', color: '#a855f7' },
            { icon: '💰', title: 'Compra y venta', desc: 'Vende tus repetidas. El trato se cierra por WhatsApp, sin comisiones.', color: 'var(--dorado)' },
            { icon: '⚽', title: 'Mundial en vivo', desc: 'Resultados en tiempo real, posiciones y próximos partidos del Mundial 2026.', color: 'var(--rojo)' },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: 20, border: `1px solid rgba(255,255,255,0.07)`, position: 'relative', overflow: 'hidden', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + '44'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'white' }}>{f.title}</div>
              <div style={{ color: 'var(--gris-300)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: f.color, opacity: 0.04, borderRadius: '0 0 0 60px' }} />
            </div>
          ))}
        </div>

        {/* Grupos */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className="section-title">12 <span>Grupos</span></h2>
            <Link to="/catalogo" style={{ fontSize: 13, color: 'var(--verde)', textDecoration: 'none' }}>Ver álbum completo →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
              <Link key={g} to={`/catalogo`} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                background: 'var(--negro-3)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,83,0.3)'; e.currentTarget.style.background = 'rgba(0,200,83,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'var(--negro-3)' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--verde)' }}>{g}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Grupo {g}</div>
                  <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>4 equipos · ~80 cromos</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0,200,83,0.08) 0%, rgba(255,215,0,0.05) 100%)',
            border: '1px solid rgba(0,200,83,0.2)', borderRadius: 20,
            padding: '48px 40px', textAlign: 'center', marginBottom: 20,
          }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, color: 'white', marginBottom: 8, letterSpacing: 1 }}>
              ¿Ya tienes el álbum?
            </h2>
            <p style={{ color: 'var(--gris-300)', marginBottom: 24, fontSize: 15 }}>
              Crea tu cuenta gratis y empieza a registrar tu colección en segundos
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Ya tengo cuenta</Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse-live { 0%,100%{opacity:1} 50%{opacity:0.3} }
      `}</style>
    </div>
  )
}
