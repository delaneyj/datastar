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
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/datastar/index.ts'),
      name: 'Datastar',
      fileName: 'datastar',
      formats: ['es', 'umd', 'iife'],
    },
  },
})
