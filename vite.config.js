import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tdi500-slimwonen-monitor/',
  server: { port: 3000 },
});
