import { IOperation } from '../../types/operation.types';
import { IAppThis } from '../types';
import { AppError, handleOperationError } from '../errors';

export const createSetInputConnection = (parent: IAppThis) => async () => {
  const { env } = parent.config;
  if (!parent.router && !env.API_UNAVAILABLE)
    throw new AppError('INIT_ERROR', 'ROUTER is not INITIALIZED');

  const handleOperation = async (operation: IOperation) => {
    try {
      return await parent.router!.exec(operation);
    } catch (e: any) {
      return handleOperationError(e);
    }
  };

  const { inConnection } = parent.config;
  const { transport } = inConnection;
  const server = inConnection['http'];
  const apiServer = transport === 'ws' && inConnection['ws'];
  const InConnection = require(server.path);
  const InApiConnection = apiServer && require(apiServer.path);
  parent.server = new InConnection(server);
  const apiServerInstance = InApiConnection &&
      new InApiConnection(apiServer, parent.server!.getServer());

  if (apiServerInstance) {
      parent.server!.setUnavailable('api');
      apiServerInstance.onOperation(handleOperation);
      env.API_UNAVAILABLE && apiServerInstance!.setUnavailable('api');
  } else {
      parent.server!.onOperation(handleOperation);
      env.API_UNAVAILABLE && parent.server!.setUnavailable('api');
  }

  env.STATIC_UNAVAILABLE && parent.server!.setUnavailable('static');
  await parent.server!.start();
  return parent;
};
