import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { invalidateTypeCache } from '@vue/compiler-sfc';
import { resolve } from 'node:path';

const UI_SRC = resolve(__dirname, '../apex-ui/src');
const UI_TYPES = resolve(UI_SRC, 'types.ts');

/**
 * Keep the dev server honest about apex-ui's types.ts.
 *
 * The components take their props from that file through a type-only import,
 * which emits no runtime code — so Vite never sees it as a module and never
 * tells anyone it changed. @vue/compiler-sfc, meanwhile, parses it once and
 * caches the result for the life of the process. Edit it and the cache keeps
 * serving the old copy: new props silently fail to appear, and a type added
 * after the server started reads as missing entirely, which surfaces as
 * "Unresolvable type reference" on every component that uses it. The only
 * cure was restarting the server, and the cause is invisible from the error.
 *
 * So watch the file ourselves, drop the compiler's copy when it changes, and
 * evict the components compiled against it.
 */
function apexTypes(): Plugin {
  const norm = (p: string) => p.replace(/\\/g, '/');
  return {
    name: 'apex-ui-types',
    configureServer(server) {
      server.watcher.add(UI_TYPES);
    },
    handleHotUpdate({ file, server }) {
      if (norm(file) !== norm(UI_TYPES)) return;

      invalidateTypeCache(file);
      // Every SFC in the package may have read it; which ones did is not
      // something the compiler tells us, so drop them all and reload.
      const stale = [...server.moduleGraph.idToModuleMap.values()]
        .filter((m) => m.id && norm(m.id).startsWith(norm(UI_SRC)) && m.id.includes('.vue'));
      stale.forEach((m) => server.moduleGraph.invalidateModule(m));

      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

export default defineConfig({
  plugins: [vue(), apexTypes()],
  resolve: {
    alias: { '@exorgroup/apex-ui': resolve(__dirname, '../apex-ui/src/index.ts') },
  },
  server: { port: 5180 },
});
