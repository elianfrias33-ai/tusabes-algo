import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5184, strictPort: true },
  preview: { port: 5185, strictPort: true },
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
