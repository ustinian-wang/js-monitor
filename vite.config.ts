import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'MyJSSDK',
      fileName: (format) => `my-jssdk.${format}.js`
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