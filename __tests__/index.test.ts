jest.mock('@ustinian-wang/kit', () => ({
  after: jest.fn(function(origin, fn){
    return function(...args: any[]){
      origin(...args);
      fn(...args);
    }
  }),
  isFunction: jest.fn((fn) => typeof fn === 'function')
}));

import { setup, report, callUnhandledrejection, ErrTypeEnum, reportDataDef } from '../src/index';

describe('js-monitor', () => {
  let originalFetch: any;
  let originalVue: any;
  let originalConsole: any;
  // let originalLog: any; 
  beforeAll(() => {
    // 备份全局对象
    originalVue = window.Vue;
    originalFetch = window.fetch;
    originalConsole = window.console;
    // originalLog = window.console.log;

    // mock window.Vue
    (window as any).Vue = {
      config: {
        warnHandler: jest.fn(),
        errorHandler: jest.fn(),
      },
    };

    // mock fetch
    window.fetch = jest.fn(() => Promise.resolve({})) as any;
    // window.console.log = jest.fn((...args: any[])=>{
    //   originalLog(...args);
    // });
    // window.console.error = jest.fn();
    // window.console.warn = jest.fn();
    // window.console.info = jest.fn();
    // window.console.debug = jest.fn();
    // window.console.assert = jest.fn();
    

  });

  afterAll(() => {
    // 恢复全局对象
    window.Vue = originalVue;
    window.fetch = originalFetch;
    window.console = originalConsole;
  });

  it('report fetch', () => {
    const config = {
      debug: true,
      appId: 'test-app',
      api: '/api/report',
      force: true,
    };
    setup(config);
    report(config, { type: 'test' });
    expect(window.fetch).toHaveBeenCalled();
  });
  
  it('pass config.appId', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
    };
    setup(config);
    report(config, { type: 'test' });
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ appId: 'test-app' }));
  });
  it('pass config.debug', () => {
    let originalLog = window.console.log;
    let logFn = jest.fn();
    window.console.log = logFn;
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      debug: true,
      force: true,
    };
    setup(config);
    report(config, { type: 'test' });
    expect(logFn).toHaveBeenCalled();
    window.console.log = originalLog;
  });
  it('report config.api is function', () => {
    const apiFn = jest.fn(() => {});
    const config = {
      debug: true,
      appId: 'test-app',
      api: apiFn,
      force: true,
    };
    setup(config);
    report(config, { type: 'test' });
    expect(apiFn).toHaveBeenCalled();
  });

  it('report should call api function if api is a function', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      filter: () => false,
      transform: (data: any) => data,
    };
    const data = { type: ErrTypeEnum.TEST };
    report(config, data);
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ appId: 'test-app', type: 'test' }));
  });

  it('config.filter should be called', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      filter: () => true,
    };
    const data: reportDataDef = { type: ErrTypeEnum.TEST };
    report(config, data);
    expect(apiFn).not.toHaveBeenCalled();
  });
  
  it('config.filter should be called', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      filter: () => false,
    };
    const data: reportDataDef = { type: ErrTypeEnum.TEST };
    report(config, data);
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ appId: 'test-app', type: 'test' }));
  });

  it('config.api should not be called if filter returns true', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      filter: () => true,
    };
    const data: reportDataDef = { type: ErrTypeEnum.TEST };
    report(config, data);
    expect(apiFn).not.toHaveBeenCalled();
  });

  it('config.transform should be called', () => {
    const data: reportDataDef = { type: ErrTypeEnum.TEST };
    const transformData = {
      test: true
    }

    const apiFn = jest.fn((data: any)=>{
      return data;
    });
    const transformFn = jest.fn(()=>{
      return transformData;
    });
    const config = {
      appId: 'test-app',
      api: apiFn,
      transform: transformFn,
    };
    report(config, data);
    expect(transformFn).toHaveBeenCalledWith(expect.objectContaining(data));
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining(transformData));
  });

  
  it('config.onerror should be called', () => {
    const config_onerror_fn = jest.fn();
    const config = {
      force: true,
      appId: 'test-app',
      api: '/api/report',
      onerror: config_onerror_fn,
    };
    window.onerror = jest.fn();

    setup(config);
    window.dispatchEvent(new Event('error'));
    expect(config_onerror_fn).toHaveBeenCalled();
    // expect(config_onerror_fn).toHaveBeenCalled();
  });
  it('config.error should be called', () => {
    const config_error_fn = jest.fn();
    const config = {
      force: true,
      appId: 'test-app',
      api: '/api/report',
      error: config_error_fn,
    };
    window.onerror = jest.fn();

    setup(config);
    window.dispatchEvent(new Event('error'));
    expect(config_error_fn).toHaveBeenCalled();
    // expect(config_onerror_fn).toHaveBeenCalled();
  });
  it('config.warnHandler should be called', () => {
    const config_warnHandler_fn = jest.fn();
    let vueConfig = {
      warnHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
      errorHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
    }
    const config = {
      force: true,
      vueConfig,
      appId: 'test-app',
      api: '/api/report',
      warnHandler: config_warnHandler_fn,
    };
    window.onerror = jest.fn();

    setup(config);
    vueConfig.warnHandler(new Error('test'));
    expect(config_warnHandler_fn).toHaveBeenCalled();
    // expect(config_onerror_fn).toHaveBeenCalled();
  });
  it('config.errorHandler should be called', () => {
    const config_errorHandler_fn = jest.fn();
    let vueConfig = {
      warnHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
      errorHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
    }
    const config = {
      force: true,
      debug: true,
      appId: 'test-app',
      api: '/api/report',
      errorHandler: config_errorHandler_fn,
      vueConfig,
    };
    window.onerror = jest.fn();

    setup(config);
    vueConfig.errorHandler(new Error('test'));
    expect(config_errorHandler_fn).toHaveBeenCalled();
    // expect(config_onerror_fn).toHaveBeenCalled();
  });

  it('report on window.onerror', () => {
    const config = {
      appId: 'test-app',
      api: '/api/report',
    };

    setup(config);
    window.onerror = jest.fn();
    window.dispatchEvent(new Event('error'));
    expect(window.onerror).toHaveBeenCalled();
  });

  it('report on window.onunhandledrejection', async() => {
    let apiFn = jest.fn(()=>{});
    let unhandledrejectionFn = jest.fn(()=>{});
    const config = {
      force: true,
      debug: true,
      appId: 'test-app',
      api: apiFn,
      unhandledrejection: unhandledrejectionFn,
    };
    setup(config);
    
    // @ts-ignore
    callUnhandledrejection(config, {
      reason: new Error('test'),
    });
    // window.dispatchEvent(new Event("unhandledrejection"));
    // window.dispatchEvent(new Event('error'));

    // 验证onunhandledrejection是否被调用
    expect(unhandledrejectionFn).toHaveBeenCalled();
  });

  it('report on Vue.config.warnHandler  ', () => {
    const apiFn = jest.fn();
    let vueConfig = {
      warnHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
      errorHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
    }
    const config = {
      debug: true,
      force: true,
      appId: 'test-app',
      api: apiFn,
      vueConfig
    };
    setup(config);
    vueConfig.warnHandler(new Error('test'));
    expect(apiFn).toHaveBeenCalled();
  });
  it('report on Vue.config.errorHandler  ', () => {
    
    let vueConfig = {
      warnHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
      errorHandler(error?: Error, vm?: Object, info?: Object){
        console.log(error, vm, info);
      },
    }
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      force: true,
      vueConfig
    };
    setup(config);
    vueConfig.errorHandler(new Error('test'));
    expect(apiFn).toHaveBeenCalled();
  });
  it(`aixos on callUnhandledrejection`, ()=>{
    let apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      force: true,
    };
    
    // @ts-ignore
    callUnhandledrejection(config, {
      reason: {
        response: {
          config: {
            url: 'https://www.baidu.com',
          }
        }
      }
    });
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({
      resConfig: JSON.stringify({
        url: 'https://www.baidu.com',
      })
    }));
  })
});
