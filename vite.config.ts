import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'import.meta.env.VITE_APP_BACKEND_URL': JSON.stringify(process.env.VITE_APP_BACKEND_URL),
        'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(env.VITE_DEEPSEEK_API_KEY),
        'import.meta.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },
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
