/**
 * 导入工具函数
 */
// @ts-ignore
import { after, isFunction } from '@ustinian-wang/kit';

/**
 * 全局声明Vue类型
 */
declare global {
    interface Window {
        Vue?: any;
    }
}

/**
 * 配置项类型定义
 */
type setupConfigDef = {
    force?: boolean, // 是否强制安装, 默认false，setup默认只能执行一次，重复setup的话，也只执行一次，但如果设置fouce为true，则每次setup都会重新初始化
    appId?: string, // 应用ID
    api?: string | Function, // 上报地址
    debug?: boolean, // 是否为调试模式
    filter?: (data: reportDataDef) => boolean, // 过滤函数
    transform?: (data: reportDataDef) => reportDataDef | object, // 转换函数
    warnHandler?: (error: Error, vm: any, info: string) => void, // Vue.config.warnHandler 警告处理函数
    errorHandler?: (error: Error, vm: any, info: string) => void, // Vue.config.errorHandler 错误处理函数
    unhandledrejection?: (event: PromiseRejectionEvent) => void, // window.unhandledrejection 未捕获异常处理函数
    onerror?: (message: string, source: string, lineno: number, colno: number, error: Error) => void, // window.onerror 错误处理函数
    error?: (event: Event) => void, // window.addEventListener('error', config.error) 资源加载错误处理函数
    report?: (config: setupConfigDef, data: reportDataDef) => void, // 上报回调
}

/**
 * 上报数据类型定义
 */
type reportDataDef = {
    appId?: string, // 应用ID
    type?: string, // 类型
    error?: Error, // 错误
    vmName?: string, // 组件名称
    info?: string, // 信息
    message?: string, // 消息
    stack?: string, // 堆栈
    url?: string, // 地址
    time?: number, // 时间
    userAgent?: string, // 用户代理
    source?: string, // 来源
    lineno?: number, // 行号
    colno?: number, // 列号
    reason?: any, // 原因
    tagName?: string, // 标签名称
    src?: string, // 出错的静态资源地址
    resConfig?: string, // 请求配置, promise reject的时候,可能是来子axios的请求
}

/**
 * 处理Vue警告
 * @param config 配置项
 * @param error 错误对象
 * @param vm Vue实例
 * @param info 警告信息
 */
export function callWarnHandler(config: setupConfigDef, error: Error, vm: any, info: string){
    config.warnHandler?.(error, vm, info);
    report(config, {
        type: 'vue-warn',
        error,
        vmName: vm?.$options?.name,
        info
    })
}

/**
 * 处理Vue错误
 * @param config 配置项
 * @param error 错误对象
 * @param vm Vue实例
 * @param info 错误信息
 */
export function callErrorHandler(config: setupConfigDef, error: Error, vm: any, info: string){
    config.errorHandler?.(error, vm, info);
    report(config, {
        type: 'vue-error',
        error,
        vmName: vm?.$options?.name,
        info
    })
}

/**
 * 处理未捕获的Promise异常
 * @param config 配置项
 * @param event Promise异常事件
 */
export function callUnhandledrejection(config: setupConfigDef, event: PromiseRejectionEvent){
    config.unhandledrejection?.(event);
    let reason = event.reason;
    let resConfig = "";
    if(reason?.response?.config){
        resConfig = JSON.stringify(reason.response.config);
    }
    report(config, {
        type: 'unhandledrejection',
        reason: event.reason,
        stack: event.reason?.stack,
        error: event.reason,
        message: event.reason?.message,
        resConfig,
    });
}

/**
 * 设置Vue错误处理
 * @param config 配置项
 */
