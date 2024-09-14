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
  mode: process.env.NODE_ENV,
  build: {
    target: 'esnext',
    // minify: process.env.NODE_ENV == 'production' ? 'esbuild' : false,
    // copyPublicDir: false,
    // reportCompressedSize: true,
    // sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'Datastar',
      fileName: 'datastar',
      // formats: process.env.NODE_ENV == 'production' ? ['es', 'umd', 'iife'] : ["es"],
    },
  },
})
