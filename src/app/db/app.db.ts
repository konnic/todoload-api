import { getAppDbConfig, env } from './../../config/config';
import { Pool } from 'pg';
import { Logger } from '../app.utils';

const logger = new Logger('app.db.ts');

const config = getAppDbConfig(env.production);
const pool = new Pool(config);

pool
  .connect()
  .then(() =>
    logger.log(
      `Connected to PostgreSQL database ${config.database || 'on Heroku'}.`
    )
  )
  .catch((e: Error) =>
    logger.log(
      `Connecting to PostgreSQL database ${
        config.database || 'on Heroku'
      } failed.`,
      e
    )
  );

export default pool;
