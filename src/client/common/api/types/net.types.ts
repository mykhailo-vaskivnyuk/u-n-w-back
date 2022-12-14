import {
  ITableNets, ITableNetsData, ITableNetsUsersData,
} from '../../../local/imports';
import { OmitNull } from '../../types';
import { IMemberResponse } from './member.types';

export type INetCreateParams  =
  Pick<ITableNetsData, 'name'> &
  { node_id: number | null };
export type INetResponse = null | (
  ITableNets &
  Pick<ITableNetsData, 'name'> &
  Pick<ITableNetsUsersData, 'node_id'>
);
export type INetsResponse = OmitNull<INetResponse>[];
export type INetEnterParams = { net_node_id: number };
export type INetReadParams = { node_id: number };
export type INetViewResponse = IMemberResponse[];
export const NET_VIEW_MAP = ['tree', 'circle'] as const;
export type NetViewKeys = typeof NET_VIEW_MAP[number];
