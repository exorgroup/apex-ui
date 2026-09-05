import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ApexUI',
      fileName: (fmt) => (fmt === 'es' ? 'apex-ui.js' : 'apex-ui.umd.cjs'),
      formats: ['es', 'umd'],
    },
    cssFileName: 'apex-ui',
    rollupOptions: {
      external: ['vue'],
      output: { globals: { vue: 'Vue' } },
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    /*
     * The docs app imports the library by name and aliases that to
     * ../apex-ui/src/index.ts. Tests mount those same pages, so they have to
     * resolve the name the same way. Without this, `@exorgroup/apex-ui`
     * self-resolves through package.json to dist/apex-ui.js and the suite runs
     * partly against the last build.
     *
     * The split is worse than staleness: components come from src through the
     * plugin while anything App.vue imports by name comes from dist, so a
     * module-level service store exists twice and a call through one is
     * invisible to the other. Nothing failed loudly — the pages still rendered.
     */
    alias: { '@exorgroup/apex-ui': resolve(__dirname, 'src/index.ts') },
  },
});
