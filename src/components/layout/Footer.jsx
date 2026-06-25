export default function Footer() {
  return (
    <footer style={{ background: 'var(--negro-2)', borderTop: '1px solid rgba(0,200,83,0.08)', padding: '20px 24px' }}>
      <div style={{ maxWidth: 'var(--max-w)', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ color: 'var(--gris-500)', fontSize: 12 }}>Álbum 3 Reyes Mundial © 2026 — Comunidad de coleccionistas</span>
        <span style={{ color: 'var(--gris-600)', fontSize: 11 }}>Sitio no oficial</span>
      </div>
    </footer>
  )
}
