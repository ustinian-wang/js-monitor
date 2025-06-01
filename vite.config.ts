import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'JsMonitor',
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      plugins: [visualizer()],
      // 外部依赖不打包进库
      external: [],
      output: {
        globals: {}
      }
    }
  }
});