function setupVue(config: setupConfigDef) {
    console_log('setupVue start', config);
    let Vue = window.Vue;
    if(Vue) {
        console_log('vue proxy warn handler start');
        let warnHandler = (error: Error, vm: any, info: string)=>{
            callWarnHandler(config, error, vm, info);
        };
        if(Vue.config.warnHandler){
            Vue.config.warnHandler = after(Vue.config.warnHandler, warnHandler);
        }else{
            Vue.config.warnHandler = warnHandler;
        }
        console_log('vue proxy warn handler end');
        console_log('vue proxy error handler start');
        let errorHandler = (error: Error, vm: any, info: string)=>{
            callErrorHandler(config, error, vm, info);
        };
        if(Vue.config.errorHandler){
            Vue.config.errorHandler = after(Vue.config.errorHandler, errorHandler);
        }else{
            Vue.config.errorHandler = errorHandler;
        }
        console_log('vue proxy error handler end');
    }
    console_log('setupVue end', config);
}

/**
 * 处理资源加载错误
 * @param config 配置项
 * @param event 错误事件
 */
export const callError = (config: setupConfigDef, event: Event)=>{
    config.error?.(event);
    const target = event.target as HTMLElement;
    let tagName = target?.tagName?.toLowerCase();
    let tagList = ['img', 'script', 'link'];
    if (
        target &&
        tagList.includes(tagName)
    ) {
        report(config, {
            type: 'resource-error',
            tagName,
            src: (target as any).src || (target as any).href,
        });
    }
}

/**
 * 设置全局错误处理
 * @param config 配置项
 */
function setupWin(config: setupConfigDef) {
    console_log('setupWin start');
    console_log('setupWin onerror start');
    let onerror = function(message: string, source: string, lineno: number, colno: number, error: Error) {
        config.onerror?.(message, source, lineno, colno, error);
        report(config, {
            type: 'onerror',
            message,
            source,
            lineno,
            colno,
            stack: error?.stack,
            error,
        });
    } as OnErrorEventHandler;
    // 捕获全局 JS 错误
    if(window.onerror){
        window.onerror = after(window.onerror, onerror) as OnErrorEventHandler;
    }else{
        window.onerror = onerror;
    }
    console_log('setupWin onerror end');
    console_log('setupWin unhandledrejection start');
    // 捕获 Promise 未捕获异常
    window.addEventListener('unhandledrejection', function (event) {
        callUnhandledrejection(config, event);
    });
    console_log('setupWin unhandledrejection end');
    console_log('setupWin error start');
    // 捕获资源加载错误
    window.addEventListener(
        'error',
        function (event: Event) {
            callError(config, event);
        },
        true // 必须捕获阶段
    );
    console_log('setupWin error end');
}

/**
 * 合并配置项
 * @param config 用户配置
 * @returns 合并后的配置
 */
function assignConfig(config: setupConfigDef): setupConfigDef {
    let defaultConfig = {
    }
    return { ...defaultConfig, ...config };
}

let is_debug = false;
/**
 * 调试日志
 * @param args 日志参数
 */
function console_log(...args: any[]) {
    if(is_debug) {
        console.log(`[monitor] `, ...args);
    }
}

let is_setup = false;
/**
 * 初始化监控
 * @param config 配置项
 */
export function setup(config: setupConfigDef) {
    console_log('setup launch start');
    if(!config.force) {
        if(is_setup) {
            console_log('setup already launch', config);
            return;
        }
        is_setup = true;
    }
    config = assignConfig(config);
    is_debug = config.debug || false;
    console_log('setup start');
    setupVue(config);
    setupWin(config);
    console_log('setup end');
    console_log('setup launch end');
}

/**
 * 上报错误信息
 * @param config 配置项
 * @param data 上报数据
 */
export function report(config: setupConfigDef, data: reportDataDef) {
    config.report?.(config, data);
    console_log('report start');
    config = assignConfig(config);

    let {
        appId = '',
        api = ''
    } = config;

    if(isFunction(config?.filter)) {
        if(config?.filter?.(data)) {
            console_log('report filter report', data);
            return;
        }
    }

    data = {
        ...data,
        appId,
        time: Date.now(),
        url: location.href,
        userAgent: navigator.userAgent,
    }
    if(isFunction(config?.transform)) {
        console_log('report transform before', data);
        data = config?.transform?.(data) as reportDataDef;
        console_log('report transform after', data);
    }

    if(typeof api === 'string') {   
        console_log('report api function', data);
        fetch(api, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });      
    } else {
        console_log('report api fetch', data);
        api(data);
    }
}