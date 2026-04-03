import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// Copy brand assets from web app if not already present in site public
function copyBrandAssets() {
  const webPublic = path.resolve(__dirname, '../web/public')
  const sitePublic = path.resolve(__dirname, 'public')
  const assets = ['logo.png', 'logo-comp.png', 'favicon.ico']
  
  if (!existsSync(sitePublic)) mkdirSync(sitePublic, { recursive: true })
  
  for (const asset of assets) {
    const src = path.join(webPublic, asset)
    const dest = path.join(sitePublic, asset)
    if (existsSync(src) && !existsSync(dest)) {
      try { copyFileSync(src, dest) } catch { /* ignore */ }
    }
  }
}

copyBrandAssets()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8081,
    host: true,
  },
})
