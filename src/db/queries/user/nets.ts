import { TQuery } from '../../types/types';
import { IUserNet } from '../../../domain/types/net.types';
import { IMember } from '../../../domain/types/member.types';

export interface IQueriesUserNets {
  get: TQuery<[
    ['user_id', number],
  ], IUserNet>;
  getTop: TQuery<[
    ['user_id', number],
  ], IMember>,
}

export const get = `
  SELECT
    nets.*,
    nodes.*,
    nodes.node_id::int,
    nodes.parent_node_id::int,
    nets.net_id::int,
    nets_data.name,
    members.user_id,
    members.confirmed
  FROM members
  INNER JOIN nodes ON
    nodes.node_id = members.member_id
  INNER JOIN nets ON
    nets.net_id = nodes.net_id
  INNER JOIN nets_data ON
    nets_data.net_id = nets.net_id
  WHERE members.user_id = $1
  ORDER BY nets.net_level
`;

export const getTop = `
  SELECT
    nodes.*,
    nodes.node_id::int,
    nodes.parent_node_id::int,
    nodes.net_id::int,
    members.*,
    members.user_id::int
  FROM members
  INNER JOIN nodes ON
    nodes.node_id = members.member_id
  INNER JOIN nets ON
    nets.net_id = nodes.net_id
  WHERE
    members.user_id = $1 AND
    nets.net_level = 0
`;
