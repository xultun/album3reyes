# Álbum 3 Reyes Mundial

Comunidad de coleccionistas del Álbum 3 Reyes del Mundial.

## Stack
- **React 18 + Vite** — Frontend
- **Firebase** — Auth + Firestore (base de datos) + Hosting info
- **GitHub Pages** — Hosting gratuito
- **GitHub Actions** — Deploy automático al hacer push a `main`

--- 
 
## Configuración inicial (paso a paso)   

### 1. Firebase — Crear proyecto 

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Clic en **"Añadir proyecto"** → Dale un nombre (ej: `album-3-reyes`)
3. Desactiva Google Analytics (opcional) → Crear proyecto

#### Activar Authentication
1. En el panel izquierdo → **Authentication** → Get Started
2. Pestaña **Sign-in method** → Habilitar:
   - **Email/Password** ✓
   - **Google** ✓ (agrega tu email de soporte)

#### Crear base de datos Firestore
1. Panel izquierdo → **Firestore Database** → Crear base de datos
2. Elige **Modo de producción** → Selecciona región (ej: `us-central1`)
3. Ve a **Reglas** y pega el contenido de `firestore.rules`
4. Ve a **Índices** → Compuestos → importa `firestore.indexes.json` (o créalos manualmente cuando Firestore lo pida)

#### Obtener credenciales
1. Engranaje (⚙️) → **Configuración del proyecto** → pestaña **General**
2. Baja a **"Tus apps"** → clic en `</>` (Web)
3. Dale un nombre → **Registrar app**
4. Copia los valores del `firebaseConfig`

---

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**IMPORTANTE:** `.env.local` nunca se sube a GitHub (está en `.gitignore`).

---

### 3. GitHub — Configurar secretos para el deploy

1. En tu repositorio de GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Haz clic en **New repository secret** para cada variable:

| Nombre del secret | Valor |
|---|---|
| `VITE_FIREBASE_API_KEY` | Tu API key de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `tu-proyecto.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `tu-proyecto` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `tu-proyecto.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | El sender ID |
| `VITE_FIREBASE_APP_ID` | El app ID |

---

### 4. GitHub Pages — Habilitar

1. En tu repositorio → **Settings** → **Pages**
2. En **Source** selecciona **GitHub Actions**
3. Listo — el deploy ocurrirá automáticamente al hacer push a `main`

#### Si usas dominio propio:
1. En GitHub Pages → **Custom domain** → escribe tu dominio (ej: `album3reyes.com`)
2. En tu proveedor de DNS, agrega estos registros:
   ```
   A    @    185.199.108.153
   A    @    185.199.109.153
   A    @    185.199.110.153
   A    @    185.199.111.153
   CNAME www  tu-usuario.github.io
   ```
3. En `vite.config.js` asegúrate que `base: '/'`

---

### 5. Instalar y correr localmente

```bash
npm install
npm run dev
```

El sitio estará en `http://localhost:5173`

### Deploy manual (si quieres)
```bash
npm run build
# El build queda en /dist — súbelo manualmente o espera el auto-deploy
```

---

## Estructura del proyecto

```
src/
├── lib/
│   ├── firebase.js      # Configuración de Firebase
│   ├── db.js            # Operaciones Firestore (CRUD)
│   ├── store.js         # Estado global (Zustand)
│   └── albumData.js     # Todos los cromos del álbum
├── pages/
│   ├── Home.jsx         # Página principal
│   ├── Catalog.jsx      # Tu álbum personal
│   ├── Marketplace.jsx  # Mercado de intercambio/venta
│   ├── Login.jsx        # Login + Register
│   └── Profile.jsx      # Perfil de usuario
├── components/
│   └── layout/
│       ├── Layout.jsx   # Wrapper con header+footer
│       ├── Header.jsx   # Navegación
│       └── Footer.jsx   # Partidos en vivo + standings
└── styles/
    └── global.css       # Design system completo
```

## Estructura Firestore

```
users/{uid}
  displayName, email, whatsapp, pais, catalogStats

catalogs/{uid}/stickers/{stickerId}
  stickerId, status (tengo|falta|repetida), cantidad

listings/{listingId}
  uid, displayName, whatsapp, type, stickers[], precio, moneda, activo
```

---

## Agregar partidos en vivo reales

Para datos de partidos reales, reemplaza los datos demo en `Footer.jsx` con una API gratuita:

- **football-data.org** — 10 requests/min gratis, tiene el Mundial
- **api-sports.io** — plan gratuito disponible

```js
// Ejemplo con football-data.org
const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
  headers: { 'X-Auth-Token': 'TU_TOKEN' }
})
const data = await res.json()
```

Guarda el token como variable de entorno `VITE_FOOTBALL_API_KEY`.

---

## Personalización

- **Colores**: Edita las variables CSS en `src/styles/global.css` (`:root`)
- **Logo**: Reemplaza `public/favicon.svg`
- **Datos del álbum**: Edita `src/lib/albumData.js` para ajustar los números exactos de cada cromo cuando tengas el álbum físico
