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
    /*
     * zz-docs-pages mounts the whole docs app once per test — 152 of them —
     * and the app grew a chart page whose datasets include a 50,000-point
     * series. That crossed node's default 2 GB worker heap in AF2-238c: the
     * worker died mid-run and vitest still reported "36 passed", because a
     * file that never finishes is not a file that failed.
     *
     * Measured, not guessed: the same run completes at 4 GB, so this is a
     * ceiling rather than an unbounded leak. Set here rather than left to
     * NODE_OPTIONS so `npx vitest run` behaves the same for everyone.
     */
    poolOptions: { forks: { execArgv: ['--max-old-space-size=4096'] } },
  },
});
