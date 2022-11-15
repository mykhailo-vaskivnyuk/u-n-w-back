import { Readable } from 'node:stream';
import { IObject, TPrimitiv } from './types';
import { ReqMimeTypesKeys } from '../server/http/constants';

export interface IOperation {
  options: {
    sessionKey: string;
    origin: string;
    requestId?: number;
    pathname?: string;
  };
  names: string[];
  data: {
    stream?: { type?: ReqMimeTypesKeys; content: Readable };
    params: IParams;
  };
}
export type IParams = Record<string, TPrimitiv | IObject>;

export type TOperationResponse =
  | TPrimitiv
  | IObject
  | (IObject | TPrimitiv)[]
  | Readable;