import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import litCSS from "vite-plugin-lit-css";

export default defineConfig({
  plugins: [dts({ rollupTypes: true }), litCSS()],
  build: {
    target: "esnext",
    minify: "esbuild",
    copyPublicDir: false,
    reportCompressedSize: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "DatastarInspector",
      fileName: "datastar-inspector",
      formats: ["es"],
    },
  },
});
