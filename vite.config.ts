import viteImagemin from '@vheemstra/vite-plugin-imagemin'
import imageminGif2Webp from 'imagemin-gif2webp'
import imageminGifsicle from 'imagemin-gifsicle'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo from 'imagemin-svgo'
import imageminWebp from 'imagemin-webp'

import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import Unfonts from 'unplugin-fonts/vite'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    Unfonts({
      google: {
        preconnect: true,
        families: ['Orbitron', 'Inter', 'JetBrains Mono'],
      },
    }),
    // compress({
    // algorithm: 'brotliCompress',
    // }),
    visualizer({
      // open: true,
    }),
    splitVendorChunkPlugin(),
    viteImagemin({
      plugins: {
        jpg: imageminMozjpeg(),
        png: imageminPngquant(),
        svg: imageminSvgo(),
        gif: imageminGifsicle(),
      },
      makeWebp: {
        plugins: {
          jpg: imageminWebp(),
          gif: imageminGif2Webp(),
        },
      },
    }),
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
