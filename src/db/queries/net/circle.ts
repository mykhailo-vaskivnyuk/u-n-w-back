/* eslint-disable max-lines */
import {
  IMemberDislikes, IMemberResponse, IMemberVotes,
} from '../../../client/common/api/types/types';
import { TQuery } from '../../types';

export interface IQueriesNetCircle {
  get: TQuery<[
    ['user_id', number],
    ['node_id', number],
    ['parent_node_id', number],
  ], IMemberResponse>;
  getDislikes: TQuery<[
    ['parent_node_id', number],
  ], IMemberDislikes>;
  getVotes: TQuery<[
    ['parent_node_id', number],
  ], IMemberVotes>;
}

export const get = `
  SELECT
    nodes.node_id,
    users_members.dislike,
    users_members.vote,
    CASE
      WHEN nodes_invites.token ISNULL THEN users.email
      ELSE null
    END AS name,
    SUM (
      CASE
        WHEN votes.vote = true THEN 1
        ELSE 0
      END
    ) AS vote_count
  FROM nodes
  LEFT JOIN nets_users_data AS members ON
    members.node_id = nodes.node_id
  LEFT JOIN users_members ON
    users_members.parent_node_id = $3 AND
    users_members.user_id = $1 AND
    users_members.member_id = members.user_id
  LEFT JOIN users ON
    users.user_id = members.user_id
  LEFT JOIN nodes_invites ON
    nodes_invites.node_id = nodes.node_id
  LEFT JOIN users_members AS votes ON
    votes.parent_node_id = $3 AND
    votes.member_id = members.user_id
  WHERE
    nodes.node_id <> $2 AND (
      nodes.node_id = $3 OR
      nodes.parent_node_id = $3
    )
  GROUP BY
    nodes.node_id,
    users_members.dislike,
    users_members.vote,
    nodes_invites.token,
    users.email
  ORDER BY nodes.node_level, nodes.node_position
`;

export const getDislikes = `
  SELECT
    nodes.node_id,
    members.user_id,
    SUM (
      CASE
        WHEN users_members.dislike = true THEN 1
        ELSE 0
      END
    ) AS dislike_count
  FROM nodes
  INNER JOIN nets_users_data AS members ON
    members.user_id = users_members.member_id
  LEFT JOIN users_members ON
    users_members.parent_node_id = $1 AND
    users_members.member_id = members.user_id
  LEFT JOIN nodes_invites ON
    nodes_invites.node_id = nodes.node_id
  WHERE
    (
      nodes.parent_node_id = $1 OR
      nodes.node_id = $1
    ) AND
    nodes_invites.token ISNULL
  GROUP BY
    nodes.node_id,
    members.user_id
  ORDER BY dislike_count DESC
`;

export const getVotes = `
  SELECT
    nodes.node_id,
    members.user_id,
    SUM (
      CASE
        WHEN users_members.vote = true THEN 1
        ELSE 0
      END
    ) AS vote_count
  FROM nodes
  INNER JOIN nets_users_data AS members ON
    members.node_id = nodes.node_id
  LEFT JOIN users_members ON
    users_members.parent_node_id = $1 AND
    users_members.member_id = members.user_id
  LEFT JOIN nodes_invites ON
    nodes_invites.node_id = nodes.node_id
  WHERE
    nodes.parent_node_id = $1 AND
    nodes_invites.token ISNULL
  GROUP BY
    nodes.node_id,
    members.user_id
  ORDER BY vote_count DESC
`;
