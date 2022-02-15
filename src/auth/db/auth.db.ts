import { connect } from 'mongoose';
import { Logger } from '../../app/app.utils';

const logger = new Logger('auth.db.ts');

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 *
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 * DB_STRING_PROD=<your production database string>
 *
 * https://www.mongodb.com/developer/quickstart/cheat-sheet/
 */

export const connectAuthDb = (config: string) =>
  connect(config)
    .then(() => logger.log('Connected to todo-auth Mongo DB (updated)'))
    .catch((e) => logger.log('Connection to todo-auth Mongo DB failed', e));
