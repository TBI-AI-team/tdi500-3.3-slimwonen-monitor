tdi500-3.3-slimwonen-monitimport { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tdi500-3.3-slimwonen-monitor/',
  server: { port: 3000 },
});
