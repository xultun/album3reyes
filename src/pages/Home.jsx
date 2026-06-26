import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'
import { getAllMatchData } from '../lib/footballApi'

const HOT_STICKERS = [
  { id: '47', pais: 'Argentina', jugador: 'Lionel Messi', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%292.jpg/220px-Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%292.jpg', grupo: 'B', tipo: 'MVP ★' },
  { id: '123', pais: 'Brasil', jugador: 'Vinicius Jr.', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Vinicius_Junior_2023.jpg/220px-Vinicius_Junior_2023.jpg', grupo: 'D', tipo: 'MVP ★' },
  { id: '198', pais: 'Francia', jugador: 'Kylian Mbappé', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93117_%28cropped%29.jpg/220px-2019-07-17_SG_Dynamo_Dresden_vs._Paris_Saint-Germain_by_Sandro_Halank%E2%80%93117_%28cropped%29.jpg', grupo: 'C', tipo: 'MVP ★' },
  { id: '301', pais: 'Portugal', jugador: 'Cristiano Ronaldo', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cristiano_Ronaldo_2018.jpg/220px-Cristiano_Ronaldo_2018.jpg', grupo: 'D', tipo: 'MVP ★' },
  { id: '88', pais: 'Inglaterra', jugador: 'Jude Bellingham', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Jude_Bellingham_2023_%28cropped%29.jpg/220px-Jude_Bellingham_2023_%28cropped%29.jpg', grupo: 'G', tipo: 'MVP ★' },
  { id: '215', pais: 'Corea del Sur', jugador: 'Son Heung-min', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Son_Heung-min_2019_%28cropped%29.jpg/220px-Son_Heung-min_2019_%28cropped%29.jpg', grupo: 'K', tipo: 'MVP ★' },
  { id: '334', pais: 'España', jugador: 'Lamine Yamal', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Lamine_Yamal_2024_%28cropped%29.jpg/220px-Lamine_Yamal_2024_%28cropped%29.jpg', grupo: 'D', tipo: 'MVP ★' },
  { id: '156', pais: 'Alemania', jugador: 'Jamal Musiala', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Jamal_Musiala_2022_%28cropped%29.jpg/220px-Jamal_Musiala_2022_%28cropped%29.jpg', grupo: 'E', tipo: 'MVP ★' },
]

function MatchRow({ match }) {
  const isLive = ['IN_PLAY','HALFTIME','PAUSED','EXTRA_TIME','PENALTY_SHOOTOUT'].includes(match.status)
  const isFinished = match.status === 'FINISHED'
  const homeScore = match.score?.fullTime?.home ?? match.score?.halfTime?.home
  const awayScore = match.score?.fullTime?.away ?? match.score?.halfTime?.away

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      background: isLive ? 'rgba(255,68,68,0.05)' : 'rgba(255,255,255,0.03)',
      borderRadius: 8, border: `1px solid ${isLive ? 'rgba(255,68,68,0.25)' : 'rgba(255,255,255,0.06)'}`,
    }}>
      <div style={{ minWidth: 52, textAlign: 'center' }}>
        {isLive ? (
          <span style={{ fontSize: 10, color: '#ff4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'center' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff4444', display: 'inline-block', animation: 'blink 1s infinite' }} />
            VIVO
          </span>
        ) : isFinished ? (
          <span style={{ fontSize: 10, color: 'var(--gris-500)' }}>FIN</span>
        ) : (
          <span style={{ fontSize: 10, color: 'var(--gris-300)' }}>
            {new Date(match.utcDate).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
        {match.homeTeam?.crest && <img src={match.homeTeam.crest} style={{ width: 20, height: 20, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />}
        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{match.homeTeam?.shortName || match.homeTeam?.name}</span>
      </div>
      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: 2, color: isLive ? 'var(--verde)' : isFinished ? 'white' : 'var(--gris-500)', minWidth: 52, textAlign: 'center' }}>
        {isFinished || isLive ? `${homeScore ?? 0} – ${awayScore ?? 0}` : 'VS'}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{match.awayTeam?.shortName || match.awayTeam?.name}</span>
        {match.awayTeam?.crest && <img src={match.awayTeam.crest} style={{ width: 20, height: 20, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />}
      </div>
    </div>
  )
}

function StandingMini({ group }) {
  const groupName = group.group?.replace('GROUP_', 'Grupo ') || group.stage
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--verde)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{groupName}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {group.table?.slice(0, 4).map((row, i) => (
            <tr key={row.team.id} style={{ opacity: i >= 2 ? 0.6 : 1 }}>
              <td style={{ padding: '3px 4px', fontSize: 11, color: i < 2 ? 'var(--verde)' : 'var(--gris-300)', fontWeight: 700, width: 14 }}>{row.position}</td>
              <td style={{ padding: '3px 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {row.team.crest && <img src={row.team.crest} style={{ width: 14, height: 14, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />}
                  <span style={{ fontSize: 11, color: 'white' }}>{row.team.shortName || row.team.name}</span>
                </div>
              </td>
              <td style={{ padding: '3px 4px', fontSize: 12, fontWeight: 700, color: i < 2 ? 'var(--verde)' : 'var(--gris-300)', textAlign: 'right' }}>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Home() {
  const { user, getCatalogStats } = useStore()
  const stats = user ? getCatalogStats() : null

  const [matchData, setMatchData] = useState({ live: [], today: [], recent: [], upcoming: [], standings: [] })
  const [apiStatus, setApiStatus] = useState('loading')
  const [activeTab, setActiveTab] = useState('hoy')
  const [activeGroupPage, setActiveGroupPage] = useState(0)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 60000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    setApiStatus('loading')
    try {
      const data = await getAllMatchData()
      setMatchData(data)
      const hasData = data.live.length + data.today.length + data.recent.length + data.upcoming.length > 0
      setApiStatus(hasData ? 'ok' : 'soon')
    } catch {
      setApiStatus('soon')
    }
  }

  const { live, today, recent, upcoming, standings } = matchData
  const hasLive = live.length > 0
  const allToday = [...live, ...today]
  const GROUPS_PER_PAGE = 4
  const groupPages = Math.ceil(standings.length / GROUPS_PER_PAGE)
  const visibleGroups = standings.slice(activeGroupPage * GROUPS_PER_PAGE, (activeGroupPage + 1) * GROUPS_PER_PAGE)

  return (
    <div style={{ background: 'var(--negro)' }}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>

      {/* LIVE TICKER */}
      {hasLive && (
        <div style={{ background: 'rgba(255,68,68,0.1)', borderBottom: '1px solid rgba(255,68,68,0.25)', padding: '7px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: '#ff4444', fontWeight: 700, fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff4444', display: 'inline-block', animation: 'blink 1s infinite' }} />
            EN VIVO
          </span>
          <div style={{ display: 'flex', gap: 20, overflowX: 'auto', fontSize: 12 }}>
            {live.map(m => (
              <span key={m.id} style={{ whiteSpace: 'nowrap', color: 'var(--gris-300)' }}>
                <strong style={{ color: 'white' }}>{m.homeTeam?.shortName}</strong>
                <span style={{ color: 'var(--verde)', fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, margin: '0 6px', letterSpacing: 1 }}>
                  {m.score?.fullTime?.home ?? 0}–{m.score?.fullTime?.away ?? 0}
                </span>
                <strong style={{ color: 'white' }}>{m.awayTeam?.shortName}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ background: 'linear-gradient(180deg, rgba(0,200,83,0.05) 0%, transparent 70%)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '56px 24px 48px' }}>
        <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 480px', gap: 48, alignItems: 'start' }}>

          {/* LEFT */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)', borderRadius: 20, padding: '4px 12px', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verde)', display: 'inline-block' }} />
              <span style={{ fontSize: 11, color: 'var(--verde)', fontWeight: 600, letterSpacing: 1 }}>COMUNIDAD OFICIAL DE COLECCIONISTAS</span>
            </div>
            <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 76, lineHeight: 0.88, letterSpacing: 2, color: 'white', marginBottom: 18 }}>
              ÁLBUM<br />
              <span style={{ color: 'var(--verde)', textShadow: '0 0 40px rgba(0,200,83,0.5)' }}>3 REYES</span><br />
              <span style={{ color: 'var(--dorado)', textShadow: '0 0 40px rgba(255,215,0,0.4)' }}>MUNDIAL</span>
            </h1>
            <p style={{ color: 'var(--gris-300)', fontSize: 15, lineHeight: 1.7, maxWidth: 420, marginBottom: 28 }}>
              Registra tu colección, intercambia repetidas y conecta con coleccionistas de todo el mundo.
            </p>

            {user && stats ? (
              <div>
                <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
                  {[
                    { val: stats.tengo, label: 'Tengo', color: 'var(--verde)' },
                    { val: stats.falta, label: 'Faltan', color: 'var(--rojo)' },
                    { val: stats.repetida, label: 'Repetidas', color: 'var(--dorado)' },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 38, color: s.color, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: 'var(--gris-300)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link to="/dashboard" className="btn btn-primary btn-lg">Mi dashboard →</Link>
                  <Link to="/catalogo" className="btn btn-ghost btn-lg">Mi álbum</Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
                <Link to="/mercado" className="btn btn-ghost btn-lg">Ver mercado</Link>
              </div>
            )}

            <div style={{ display: 'flex', gap: 28, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 28 }}>
              {[['584+','Cromos'],['48','Equipos'],['12','Grupos'],['T-48','Troquelados']].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 22, color: 'var(--dorado)', letterSpacing: 1 }}>{n}</div>
                  <div style={{ fontSize: 10, color: 'var(--gris-300)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Matches panel */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>⚽ Mundial 2026</span>
              {hasLive && <span style={{ background: 'var(--rojo)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{live.length} EN VIVO</span>}
              {apiStatus === 'loading' && <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>Cargando...</span>}
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { key: 'hoy', label: hasLive ? `🔴 Vivo (${live.length})` : `Hoy (${allToday.length})` },
                { key: 'proximos', label: `Próximos (${upcoming.length})` },
                { key: 'resultados', label: `Resultados (${recent.length})` },
                { key: 'posiciones', label: 'Tabla' },
              ].map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                  flex: 1, padding: '9px 4px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 500, transition: 'all 0.15s',
                  color: activeTab === t.key ? 'var(--verde)' : 'var(--gris-300)',
                  borderBottom: activeTab === t.key ? '2px solid var(--verde)' : '2px solid transparent',
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 14, maxHeight: 380, overflowY: 'auto' }}>
              {apiStatus === 'loading' ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--gris-300)', fontSize: 13 }}>
                  <div style={{ fontSize: 24, marginBottom: 8, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚽</div>
                  <br />Conectando con la API...
                </div>
              ) : apiStatus === 'soon' ? (
                <div style={{ textAlign: 'center', padding: 24 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🗓️</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 6 }}>Mundial 2026 — ¡Muy pronto!</div>
                  <div style={{ fontSize: 12, color: 'var(--gris-300)', lineHeight: 1.6 }}>
                    El torneo arranca el <strong style={{ color: 'var(--dorado)' }}>11 de junio de 2026</strong>.<br />
                    Los partidos aparecerán aquí en tiempo real.
                  </div>
                  <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--dorado)', fontWeight: 600 }}>🇺🇸 🇨🇦 🇲🇽 EUA, Canadá y México</div>
                    <div style={{ fontSize: 11, color: 'var(--gris-300)', marginTop: 3 }}>48 equipos · 104 partidos · 16 sedes</div>
                  </div>
                </div>
              ) : activeTab === 'hoy' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {allToday.length === 0
                    ? <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>No hay partidos hoy</p>
                    : allToday.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              ) : activeTab === 'proximos' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.length === 0
                    ? <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin próximos partidos</p>
                    : upcoming.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              ) : activeTab === 'resultados' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recent.length === 0
                    ? <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Sin resultados recientes</p>
                    : recent.map(m => <MatchRow key={m.id} match={m} />)}
                </div>
              ) : (
                <div>
                  {standings.length === 0
                    ? <p style={{ color: 'var(--gris-300)', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Posiciones disponibles al iniciar el torneo</p>
                    : <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          {visibleGroups.map((g, i) => <StandingMini key={i} group={g} />)}
                        </div>
                        {groupPages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
                            {Array.from({ length: groupPages }).map((_, i) => (
                              <button key={i} onClick={() => setActiveGroupPage(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', background: activeGroupPage === i ? 'var(--verde)' : 'var(--gris-600)' }} />
                            ))}
                          </div>
                        )}
                      </>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CROMOS MÁS BUSCADOS */}
      <div style={{ padding: '52px 24px', maxWidth: 'var(--max-w)', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 className="section-title">Cromos más <span>buscados</span></h2>
            <p className="section-subtitle">Los MVPs más cotizados del álbum</p>
          </div>
          <Link to="/catalogo" style={{ fontSize: 13, color: 'var(--verde)', textDecoration: 'none' }}>Ver álbum completo →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {HOT_STICKERS.map(s => (
            <div key={s.id} style={{ background: 'var(--negro-3)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(255,215,0,0.15)'; e.currentTarget.style.borderColor='rgba(255,215,0,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(255,215,0,0.2)' }}
            >
              <div style={{ height: 160, background: 'linear-gradient(135deg, rgba(0,200,83,0.1), rgba(255,215,0,0.05))', position: 'relative', overflow: 'hidden' }}>
                <img src={s.img} alt={s.jugador} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} onError={e => e.target.style.display='none'} />
                <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: 'var(--dorado)', fontWeight: 700 }}>#{s.id}</div>
                <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg,#c9a800,#ffd700)', borderRadius: 4, padding: '2px 6px', fontSize: 9, color: '#000', fontWeight: 700 }}>{s.tipo}</div>
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 2 }}>{s.jugador}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--gris-300)' }}>{s.pais}</span>
                  <span style={{ fontSize: 10, background: 'rgba(0,200,83,0.1)', color: 'var(--verde)', border: '1px solid rgba(0,200,83,0.3)', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>G-{s.grupo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '0 24px 52px', maxWidth: 'var(--max-w)', margin: '0 auto' }}>
        <h2 className="section-title" style={{ marginBottom: 20 }}>Todo para tu <span>colección</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { icon: '📋', title: 'Catálogo digital', desc: 'Marca cada cromo: Tengo, Falta o Repetida. Progreso por grupo en tiempo real.', color: 'var(--verde)' },
            { icon: '🔄', title: 'Intercambios', desc: 'Publica repetidas. El sistema detecta automáticamente quién tiene lo que te falta.', color: '#a855f7' },
            { icon: '💰', title: 'Compra y venta', desc: 'Vende tus repetidas. Sin comisiones, el trato se cierra directo por WhatsApp.', color: 'var(--dorado)' },
            { icon: '🏆', title: 'Ranking social', desc: 'Compite con otros coleccionistas. Sube en el ranking mientras completas tu álbum.', color: '#0088ff' },
          ].map(f => (
            <div key={f.title} className="card" style={{ padding: 20, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=f.color+'33'; e.currentTarget.style.transform='translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='none' }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: 'white' }}>{f.title}</div>
              <div style={{ color: 'var(--gris-300)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {!user && (
        <div style={{ padding: '0 24px 60px', maxWidth: 'var(--max-w)', margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.07) 0%, rgba(255,215,0,0.04) 100%)', border: '1px solid rgba(0,200,83,0.18)', borderRadius: 20, padding: '44px 40px', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 42, color: 'white', marginBottom: 8, letterSpacing: 1 }}>¿Ya tienes el álbum?</h2>
            <p style={{ color: 'var(--gris-300)', marginBottom: 24, fontSize: 15 }}>Crea tu cuenta gratis y empieza a registrar tu colección</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/registro" className="btn btn-primary btn-lg">Crear cuenta gratis</Link>
              <Link to="/login" className="btn btn-ghost btn-lg">Ya tengo cuenta</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
