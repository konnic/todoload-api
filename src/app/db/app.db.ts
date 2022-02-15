import { getAppDbConfig, env } from './../../config/config';
import { Pool } from 'pg';
import { Logger } from '../app.utils';

const logger = new Logger('app.db.ts');

const config = getAppDbConfig();
const pool = new Pool(getAppDbConfig());

if (!env.production) {
  pool
    .connect()
    .then(() =>
      logger.log(`Connected to PostgreSQL database ${config.database}.`)
    )
    .catch((e: Error) =>
      logger.log(
        `Connecting to PostgreSQL database ${config.database} failed.`,
        e
      )
    );
}

export default pool;
