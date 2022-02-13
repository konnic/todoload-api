import { config as dotEnvConfig, DotenvConfigOutput } from 'dotenv';
import { PoolConfig } from 'pg';

let config: DotenvConfigOutput;

export const loadConfig = (): DotenvConfigOutput => {
  config = dotEnvConfig();
  return config;
};

export const getAuthDbConfig = (): string => {
  if (!config) loadConfig();

  return process.env.NODE_ENV === 'production'
    ? process.env.DB_STRING_PROD
    : process.env.DB_STRING;
};

export const getAppDbConfig = (): PoolConfig => {
  if (!config) loadConfig();

  const {
    APP_DB_NAME,
    APP_DB_USER,
    APP_DB_PASSWORD,
    APP_DB_HOST,
    APP_DB_PORT,
  } = process.env;

  return {
    user: APP_DB_USER,
    password: APP_DB_PASSWORD,
    database: APP_DB_NAME,
    host: APP_DB_HOST,
    port: +APP_DB_PORT,
  };
};

type Environemnt = 'production' | 'development';
export const environment: Environemnt =
  (process.env.NODE_ENV as Environemnt) ?? 'development';

const test = 'hellox';
