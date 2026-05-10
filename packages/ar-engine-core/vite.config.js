import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      // Entry point of the AR Engine
      entry: resolve(__dirname, 'src/index.js'),
      // Global variable name for UMD build (e.g. window.AREngine)
      name: 'AREngine',
      // The name of the output file
      fileName: 'ar-engine-core',
      // We generate both an ES module (for modern bundlers) and a UMD file (for <script> tags)
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // We do NOT externalize three.js or mediapipe because the user explicitly 
      // requested to bundle everything together for a seamless SaaS drop-in script.
      external: [],
      output: {
        globals: {}
      }
    },
    // Minify the code using terser for better obfuscation
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.error for debugging API key errors
        drop_debugger: true
      },
      mangle: true // Obfuscates variable and function names
    }
  }
});
