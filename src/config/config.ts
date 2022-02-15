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

type Secrets = {
  PUB_KEY_ACCESS_TOKEN: string;
  PRIV_KEY_ACCESS_TOKEN: string;
  PUB_KEY_REFRESH_TOKEN: string;
  PRIV_KEY_REFRESH_TOKEN: string;
};
export const getSecrets = (): Secrets => {
  if (!config) loadConfig();

  return JSON.parse(process.env.SECRETS);
};
export const getSecretByKey = (key: keyof Secrets): string => {
  if (!config) loadConfig();

  return JSON.parse(process.env.SECRETS)[key];
};
