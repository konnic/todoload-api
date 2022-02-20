import { config as dotEnvConfig, DotenvConfigOutput } from 'dotenv';
import { PoolConfig } from 'pg';

let config: DotenvConfigOutput;

export const loadConfig = (): DotenvConfigOutput => {
  config = dotEnvConfig();
  return config;
};

type Environemnt = {
  production: boolean;
};
export const env = {
  production: process.env.NODE_ENV === 'production',
};

export const getAuthDbConfig = (): string => {
  if (!config) loadConfig();

  return process.env.NODE_ENV === 'production'
    ? process.env.AUTH_DB_PROD
    : process.env.AUTH_DB;
};

export const getAppDbConfig = (isProduction: boolean): PoolConfig => {
  if (!config) loadConfig();

  return isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.APP_DB_USER,
        password: process.env.APP_DB_PASSWORD,
        database: process.env.APP_DB_NAME,
        host: process.env.APP_DB_HOST,
        port: +process.env.APP_DB_PORT,
      };
};

type Secrets = {
  PUB_KEY_ACCESS_TOKEN: string;
  PRIV_KEY_ACCESS_TOKEN: string;
  PUB_KEY_REFRESH_TOKEN: string;
  PRIV_KEY_REFRESH_TOKEN: string;
};
export const getSecretByKey = (key: keyof Secrets): string => {
  if (!config) loadConfig();

  return decodeFromBase64(process.env[key]);
};

const decodeFromBase64 = (data: string): string =>
  Buffer.from(data, 'base64').toString();
