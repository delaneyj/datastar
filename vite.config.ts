import { resolve } from 'path'
import { defineConfig } from 'vite'
import compress from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    compress({
      algorithm: 'brotliCompress',
    }),
  ],
  build: {
    target: 'esnext',
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
