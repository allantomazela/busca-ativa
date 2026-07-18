/* Vite config for building the frontend react app: https://vite.dev/config/ */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Deriva uma porta estável e única a partir do nome da pasta do projeto.
 * Projetos diferentes recebem portas diferentes automaticamente, evitando
 * conflitos ao rodar vários apps locais ao mesmo tempo.
 */
function derivePortFromProjectName(): number {
  const projectName = path.basename(__dirname)
  let hash = 0
  for (let i = 0; i < projectName.length; i++) {
    hash = (hash * 31 + projectName.charCodeAt(i)) & 0xffffffff
  }
  const rangeStart = 5200
  const rangeSize = 700
  return rangeStart + (Math.abs(hash) % rangeSize)
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: 'localhost',
    // Porta exclusiva por projeto (derivada do nome da pasta).
    // Pode ser sobrescrita com a variável de ambiente PORT.
    port: process.env.PORT ? Number(process.env.PORT) : derivePortFromProjectName(),
    // Falha de forma explícita em vez de mudar de porta silenciosamente.
    strictPort: true,
  },
  build: {
    outDir: mode === 'development' ? 'dev-dist' : 'dist',
    minify: mode !== 'development',
    // lightningcss in every mode so dev/QA catches the same CSS errors as prod
    cssMinify: 'lightningcss',
    sourcemap: mode === 'development',
    rolldownOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: /zod\/v4\/core/,
        replacement: path.resolve(__dirname, 'node_modules', 'zod', 'v4', 'core'),
      }
    ],
  },
}))
