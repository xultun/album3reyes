import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Cambia 'album-3-reyes' por el nombre exacto de tu repositorio en GitHub
export default defineConfig({
  plugins: [react()],
  base: '/album3reyes/',  // Si usas dominio propio, déjalo en '/'. Si usas usuario.github.io/repo, cámbialo a '/repo/'
})
