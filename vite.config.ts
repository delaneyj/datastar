import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    minify: 'esbuild',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'Datastar',
      fileName: 'datastar',
      formats: ['es', 'umd', 'iife'],
    },
  },
})
