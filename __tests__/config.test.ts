import { setup } from "../src";
jest.mock('@ustinian-wang/kit', () => ({
    after: jest.fn(function(origin, fn){
      return function(...args: any[]){
        origin(...args);
        fn(...args);
      }
    }),
    isFunction: jest.fn((fn) => typeof fn === 'function')
  }));
describe('config', () => {
    let originalVue: any;
    beforeEach(()=>{
        originalVue = window.Vue;
        window.Vue = {
          config: {
            warnHandler: jest.fn()
        },
      };  
    })
    afterEach(()=>{
      window.Vue = originalVue;
    })

    test('最开始没有warnHandler,看是否会注册', () => {
      const apiFn = jest.fn();
      let vueConfig = {
        warnHandler: null
      }
      const config = {
        api: apiFn,
        vueConfig,
        force: true
      };
      setup(config);
      expect(vueConfig.warnHandler).toBeInstanceOf(Function);
    });
    test('最开始没有errorHandler,看是否会注册', () => {
      const apiFn = jest.fn();
      let vueConfig = {
        errorHandler: null
      }
      const config = {
        api: apiFn,
        vueConfig,
        force: true
      };
      setup(config);
      console.log(vueConfig.errorHandler);
      expect(vueConfig.errorHandler).toBeInstanceOf(Function);
    });
  });