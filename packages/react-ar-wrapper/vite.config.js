import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: 'ReactARWrapper',
      fileName: (format) => `react-ar-wrapper.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'three', '@ar-project/engine-core'],

      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          three: 'THREE',
          '@ar-project/engine-core': 'AREngineCore'
        },
      },
    },
  },
});
