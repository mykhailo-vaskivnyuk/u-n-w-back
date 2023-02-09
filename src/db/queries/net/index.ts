/* eslint-disable max-lines */
import { ITableNets, ITableNetsData } from '../../types/db.tables.types';
import { TQuery } from '../../types/types';
import { IQueriesNetUser } from './user';
import { IQueriesNetCircle } from './circle';
import { IQueriesNetTree } from './tree';
import { IQueriesNetFind } from './find';
import { IQueriesNetMessage } from './message';
import { IQueriesNetBoard } from './board';

export interface IQueriesNet {
  createInitial: TQuery<[], ITableNets>;
  setFirstNet: TQuery<[
    ['net_id', number],
  ], ITableNets>;
  createChild: TQuery<[
    ['parent_net_id', number],
  ], ITableNets>;
  createData: TQuery<[
    ['net_id', number],
    ['name', string],
  ], ITableNetsData>;
  updateCountOfNets: TQuery<[
    ['net_id', number | null],
    ['addCount', number],
  ], ITableNets>;
  // changeNetNode: TQuery<[
  //   ['new_net_node', number],
  //   ['cur_net_node', number],
  // ]>;
  // changeDataNetNode: TQuery<[
  //   ['new_net_node', number],
  //   ['cur_net_node', number],
  // ]>;
  remove: TQuery<[
    ['net_id', number],
  ]>;
  user: IQueriesNetUser;
  circle: IQueriesNetCircle;
  tree: IQueriesNetTree;
  find: IQueriesNetFind;
  message: IQueriesNetMessage;
  board: IQueriesNetBoard;
}

export const createInitial = `
  INSERT INTO nets
  RETURNING *
`;

export const setFirstNet = `
  UPDATE nets
  SET first_net_id = $1
  WHERE net_id = $1
`;

export const createChild = `
  INSERT INTO nets (
    net_level,
    parent_net_id,
    first_net_id
  )
  SELECT
    net_level + 1,
    net_id,
    first_net_id
  FROM nets
  WHERE net_id = $1
  RETURNING *
`;

export const createData = `
  INSERT INTO nets_data (
    net_id, name
  )
  VALUES ($1, $2)
  RETURNING *
`;

export const updateCountOfNets = `
  UPDATE nets
  SET count_of_nets = count_of_nets + $2
  WHERE net_id = $1
  RETURNING *
`;

// export const changeNetNode = `
//   UPDATE nets
//   SET net_id = $1, first_net_id = $1
//   WHERE net_id = $2
// `;

// export const changeDataNetNode = `
//   UPDATE nets_data
//   SET net_id = $1
//   WHERE net_id = $2
// `;

export const remove = `
  DELETE FROM nets
  WHERE net_id = $1
`;
