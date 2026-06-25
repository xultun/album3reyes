import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { createUserProfile, getUserProfile } from '../lib/db'
import { useStore } from '../lib/store'
import toast from 'react-hot-toast'

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
    <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z"/>
    <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z"/>
    <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
  </svg>
)

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { loadCatalog } = useStore()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await loadCatalog(cred.user.uid)
      toast.success('¡Bienvenido!')
      navigate('/catalogo')
    } catch (err) {
      const msgs = {
        'auth/user-not-found': 'No existe una cuenta con ese correo',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Correo inválido',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
      }
      toast.error(msgs[err.code] || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const existing = await getUserProfile(cred.user.uid)
      if (!existing) {
        await createUserProfile(cred.user.uid, {
          displayName: cred.user.displayName,
          email: cred.user.email,
          photoURL: cred.user.photoURL,
        })
      }
      toast.success('¡Bienvenido!')
      navigate('/catalogo')
    } catch (err) {
      toast.error('Error con Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content" style={{ maxWidth: 400, margin: '40px auto' }}>
      <div className="card card-padded">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Iniciar sesión</h1>
        <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 24 }}>Accede a tu catálogo</p>

        <button className="btn btn-secondary" style={{ width: '100%', marginBottom: 16 }} onClick={handleGoogle} disabled={loading}>
          <GoogleIcon /> Continuar con Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--gris-100)' }} />
          <span style={{ fontSize: 12, color: 'var(--gris-500)' }}>o con correo</span>
          <div style={{ flex: 1, height: 1, background: 'var(--gris-100)' }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Correo</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="tu@correo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gris-500)', marginTop: 20 }}>
          ¿No tienes cuenta? <Link to="/registro" style={{ color: 'var(--verde)', fontWeight: 600 }}>Regístrate gratis</Link>
        </p>
      </div>
    </div>
  )
}

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', whatsapp: '', pais: '' })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(cred.user, { displayName: form.name })
      await createUserProfile(cred.user.uid, {
        displayName: form.name,
        email: form.email,
        whatsapp: form.whatsapp,
        pais: form.pais,
      })
      toast.success('¡Cuenta creada! Empieza a marcar tus cromos.')
      navigate('/catalogo')
    } catch (err) {
      const msgs = {
        'auth/email-already-in-use': 'Ya existe una cuenta con ese correo',
        'auth/invalid-email': 'Correo inválido',
        'auth/weak-password': 'Contraseña muy débil',
      }
      toast.error(msgs[err.code] || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main-content" style={{ maxWidth: 440, margin: '40px auto' }}>
      <div className="card card-padded">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 4 }}>Crear cuenta</h1>
        <p style={{ color: 'var(--gris-500)', fontSize: 14, marginBottom: 24 }}>Es gratis y siempre lo será</p>

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input className="input" value={form.name} onChange={set('name')} required placeholder="Tu nombre" />
          </div>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} required placeholder="tu@correo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} required placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp <span style={{ color: 'var(--gris-300)' }}>(para que puedan contactarte)</span></label>
            <input className="input" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+1 809 555 0000" />
          </div>
          <div className="form-group">
            <label className="form-label">País</label>
            <select className="select" value={form.pais} onChange={set('pais')}>
              <option value="">Selecciona tu país</option>
              {['República Dominicana','México','Colombia','Perú','Argentina','Venezuela','Ecuador','Bolivia','Chile','Uruguay','Paraguay','Brasil','España','Estados Unidos','Otro'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gris-500)', marginTop: 20 }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--verde)', fontWeight: 600 }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
