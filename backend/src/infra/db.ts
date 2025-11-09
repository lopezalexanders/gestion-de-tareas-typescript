import knex, { Knex } from 'knex';

import { appConfig } from '../config/env.js';

const connection =
  appConfig.nodeEnv === 'test'
    ? { filename: ':memory:' }
    : { filename: appConfig.database.connection.replace('file:', '') };

export const knexConfig: Knex.Config = {
  client: appConfig.database.client,
  connection,
  useNullAsDefault: true,
  pool: {
    min: 1,
    max: 5,
    afterCreate: (conn: any, done: any) => {
      conn.run('PRAGMA foreign_keys = ON', done);
    },
  },
  migrations: {
    directory: './src/infra/migrations',
    extension: 'ts',
  },
};

export const db = knex(knexConfig);
