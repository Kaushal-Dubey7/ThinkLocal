import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { componentTagger } from "lovable-tagger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copyWasmPlugin(): Plugin {
  return {
    name: 'copy-wasm',
    writeBundle(options) {
      const outDir = options.dir ?? path.resolve(__dirname, 'dist')
      const assetsDir = path.join(outDir, 'assets')
      fs.mkdirSync(assetsDir, { recursive: true })
      const llamacppWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-llamacpp/wasm')
      for (const file of ['racommons-llamacpp.wasm','racommons-llamacpp.js','racommons-llamacpp-webgpu.wasm','racommons-llamacpp-webgpu.js']) {
        const src = path.join(llamacppWasm, file)
        if (fs.existsSync(src)) fs.copyFileSync(src, path.join(assetsDir, file))
      }
      const onnxWasm = path.resolve(__dirname, 'node_modules/@runanywhere/web-onnx/wasm')
      const sherpaDir = path.join(onnxWasm, 'sherpa')
      const sherpaOut = path.join(assetsDir, 'sherpa')
      if (fs.existsSync(sherpaDir)) {
        fs.mkdirSync(sherpaOut, { recursive: true })
        for (const file of fs.readdirSync(sherpaDir))
          fs.copyFileSync(path.join(sherpaDir, file), path.join(sherpaOut, file))
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  plugins: [react(), copyWasmPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  assetsInclude: ['**/*.wasm'],
  worker: { format: 'es' as const },
  optimizeDeps: {
    exclude: ['@runanywhere/web-llamacpp', '@runanywhere/web-onnx'],
  },
}));
