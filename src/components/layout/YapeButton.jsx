import { useState } from 'react'

const QR_URL = 'https://github.com/xultun/album3reyes/blob/main/moradito.jpg?raw=true'

export default function YapeButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <style>{`
        @keyframes yapeIn {
          from { opacity: 0; transform: scale(0.85) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .yape-card { animation: yapeIn 0.25s ease forwards; }

        @keyframes pulse-yape {
          0%,100% { box-shadow: 0 0 0 0 rgba(106,27,154,0.5); }
          50%      { box-shadow: 0 0 0 8px rgba(106,27,154,0); }
        }
        .yape-btn-pulse { animation: pulse-yape 2.5s infinite; }
      `}</style>

      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        className="yape-btn-pulse"
        title="Apóyanos con Yape"
        style={{
          position: 'fixed', bottom: 24, left: 20, zIndex: 990,
          background: 'linear-gradient(135deg, #6a1b9a, #9c27b0)',
          border: 'none', borderRadius: 50, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px 10px 12px',
          color: 'white', fontWeight: 700, fontSize: 13,
          fontFamily: 'var(--font-body)',
          boxShadow: '0 4px 20px rgba(106,27,154,0.5)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      >
        {/* Ícono morado Yape */}
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          💜
        </div>
        <span style={{ whiteSpace: 'nowrap' }}>Apóyanos</span>
      </button>

      {/* Card con QR */}
      {open && (
        <div
          className="yape-card"
          style={{
            position: 'fixed', bottom: 80, left: 20, zIndex: 991,
            background: '#1a0a2e',
            border: '1px solid rgba(156,39,176,0.4)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(106,27,154,0.4)',
            overflow: 'hidden',
            width: 220,
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #6a1b9a, #9c27b0)',
            padding: '12px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>💜 Yape</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 1 }}>
                Apoya el proyecto
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none',
                borderRadius: '50%', width: 24, height: 24,
                color: 'white', cursor: 'pointer', fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* QR */}
          <div style={{ padding: '14px 14px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 10, lineHeight: 1.5 }}>
              Escanea o descarga el QR para yapear desde tu app
            </div>
            <img
              src={QR_URL}
              alt="QR Yape"
              style={{
                width: '100%', borderRadius: 10,
                border: '3px solid rgba(156,39,176,0.4)',
                display: 'block',
              }}
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>

          {/* Botón descargar */}
          <div style={{ padding: '10px 14px 14px' }}>
            <a
              href={QR_URL}
              download="QR-Yape-Album3Reyes.jpg"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 14px', borderRadius: 8, textDecoration: 'none',
                background: 'rgba(156,39,176,0.25)',
                border: '1px solid rgba(156,39,176,0.5)',
                color: '#ce93d8', fontWeight: 600, fontSize: 12,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(156,39,176,0.4)'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(156,39,176,0.25)'; e.currentTarget.style.color = '#ce93d8' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              Descargar QR
            </a>
          </div>
        </div>
      )}
    </>
  )
}
