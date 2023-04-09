import * as P from './types';

export type TEventsRead = {
  date?: string;
};
export type TEventsConfirm = {
  event_id: number;
};
export type TMemberDisconnectNotVote = {
  monthAgo: number;
};
export type TMemberDisconnectUnactive = {
  monthAgo: number;
};
export type TMemberInviteCreateResponse = string | null;
export type TNetConnectByTokenResponse = null | {
  net_id: number;
  error?: string;
};
export type TNetBoardClear = {
  weekAgo: number;
};
export type TScriptsScriptjsResponse = Record<string, any>;
export type TTestDataResponse = {
  field1: null | number;
  field2: P.ITestResponse;
};