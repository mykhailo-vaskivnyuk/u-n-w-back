import path from 'node:path';
import vm from 'node:vm';
import { IRouterContext } from '../app/types';
import { TCache, TRequire } from './types';
import { getScriptInContext, log, resolve } from './utils';

const options = { displayErrors: true };

export const loadModule = (
  parentModuleDir: string,
  modulePath: string,
  { ...context } = {} as IRouterContext,
  mode?: 'isolate_all',
) => {
  if (mode !== 'isolate_all') vm.createContext(context);
  const __dirname = parentModuleDir;
  const newRequire = getRequire(__dirname, context) as TRequire;
  newRequire.cache = {};
  try {
    return newRequire(modulePath);
  } finally {
    delete require.cache[__filename];
  }
};

export const getRequire = (
  moduleDir: string,
  context: vm.Context | IRouterContext,
) => {
  const curRequire = ((modulePath: string) => {
    const __filename = resolve(moduleDir, modulePath);
    if (!__filename) return require(modulePath);
    const { cache } = curRequire;
    if (__filename in cache) return cache[__filename];
    const __dirname = path.dirname(__filename);
    log(__filename);
    const scriptInContext = getScriptInContext(__filename);
    const newContext = !vm.isContext(context);
    const nextContext = newContext ? vm.createContext({ ...context }) : context;
    const nextRequire = getRequire(__dirname, context) as TRequire;
    nextRequire.cache = newContext ? {} as TCache : curRequire.cache;
    const module = { exports: {} };
    const contextParams = {
      global: nextContext,
      require: nextRequire,
      module,
      exports: module.exports,
      __filename,
      __dirname,
    };
    const wrapper = vm.runInContext(scriptInContext, nextContext, options);
    wrapper(contextParams);
    cache[__filename] = module.exports;
    return module.exports;
  }) as TRequire;
  return curRequire;
};
