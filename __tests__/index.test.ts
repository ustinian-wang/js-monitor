import { setup, report } from '../src/index';

describe('js-monitor', () => {
  let originalFetch: any;
  let originalVue: any;
  beforeAll(() => {
    // 备份全局对象
    originalVue = window.Vue;
    originalFetch = window.fetch;

    // mock window.Vue
    (window as any).Vue = {
      config: {
        warnHandler: jest.fn(),
        errorHandler: jest.fn(),
      },
    };

    // mock fetch
    window.fetch = jest.fn(() => Promise.resolve({})) as any;


  });

  afterAll(() => {
    // 恢复全局对象
    window.Vue = originalVue;
    window.fetch = originalFetch;
  });

  it.skip('report fetch', () => {
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
    const data = { type: 'test' };
    report(config, data);
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ appId: 'test-app', type: 'test' }));
  });

  it('report should not be called if filter returns true', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      filter: () => true,
    };
    const data = { type: 'test' };
    report(config, data);
    expect(apiFn).not.toHaveBeenCalled();
  });
  
  it('report should call if filter returns false', () => {
    const apiFn = jest.fn();
    const config = {
      appId: 'test-app',
      api: apiFn,
      filter: () => false,
    };
    const data = { type: 'test' };
    report(config, data);
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ appId: 'test-app', type: 'test' }));
  });
  
  it('config.transform should be called', () => {
    const apiFn = jest.fn();
    const transformFn = jest.fn(()=>{
      return {
        test: true
      }
    });
    const config = {
      appId: 'test-app',
      api: apiFn,
      transform: transformFn,
    };
    const data = { type: 'test' };
    report(config, data);
    expect(transformFn).toHaveBeenCalledWith(expect.objectContaining({ type: 'test' }));
    expect(apiFn).toHaveBeenCalledWith(expect.objectContaining({ type: 'test' }));
  });


});