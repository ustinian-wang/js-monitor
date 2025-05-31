declare global {
    interface Window {
        Vue?: any;
    }
}

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
}

function after<T extends (...args: any[]) => any>(origin: T | undefined | null, fn: T): T {
    return function (this: any, ...args: any[]) {
        origin?.apply(this, args);
        fn?.apply(this, args);
    } as T;
}

function isFunction(fn: any) {
    return typeof fn === 'function';
}

function setupVue(config: setupConfigDef) {
    console_log('setupVue start', config);
    let Vue = window.Vue;
    if(Vue) {
        console_log('vue proxy warn handler start');
        Vue.config.warnHandler = after(Vue.config.warnHandler, (error: Error, vm: any, info: string)=>{
            config.warnHandler?.(error, vm, info);
            report(config, {
                type: 'vue-warn',
                error,
                vmName: vm?.$options?.name,
                info
            })
        });
        console_log('vue proxy warn handler end');
        console_log('vue proxy error handler start');
        Vue.config.errorHandler = after(Vue.config.errorHandler, (error: Error, vm: any, info: string)=>{
            config.errorHandler?.(error, vm, info);
            report(config, {
                type: 'vue-error',
                error,
                vmName: vm?.$options?.name,
                info
            })
        });
        console_log('vue proxy error handler end');
    }
    console_log('setupVue end', config);
}

function setupWin(config: setupConfigDef) {
    console_log('setupWin start');
    console_log('setupWin onerror start');
    // 捕获全局 JS 错误
    window.onerror = after(window.onerror, function(message: string, source: string, lineno: number, colno: number, error: Error) {
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
    }) as OnErrorEventHandler;
    console_log('setupWin onerror end');
    console_log('setupWin unhandledrejection start');
    // 捕获 Promise 未捕获异常
    window.addEventListener('unhandledrejection', function (event) {
        config.unhandledrejection?.(event);
        report(config, {
        type: 'unhandledrejection',
        reason: event.reason,
        stack: event.reason?.stack,
        error: event.reason,
            message: event.reason?.message,
        });
    });
    console_log('setupWin unhandledrejection end');
    console_log('setupWin error start');
    // 捕获资源加载错误
    window.addEventListener(
        'error',
        function (event: Event) {
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
        },
        true // 必须捕获阶段
    );
    console_log('setupWin error end');
}

function assignConfig(config: setupConfigDef): setupConfigDef {
    let defaultConfig = {
    }
    return { ...defaultConfig, ...config };
}

let is_debug = false;
function console_log(...args: any[]) {
    if(is_debug) {
        console.log(`[monitor] `, ...args);
    }
}

let is_setup = false;
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

// 上报函数
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