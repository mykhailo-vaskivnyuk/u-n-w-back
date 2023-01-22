import * as P from './types';

export type TChatRemoveResponse = null;
export type TMemberInviteCreateResponse = string | null;
export type TNetConnectByTokenResponse = null | {
  net_node_id: number;
  error?: string;
};
export type TScriptsScriptjsResponse = Record<string, any>;
export type TTestDataResponse = {
  field1: null | number;
  field2: P.ITestResponse;
};
