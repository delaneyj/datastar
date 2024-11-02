import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({ rollupTypes: true }),

    // compress({
    // algorithm: 'brotliCompress',
    // }),
    visualizer({
      brotliSize: true,
      // gzipSize: true,
      template: 'treemap',
      // open: true,
    }),
    splitVendorChunkPlugin(),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    copyPublicDir: false,
    reportCompressedSize: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'Datastar',
      fileName: 'datastar',
      formats: ['es', 'umd', 'iife'],
    },
  },
  server: {
    fs: {
      strict: false
    },
    host: '0.0.0.0',
    origin: 'http://localhost:' + process.env.VITE_PORT,
    port: parseInt(process.env.VITE_PORT),
    strictPort: true,
  },
})
