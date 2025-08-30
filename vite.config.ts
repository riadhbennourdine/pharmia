import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        proxy: {
          '/api': 'http://localhost:5001',
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['axios'], // Explicitly include axios for optimization
      },
      build: {
        rollupOptions: {
          external: [], // Ensure axios is not externalized
        },
        chunkSizeWarningLimit: 1500,
      },
    };
});
