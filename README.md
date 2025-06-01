# js-monitor

## 背景介绍

- 为了完善项目质量, 我们需要对异常进行监控, 基于此背景开发一个异常监控sdk捕获错误,即`js-monitor`

## 安装

```bash
yarn install @ustinian-wang/js-monitor@latest
# 或
npm install @ustinian-wang/js-monitor@latest
```

## 使用

### 1. 引入并初始化

> umd

```html
<script src="https://cdn.jsdelivr.net/npm/@ustinian-wang/js-monitor@latest">
window.addEventListener('DOMContentLoaded', (e) => {
    console.log('DOMContentLoaded', e);
    const JsMonitor = window.JsMonitor;
    JsMonitor.setup({
        appId: 'monitor-demo',
        api: 'http://localhost:3000/api/monitor',
        debug: true
    });
});
</script>
```

> esm

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

| 参数名 | 类型 | 必填 | 说明 |
| --------- | -------------------------- | ---- | -------------------------------------------------------------------- |
| force | boolean | 否 | 是否强制安装，默认false。setup默认只能执行一次，重复setup只执行一次，但force为true时每次setup都会重新初始化 |
| appId | string | 是 | 应用唯一标识 |
| api | string \| Function | 是 | 上报地址（字符串）或自定义上报函数 |
| debug | boolean | 否 | 是否开启调试模式（开启后会打印调试日志） |
| filter | (data) => boolean | 否 | 过滤函数，返回 true 时本次数据不上报 |
| transform | (data) => object | 否 | 数据转换函数，上报前可对数据进行自定义处理 |
| warnHandler | (error, vm, info) => void | 否 | Vue.config.warnHandler 警告处理函数 |
| errorHandler | (error, vm, info) => void | 否 | Vue.config.errorHandler 错误处理函数 |
| unhandledrejection | (event) => void | 否 | window.unhandledrejection 未捕获异常处理函数 |
| onerror | (message, source, lineno, colno, error) => void | 否 | window.onerror 错误处理函数 |
| error | (event) => void | 否 | window.addEventListener('error', config.error) 资源加载错误处理函数 |
| report | (config, data) => void | 否 | 上报回调 |

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

| 参数名 | 类型 | 必填 | 说明 |
| ------ | ---------------------- | ---- | ---------------------------- |
| config | setupConfigDef | 是 | 同 setup 的配置参数 |
| data | reportDataDef | 是 | 需要上报的数据对象 |

data（reportDataDef）常用字段
| 字段名 | 类型 | 说明 |
| --------- | --------- | ---------------------- |
| appId | string | 应用ID |
| type | string | 错误/事件类型 |
| error | Error | 错误对象 |
| vmName | string | Vue 组件名 |
| info | string | 额外信息 |
| message | string | 错误消息 |
| stack | string | 错误堆栈 |
| url | string | 当前页面地址 |
| time | number | 上报时间戳 |
| userAgent | string | UA 信息 |
| source | string | 错误来源 |
| lineno | number | 行号 |
| colno | number | 列号 |
| reason | any | Promise 拒绝原因 |
| tagName | string | 资源标签名 |
| src | string | 资源地址 |
| resConfig | string | 请求配置，Promise reject 时，可能是 axios 的请求配置 |

## API 扩展

除了 `setup` 和 `report`，还暴露了以下辅助函数，便于自定义集成：

- `callWarnHandler(config, error, vm, info)`：手动触发 Vue 警告处理和上报。
- `callErrorHandler(config, error, vm, info)`：手动触发 Vue 错误处理和上报。
- `callUnhandledrejection(config, event)`：手动处理 Promise 未捕获异常并上报。
- `callError(config, event)`：手动处理资源加载错误并上报。

这些函数可用于更细粒度的错误监控或自定义场景。

## 在线用例

<https://stackblitz.com/edit/stackblitz-starters-ofnzdvcm?embed=1&file=index.html>

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
