import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@exorgroup/apex-ui': resolve(__dirname, '../apex-ui/src/index.ts') },
  },
  server: { port: 5180 },
});
