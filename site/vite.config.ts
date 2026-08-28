import { defineConfig } from 'vite';

export default defineConfig({
  root: import.meta.dirname,
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    sourcemap: true,
    outDir: '../dist/site',
    emptyOutDir: true
  },
  server: {
    host: '127.0.0.1'
  },
  preview: {
    host: '127.0.0.1',
    port: 4173
  }
});
