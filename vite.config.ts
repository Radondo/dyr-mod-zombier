import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import os from 'node:os'
import path from 'node:path'

// Cache is redirected out of the Dropbox folder (same workaround as Fantasy
// Diplomacy) so Vite's file cache doesn't fight Dropbox sync.
export default defineConfig({
  // Served from https://<user>.github.io/dyr-mod-zombier/ on GitHub Pages, so
  // all built asset URLs are prefixed with this sub-path. Must match the repo
  // name. In `vite dev` this is effectively "/". See src/game/assets.ts for the
  // matching runtime (model/texture) path handling.
  base: '/dyr-mod-zombier/',
  plugins: [react()],
  cacheDir: path.join(os.tmpdir(), 'dyr-mod-zombier-vite-cache'),
  server: {
    port: 5090,
    strictPort: true,
  },
})
