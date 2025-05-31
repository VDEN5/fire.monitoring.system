import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  server: {
    port: 5173,
  },
  build: {
    target: 'esnext',
  },
  base: './',
  resolve: {
    alias: {
      '@fonts': path.resolve(__dirname, 'src', 'fonts'),
      '@styles': path.resolve(__dirname, 'src', 'styles'),
    },
  },
  plugins: [react(), tsConfigPaths()],
});
