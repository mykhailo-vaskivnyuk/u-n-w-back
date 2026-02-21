import pg, { QueryResultRow } from 'pg';
import {
  ITransactionConnection,
  IDatabaseConfig,
  IDatabaseConnection,
} from '../types/types';

class Connection implements IDatabaseConnection {
  private pool;

  constructor(config: IDatabaseConfig['connection']) {
    this.pool = new pg.Pool(config);
  }

  async connect() {
    const client = await this.pool.connect();
    client.release();
  }

  disconnect(): Promise<void> {
    return this.pool.end();
  }

  async query(sql: string, params: any[] = []): Promise<QueryResultRow> {
    const { rows } = await this.pool.query(sql, params);
    return rows;
  }

  async getTransactionConnection(): Promise<ITransactionConnection> {
    const client = await this.pool.connect();

    const query = async (
      sql: string,
      params: any[] = [],
    ): Promise<QueryResultRow> => {
      const { rows } = await client.query(sql, params);
      return rows;
    };

    const commit = async () => {
      await client.query('COMMIT;');
      client.release();
    };

    const rollback = async () => {
      try {
        await client.query('ROLLBACK;');
      } finally {
        client.release();
      }
    };

    try {
      await client.query('BEGIN;');
    } catch {
      rollback();
    }

    return { query, commit, rollback };
  }
}

export = Connection;
