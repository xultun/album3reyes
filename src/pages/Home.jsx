import { Link } from 'react-router-dom'
import { useStore } from '../lib/store'

const features = [
  {
    icon: '📋',
    title: 'Tu catálogo personal',
    desc: 'Marca cada cromo como Tengo, Me falta o Repetida. Ve tu progreso en tiempo real.',
  },
  {
    icon: '🔄',
    title: 'Intercambios',
    desc: 'Publica tus repetidas y encuentra lo que te falta. Te conectamos con otros coleccionistas.',
  },
  {
    icon: '💰',
    title: 'Compra y venta',
    desc: 'Vende tus repetidas o compra lo que te falta. El trato se cierra por WhatsApp, sin comisiones.',
  },
  {
    icon: '⚽',
    title: 'Partidos en vivo',
    desc: 'Sigue los resultados del Mundial, posiciones de los grupos y próximos partidos.',
  },
]

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function Home() {
  const { user, getCatalogStats } = useStore()
  const stats = user ? getCatalogStats() : null

  return (
    <div>
      <div className="main-content">
        {/* Hero */}
        <div className="hero">
          <div className="hero-title">
            Álbum <em>3 Reyes</em><br />Mundial
          </div>
          <p className="hero-subtitle">
            La comunidad de coleccionistas del álbum más grande del Mundial
          </p>

          {user && stats ? (
            <div style={{ marginTop: 20 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 6 }}>Tu progreso</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ color: 'white', fontSize: 32, fontFamily: 'var(--font-display)', letterSpacing: 1 }}>
                  {stats.tengo} <span style={{ fontSize: 16, opacity: 0.6 }}>cromos</span>
                </div>
                <div>
                  <div style={{ color: '#4dff91', fontSize: 13 }}>✓ {stats.tengo} tengo</div>
                  <div style={{ color: '#ff6b6b', fontSize: 13 }}>✗ {stats.falta} me faltan</div>
                  <div style={{ color: 'var(--dorado-claro)', fontSize: 13 }}>★ {stats.repetida} repetidas</div>
                </div>
              </div>
              <div className="hero-actions">
                <Link to="/catalogo" className="btn btn-dorado btn-lg">Mi álbum →</Link>
                <Link to="/mercado" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                  Ver mercado
                </Link>
              </div>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/registro" className="btn btn-dorado btn-lg">Crear cuenta gratis</Link>
              <Link to="/mercado" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                Ver mercado
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div style={{ marginBottom: 40 }}>
          <div className="section-header">
            <h2 className="section-title">Todo para tu <span>colección</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {features.map(f => (
              <div key={f.title} className="card card-padded">
                <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
                <div style={{ color: 'var(--gris-500)', fontSize: 13, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Estructura del álbum */}
        <div style={{ marginBottom: 40 }}>
          <div className="section-header">
            <h2 className="section-title">Estructura del <span>Álbum</span></h2>
            <p className="section-subtitle">48 equipos, 12 grupos, 584+ cromos</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: '🏆 Últimos Campeones', count: '24 cromos', desc: 'Argentina 78 a Argentina 2022' },
              { label: '🌟 Debutantes', count: '8 cromos', desc: 'Primera vez en el Mundial' },
              { label: '⚽ Plantillas', count: '~480 cromos', desc: '48 selecciones × 20 stickers' },
              { label: '⭐ MVPs', count: '96 especiales', desc: '2 figuras por equipo' },
              { label: '🔶 Escudos Troquelados', count: 'T-1 a T-48', desc: 'Serie especial troquelada' },
              { label: '❓ Repechaje', count: 'A-F', desc: 'Últimos 6 clasificados' },
            ].map(item => (
              <div key={item.label} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.label}</div>
                <div style={{ color: 'var(--verde)', fontWeight: 600, fontSize: 16, margin: '4px 0' }}>{item.count}</div>
                <div style={{ color: 'var(--gris-500)', fontSize: 12 }}>{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Grupos */}
          <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: 'var(--gris-700)' }}>12 Grupos del torneo:</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {groups.map(g => (
              <Link key={g} to={`/catalogo?grupo=${g}`}
                style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--verde-oscuro)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 18, textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--dorado)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--verde-oscuro)'}
              >
                {g}
              </Link>
            ))}
          </div>
        </div>

        {/* CTA si no está logueado */}
        {!user && (
          <div style={{
            background: 'linear-gradient(135deg, var(--verde-oscuro), var(--verde))',
            borderRadius: 'var(--radius-lg)', padding: '32px',
            textAlign: 'center', marginBottom: 40,
          }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'white', marginBottom: 8 }}>
              ¿Ya tienes el álbum?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 20 }}>
              Crea tu cuenta gratis y empieza a registrar tu colección
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/registro" className="btn btn-dorado btn-lg">Crear cuenta gratis</Link>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
