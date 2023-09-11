import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    // compress({
    // algorithm: 'brotliCompress',
    // }),
    visualizer({
      // open: true,
    }),
    splitVendorChunkPlugin(),
    dts({
      rollupTypes: true,
      include: 'src/lib/**/*',
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    reportCompressedSize: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/lib/index.ts'),
      name: 'Datastar',
      fileName: 'datastar',
      formats: ['es', 'umd', 'iife'],
    },
  },
})
