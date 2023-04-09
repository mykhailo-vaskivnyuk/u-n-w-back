import {
  ITableNets, ITableBoardMessages,
} from '../../types/db.tables.types';
import { TQuery } from '../../types/types';

export interface IQueriesNetBoard {
  get: TQuery<[
    ['net_id', number],
  ], ITableBoardMessages>;
  findUnactive: TQuery<[
    ['date', string],
  ], ITableNets>;
  create: TQuery<[
    ['net_id', number],
    ['user_id', number],
    ['message', string],
  ]>;
  update: TQuery<[
    ['message_id', number],
    ['user_id', number],
    ['message', string],
  ]>;
  remove: TQuery<[
    ['message_id', number],
    ['user_id', number],
  ]>;
  clear: TQuery<[
    ['date', string],
  ]>;
}

export const get = `
  SELECT *
  FROM board_messages
  WHERE net_id = $1
  ORDER BY date DESC
`;

export const findUnactive = `
  SELECT net_id::int
  FROM board_messages
  WHERE date < $1
  LIMIT 1
`;

export const create = `
  INSERT INTO board_messages (
    net_id, user_id, message, date
  )
  VALUES ($1, $2, $3, now() at time zone 'UTC')
`;

export const update = `
  UPDATE board_messages
  SET message = $3, date = now() at time zone 'UTC'
  WHERE
    message_id = $1 AND
    user_id = $2
`;

export const remove = `
  DELETE FROM board_messages
  WHERE
    message_id = $1 AND
    user_id = $2
`;

export const clear = `
  DELETE FROM board_messages
  WHERE date < $1
`;