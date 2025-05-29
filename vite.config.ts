import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vite.dev/config/

export default defineConfig({
  resolve: {
    alias: {
      '@fonts': path.resolve(__dirname, 'src', 'fonts'),
      '@styles': path.resolve(__dirname, 'src', 'styles')
    }
  },
  plugins: [react(), tsConfigPaths()],
});
