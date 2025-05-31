## 安装

```bash
yarn install
# 或
npm install
```

## 使用

### 1. 引入并初始化

```ts
import { setup } from 'js-monitor';

setup({
  appId: 'your-app-id',
  api: '/api/report', // 或自定义函数
  debug: true,
  filter: (data) => false, // 返回 true 则不上报
  transform: (data) => data, // 可自定义数据转换
});
```

### 2. 手动上报

```ts
import { report } from 'js-monitor';

report({
  appId: 'your-app-id',
  api: '/api/report',
  filter: () => false,
  transform: (data) => data,
}, {
  type: 'custom',
  message: '自定义上报内容'
});
```

## 功能特性

- **Vue 错误与警告监控**：自动代理 Vue 的 `errorHandler` 和 `warnHandler`。
- **全局 JS 错误监控**：自动监听 `window.onerror`。
- **Promise 未捕获异常监控**：自动监听 `unhandledrejection`。
- **静态资源加载错误监控**：自动监听 `error` 事件，捕获图片、脚本、样式等资源加载失败。
- **可配置过滤与转换**：支持自定义过滤和数据转换逻辑。
- **支持自定义上报函数**：可通过 `api` 传入自定义上报方法。

## 测试

本项目使用 [Jest](https://jestjs.io/) 进行单元测试。

### 运行测试

```bash
yarn test
# 或
npm test
```

### 测试文件示例

测试文件位于 `__tests__/` 目录下，覆盖了 `setup` 和 `report` 的主要逻辑。

## 开发

### 本地开发

```bash
yarn dev
```

### 构建

```bash
yarn build
```

## 依赖

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Jest](https://jestjs.io/)
- [ts-jest](https://kulshekhar.github.io/ts-jest/)

## 贡献

欢迎提 issue 或 PR！

---

## License

MIT
