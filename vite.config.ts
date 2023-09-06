import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Unfonts from 'unplugin-fonts/vite'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import compress from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    Unfonts({
      google: {
        preconnect: true,
        families: ['Orbitron', 'Inter', 'JetBrains Mono'],
      },
    }),
    compress({
      algorithm: 'brotliCompress',
    }),
    visualizer({
      // open: true,
    }),
    splitVendorChunkPlugin(),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'Datastar',
      fileName: 'datastar',
      formats: ['es'],
    },
  },
})
