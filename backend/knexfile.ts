import type { Knex } from 'knex';

import { knexConfig } from './src/infra/db.js';

const config: { [key: string]: Knex.Config } = {
  development: knexConfig,
  test: {
    ...knexConfig,
    connection: { filename: ':memory:' },
  },
  production: knexConfig,
};

export default config;
