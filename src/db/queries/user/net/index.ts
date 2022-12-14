/* eslint-disable max-lines */
import {
  IUserNetDataResponse,
} from '../../../../client/common/api/types/types';
import { DbRecordOrNull } from '../../../../client/common/types';
import { IUserNet } from '../../../../router/types';
import {
  ITableNets, ITableNetsData, ITableNetsUsersData, ITableNodes,
} from '../../../db.types';
import { TQuery } from '../../../types';
import { userInNetAndItsSubnets } from '../../../utils';

export interface IQueriesUserNet {
  find: TQuery<[
    ['user_id', number],
    ['node_id', number],
  ], IUserNet>
  read: TQuery<[
    ['user_id', number],
    ['net_node_id', number],
  ],
    ITableNets &
    ITableNetsData &
    ITableNetsUsersData
  >;
  getNodes: TQuery<[
    ['user_id', number],
    ['net_node_id', number | null],
  ],
    ITableNodes &
    DbRecordOrNull<
      Pick<ITableNetsUsersData, 'confirmed'>
    >
  >;
  getData: TQuery<[
    ['user_id', number],
    ['net_node_id', number],
  ], IUserNetDataResponse>
}

export const find = `
  SELECT
    nodes.*,
    nets_users_data.confirmed,
    nets.net_level
  FROM nets_users_data
  INNER JOIN nets ON
    nets.net_node_id = nets_users_data.net_node_id
  INNER JOIN nodes ON
    nodes.node_id = nets_users_data.node_id 
  WHERE
    nets_users_data.user_id = $1 AND
    nets_users_data.node_id = $2
`;

export const read = `
  SELECT
    nets.*,
    nets_data.*,
    nets_users_data.node_id,
    nets_users_data.confirmed
  FROM nets_users_data
  INNER JOIN nets ON
    nets.net_node_id = nets_users_data.net_node_id
  INNER JOIN nets_data ON
    nets_data.net_node_id = nets.net_node_id
  INNER JOIN nodes ON
    nodes.node_id = nets_users_data.node_id
  WHERE
    nets_users_data.user_id = $1 AND
    nets_users_data.net_node_id = $2
`;

export const getNodes = `
  SELECT
    nodes.*,
    nets_users_data.confirmed
  FROM nets_users_data
  INNER JOIN nets ON
    nets.net_node_id = nets_users_data.net_node_id
  INNER JOIN nodes ON
    nodes.node_id = nets_users_data.node_id
  WHERE ${userInNetAndItsSubnets()}
  ORDER BY nets.net_level DESC
`;

export const getData = `
  SELECT
    nodes.node_id,
    nodes.parent_node_id,
    nets_users_data.confirmed,
    users_members.vote,
    SUM (
      CASE
        WHEN um.vote = true THEN 1
        ELSE 0
      END
    ) AS vote_count
  FROM nets_users_data
  INNER JOIN nets ON
    nets.net_node_id = nets_users_data.net_node_id
  INNER JOIN nodes ON
    nodes.node_id = nets_users_data.node_id
  LEFT JOIN users_members ON
    users_members.user_id = nets_users_data.user_id AND
    users_members.member_id = nets_users_data.user_id
  LEFT JOIN users_members as um ON
    um.member_id = nets_users_data.user_id AND
    um.parent_node_id = nodes.parent_node_id
  WHERE
    nets_users_data.user_id = $1 AND
    nets_users_data.net_node_id = $2
  GROUP BY
    nodes.node_id,
    nodes.parent_node_id,
    nets_users_data.confirmed,
    users_members.vote
`;
