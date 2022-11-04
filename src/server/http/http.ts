import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import {
  HTTP_MODULES, REQ_MIME_TYPES_MAP, ReqMimeTypesKeys,
  REQ_MIME_TYPES_ENUM, JSON_TRANSFORM_LENGTH,
} from './constants';
import {
  IInputConnection, IInputConnectionConfig,
  IRequest, IResponse, IServer, THttpModule,
} from './types';
import { TPromiseExecutor } from '../../types/types';
import { IOperation, IParams, TOperationResponse } from '../../app/types';
import { ServerError, ServerErrorMap } from './errors';
import { getLog, getUrlInstance } from './utils';
import { createUnicCode } from '../../utils/crypto';
import { createStaticServer, TStaticServer } from './static';

class HttpConnection implements IInputConnection {
  private config: IInputConnectionConfig['http'];
  private server: IServer;
  private staticServer: TStaticServer;
  private callback?: (operation: IOperation) => Promise<TOperationResponse>;
  private modules: ReturnType<THttpModule>[] = [];

  constructor(config: IInputConnectionConfig['http']) {
    this.config = config;
    this.server = createServer(this.onRequest.bind(this));
    this.staticServer = createStaticServer(this.config.paths.public);
  }

  onOperation(fn: (operation: IOperation) => Promise<TOperationResponse>) {
    this.callback = fn;
    return this;
  }

  start() {
    if (!this.callback) {
      const e = new ServerError('E_NO_CALLBACK');
      logger.error(e, e.message);
      throw e;
    }

    try {
      const { modules } = this.config;
      this.modules = modules.map(
        (module) => require(HTTP_MODULES[module])[module](),
      );
    } catch (e: any) {
      logger.error(e, e.message);
      throw new ServerError('E_SERVER_ERROR');
    }

    const executor: TPromiseExecutor<void> = (rv, rj) => {
      const { port } = this.config;
      try {
        this.server.listen(port, rv);
      } catch (e: any) {
        logger.error(e, e.message);
        rj(new ServerError('E_LISTEN'));
      }
    }

    return new Promise<void>(executor);
  }

  private async onRequest(req: IRequest, res: IResponse) {
    if (!this.runModules(req, res)) return;

    const { api } = this.config.paths;
    const ifApi = new RegExp(`^/${api}(/.*)?$`);
    if (!ifApi.test(req.url || ''))
      return this.staticServer(req, res);
    
    try {
      const operation = await this.getOperation(req);
      const { options, data: { params } } = operation;
      const { sessionKey } = options;
      sessionKey && res.setHeader(
        'set-cookie', `sessionKey=${sessionKey}; Path=/; httpOnly`
      );
        
      const response = await this.callback!(operation);
      
      res.statusCode = 200;

      if (response instanceof Readable) {
        res.setHeader('content-type', REQ_MIME_TYPES_ENUM['application/octet-stream']);
        await new Promise((rv, rj) => {
          response.on('error', rj);
          response.on('end', rv);
          res.on('finish',
            () => logger.info(params, getLog(req, 'OK'))
          );
          response.pipe(res);
        });
        return;
      }

      const data = JSON.stringify(response);
      res.setHeader('content-type', REQ_MIME_TYPES_ENUM['application/json']);
      res.on('finish',
        () => logger.info(params, getLog(req, 'OK'))
      );
      res.end(data);
        
    } catch (e) {
      this.onError(e, req, res);
    }
  }
  
  private runModules(req: IRequest, res: IResponse) {
    for (const module of this.modules) {
      const next = module(req, res);
      if (!next) return false;
    }
    return true;
  }

  private async getOperation(req: IRequest) {
    const { options, names, params } = this.getRequestParams(req);
    const data = { params } as IOperation['data'];
    const { headers } = req;
    const contentType = headers['content-type'] as ReqMimeTypesKeys | undefined;
    const length = +(headers['content-length'] || Infinity);

    if (!contentType) return { options, names, data };

    if (!REQ_MIME_TYPES_MAP[contentType]) {
      throw new ServerError('E_BED_REQUEST');
    }
    if (length > REQ_MIME_TYPES_MAP[contentType].maxLength) {
      throw new ServerError('E_BED_REQUEST');
    }
      
    if (
      contentType === REQ_MIME_TYPES_ENUM['application/json']
      && length < JSON_TRANSFORM_LENGTH
    ) {
      Object.assign(params, await this.getJson(req));
      return { options, names, data };
    }
      
    const content = Readable.from(req);
    data.stream = { type: contentType, content };
      
    return { options, names, data };
  }
    
  private getRequestParams(req: IRequest) {
    const { origin, cookie } = req.headers;
    const { pathname, searchParams } = getUrlInstance(req.url, origin);
      
    const names = (pathname
      .replace('/' + this.config.paths.api, '')
      .slice(1) || 'index')
      .split('/')
      .filter((path) => Boolean(path));

    const params = {} as IParams;
    const queryParams = searchParams.entries();
    for (const [key, value] of queryParams) params[key] = value;

    const options: IOperation['options'] = {} as IOperation['options'];
    options.sessionKey = this.getSessionKey(cookie);
    options.origin = origin || '';

    return { options, names, params };
  }
      
  private getSessionKey(cookie?: string) {
    if (cookie) {
      const regExp = /sessionKey=([^\s]*)\s*;?/;
      const [, result] = cookie.match(regExp) || [];
      if (result) return result;
    }
    return createUnicCode(15);
  }
      
  private async getJson(req: IRequest) {
    try {
      const buffers: Uint8Array[] = [];
      for await (const chunk of req) buffers.push(chunk as any);
      const data = Buffer.concat(buffers).toString();
      return JSON.parse(data);
    } catch (e: any) {
      logger.error(e, e.message);
      throw new ServerError('E_BED_REQUEST');
    }
  }
      
  private onError(e: any, req: IRequest, res: IResponse) {
    let error = e;
    if (!(e instanceof ServerError)) {
      error = new ServerError('E_SERVER_ERROR');
    }
    const { code, statusCode = 500, details } = error as ServerError;
    
    res.statusCode = statusCode;
    if (code === 'E_REDIRECT') res.setHeader('location', details?.location || '/');
    details && res.setHeader('content-type', REQ_MIME_TYPES_ENUM['application/json']);
    logger.error({}, getLog(req, statusCode + ' ' + ServerErrorMap[code]));
    res.end(error.getMessage());

    if (code === 'E_SERVER_ERROR') throw e;
  }
}

export = HttpConnection;