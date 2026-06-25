import { useState, useEffect } from 'react'

// Partidos de ejemplo (en producción usar API football-data.org o similar)
const DEMO_MATCHES = [
  { id: 1, home: 'Argentina', away: 'México', scoreH: 2, scoreA: 0, status: 'FT', minute: null },
  { id: 2, home: 'Francia', away: 'España', scoreH: 1, scoreA: 1, status: 'LIVE', minute: 67 },
  { id: 3, home: 'Brasil', away: 'Portugal', scoreH: null, scoreA: null, status: 'NS', time: '18:00' },
  { id: 4, home: 'Alemania', away: 'Países Bajos', scoreH: null, scoreA: null, status: 'NS', time: '21:00' },
  { id: 5, home: 'Colombia', away: 'Uruguay', scoreH: 3, scoreA: 1, status: 'FT', minute: null },
  { id: 6, home: 'Italia', away: 'Croacia', scoreH: 0, scoreA: 0, status: 'LIVE', minute: 34 },
]

const GROUP_STANDINGS = {
  A: [
    { pos: 1, equipo: 'Argentina', pts: 9, pj: 3, gd: '+7' },
    { pos: 2, equipo: 'México', pts: 6, pj: 3, gd: '+3' },
    { pos: 3, equipo: 'Canadá', pts: 3, pj: 3, gd: '0' },
    { pos: 4, equipo: 'Clasificado A4', pts: 0, pj: 3, gd: '-10' },
  ],
  B: [
    { pos: 1, equipo: 'Francia', pts: 7, pj: 3, gd: '+5' },
    { pos: 2, equipo: 'España', pts: 5, pj: 3, gd: '+2' },
    { pos: 3, equipo: 'Marruecos', pts: 4, pj: 3, gd: '0' },
    { pos: 4, equipo: 'Croacia', pts: 2, pj: 3, gd: '-7' },
  ],
}

function MatchCard({ match }) {
  const isLive = match.status === 'LIVE'
  const isFinished = match.status === 'FT'

  return (
    <div className="match-card">
      <div style={{ fontSize: 10, color: 'var(--gris-500)', marginBottom: 6, textAlign: 'center' }}>
        {isLive ? (
          <span className="match-live">🔴 EN VIVO — {match.minute}'</span>
        ) : isFinished ? (
          <span>Finalizado</span>
        ) : (
          <span>Hoy {match.time}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'right' }}>{match.home}</span>
        <span className="match-score">
          {isFinished || isLive
            ? `${match.scoreH} - ${match.scoreA}`
            : 'vs'
          }
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'left' }}>{match.away}</span>
      </div>
    </div>
  )
}

export default function Footer() {
  const [activeTab, setActiveTab] = useState('matches')
  const [activeGroup, setActiveGroup] = useState('A')

  const liveMatches = DEMO_MATCHES.filter(m => m.status === 'LIVE')
  const finishedMatches = DEMO_MATCHES.filter(m => m.status === 'FT')
  const upcomingMatches = DEMO_MATCHES.filter(m => m.status === 'NS')

  return (
    <footer style={{ background: 'var(--verde-oscuro)', borderTop: '3px solid var(--dorado)', marginTop: 40 }}>
      {/* Partidos en vivo ticker */}
      {liveMatches.length > 0 && (
        <div style={{
          background: 'var(--dorado)', padding: '6px 20px',
          display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--verde-oscuro)', whiteSpace: 'nowrap' }}>
            🔴 EN VIVO
          </span>
          {liveMatches.map(m => (
            <span key={m.id} style={{ fontSize: 12, color: 'var(--verde-oscuro)', whiteSpace: 'nowrap', fontWeight: 600 }}>
              {m.home} {m.scoreH}–{m.scoreA} {m.away} ({m.minute}')
            </span>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', padding: '24px 20px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          {[
            { key: 'matches', label: '⚽ Partidos' },
            { key: 'standings', label: '📊 Posiciones' },
            { key: 'info', label: 'ℹ️ Álbum' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '6px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                background: activeTab === tab.key ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeTab === tab.key ? 'white' : 'rgba(255,255,255,0.6)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'matches' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 12 }}>
              * Datos de ejemplo — integrar con football-data.org para datos reales
            </p>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: 'var(--dorado-claro)', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                En vivo
              </h4>
              <div className="matches-scroll">
                {liveMatches.length ? liveMatches.map(m => <MatchCard key={m.id} match={m} />) : (
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>No hay partidos en vivo</p>
                )}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ color: 'var(--dorado-claro)', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Hoy más tarde
              </h4>
              <div className="matches-scroll">
                {upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Resultados recientes
              </h4>
              <div className="matches-scroll">
                {finishedMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {Object.keys(GROUP_STANDINGS).map(g => (
                <button
                  key={g}
                  onClick={() => setActiveGroup(g)}
                  style={{
                    padding: '4px 12px', border: 'none', borderRadius: 20,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: activeGroup === g ? 'var(--dorado)' : 'rgba(255,255,255,0.1)',
                    color: activeGroup === g ? 'var(--verde-oscuro)' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  Grupo {g}
                </button>
              ))}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500 }}>#</th>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500 }}>Equipo</th>
                  <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500 }}>PJ</th>
                  <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500 }}>DG</th>
                  <th style={{ textAlign: 'center', padding: '4px 8px', fontWeight: 500, color: 'var(--dorado-claro)' }}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {(GROUP_STANDINGS[activeGroup] || []).map((row, i) => (
                  <tr key={row.equipo} style={{
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    background: i < 2 ? 'rgba(201,162,39,0.08)' : 'transparent',
                  }}>
                    <td style={{ padding: '8px 8px', color: i < 2 ? 'var(--dorado-claro)' : 'rgba(255,255,255,0.5)', fontWeight: 700 }}>{row.pos}</td>
                    <td style={{ padding: '8px 8px', color: 'white', fontWeight: i < 2 ? 600 : 400 }}>{row.equipo}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.pj}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>{row.gd}</td>
                    <td style={{ padding: '8px 8px', textAlign: 'center', color: 'var(--dorado-claro)', fontWeight: 700, fontSize: 15 }}>{row.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 8 }}>
              Los 2 primeros de cada grupo clasifican a octavos
            </p>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <h4 style={{ color: 'var(--dorado-claro)', marginBottom: 8, fontSize: 14 }}>El Álbum</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.6 }}>
                El Álbum 3 Reyes del Mundial cuenta con más de 584 cromos numéricos, 48 escudos troquelados (Serie T) y 6 clasificados de repechaje.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'var(--dorado-claro)', marginBottom: 8, fontSize: 14 }}>Secciones</h4>
              <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 2, listStyle: 'none' }}>
                <li>🏆 Últimos Campeones (1-24)</li>
                <li>🌟 Primera vez en el Mundial (25-32)</li>
                <li>⚽ Plantillas + MVPs (33-584)</li>
                <li>🔶 Escudos Troquelados (T-1 a T-48)</li>
                <li>❓ Repechaje (A-F)</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'var(--dorado-claro)', marginBottom: 8, fontSize: 14 }}>Esta plataforma</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.6 }}>
                Registra lo que tienes, lo que te falta y tus repetidas. Publica para vender o intercambiar, y conecta con otros coleccionistas por WhatsApp.
              </p>
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 24, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            Álbum 3 Reyes Mundial © 2026 — Comunidad de coleccionistas
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
            Sitio no oficial
          </span>
        </div>
      </div>
    </footer>
  )
}
