import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'js-monitor',
      fileName: (format) => `js-monitor.${format}.js`
    },
    rollupOptions: {
      // 外部依赖不打包进库
      external: [],
      output: {
        globals: {}
      }
    }
  }
});