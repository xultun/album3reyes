import { useState, useEffect } from 'react'

const SITE_URL = 'https://xultun.github.io/album3reyes/'
const SITE_MSG = encodeURIComponent('¡Únete a la comunidad del Álbum 3 Reyes Mundial! Registra tu colección, intercambia y vende cromos gratis 🌍⚽ ' + SITE_URL)

export default function WelcomePopup() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    // Mostrar solo una vez por sesión
    const seen = sessionStorage.getItem('welcome_shown')
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const close = () => {
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('welcome_shown', '1')
    }, 300)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popupOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(30px) scale(0.95); }
        }
        .popup-box {
          animation: popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .popup-box.closing {
          animation: popupOut 0.3s ease forwards;
        }
        @media (max-width: 480px) {
          .popup-box {
            left: 12px !important;
            right: 12px !important;
            bottom: 12px !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      {/* Overlay suave */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        }}
      />

      {/* Popup */}
      <div
        className={`popup-box${closing ? ' closing' : ''}`}
        style={{
          position: 'fixed',
          bottom: 24, right: 24,
          zIndex: 1000,
          maxWidth: 380,
          width: 'calc(100vw - 48px)',
          background: 'var(--negro-3)',
          border: '1px solid rgba(0,200,83,0.3)',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,200,83,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Barra verde superior */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--verde), var(--dorado))' }} />

        <div style={{ padding: '20px 20px 22px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>⚽</span>
              <div>
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 18, color: 'var(--verde)', letterSpacing: 1 }}>
                  ¡Bienvenido!
                </div>
                <div style={{ fontSize: 11, color: 'var(--gris-300)' }}>Álbum 3 Reyes Mundial</div>
              </div>
            </div>
            <button
              onClick={close}
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--gris-300)', fontSize: 14,
                transition: 'all 0.15s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,68,68,0.2)'; e.currentTarget.style.color = 'var(--rojo)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--gris-300)' }}
            >
              ✕
            </button>
          </div>

          {/* Mensaje */}
          <p style={{ fontSize: 14, color: 'white', lineHeight: 1.65, marginBottom: 6 }}>
            Gracias por ingresar a la comunidad de coleccionistas del
            <strong style={{ color: 'var(--dorado)' }}> Álbum 3 Reyes Mundial</strong> 🏆
          </p>
          <p style={{ fontSize: 13, color: 'var(--gris-300)', lineHeight: 1.6, marginBottom: 18 }}>
            Este es un proyecto <strong style={{ color: 'var(--verde)' }}>sin fines de lucro</strong>,
            hecho con ❤️ para toda la comunidad. ¡Ayúdanos compartiendo con otros coleccionistas!
          </p>

          {/* Botones de compartir */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${SITE_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                background: '#25d366', color: '#000', fontWeight: 700, fontSize: 13,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,211,102,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
                background: '#1877f2', color: 'white', fontWeight: 700, fontSize: 13,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(24,119,242,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>

            {/* Copiar link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(SITE_URL)
                  .then(() => {
                    const btn = document.getElementById('copy-btn')
                    if (btn) { btn.textContent = '✓'; btn.style.color = 'var(--verde)' }
                    setTimeout(() => { if (btn) { btn.textContent = '🔗'; btn.style.color = 'var(--gris-300)' } }, 2000)
                  })
              }}
              id="copy-btn"
              style={{
                width: 44, height: 44, borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)', color: 'var(--gris-300)',
                fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0,
              }}
              title="Copiar enlace"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,83,0.4)'; e.currentTarget.style.color = 'var(--verde)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--gris-300)' }}
            >
              🔗
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: 'var(--gris-500)' }}>
            Haz clic fuera o en ✕ para cerrar
          </div>
        </div>
      </div>
    </>
  )
}
