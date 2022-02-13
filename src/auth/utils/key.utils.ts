import { generateKeyPairSync, KeyPairSyncResult } from 'crypto';
import * as fs from 'fs';
import { Logger } from '../../app/app.utils';
import { readFileSync } from 'fs';

const logger = new Logger(__filename);

const ACCESS_TOKEN_KEY_PREFIX = 'access';
const REFRESH_TOKEN_KEY_PREFIX = 'refresh';
const prefixes = [ACCESS_TOKEN_KEY_PREFIX, REFRESH_TOKEN_KEY_PREFIX];

function generateRsaKeyPair(): KeyPairSyncResult<string, string> {
  return generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });
}

export function generateNewKeyPair(): void {
  prefixes.forEach((prefix: string) => {
    const keyPair = generateRsaKeyPair();
    fs.writeFileSync(
      __dirname + `/keys/${prefix}_rsa_pub.pem`,
      keyPair.publicKey
    );
    fs.writeFileSync(
      __dirname + `/keys/${prefix}_rsa_priv.pem`,
      keyPair.privateKey
    );
    logger.log(
      `[generateNewKeyPair] Generated new ${prefix}_rsa key pair into directory: ${__dirname}/keys`
    );
  });
}

export const PUB_KEY_ACCESS_TOKEN = readFileSync(
  __dirname + `/keys/access_rsa_pub.pem`,
  'utf8'
);
export const PRIV_KEY_ACCESS_TOKEN = readFileSync(
  __dirname + `/keys/access_rsa_priv.pem`,
  'utf8'
);
export const PUB_KEY_REFRESH_TOKEN = readFileSync(
  __dirname + `/keys/refresh_rsa_pub.pem`,
  'utf8'
);
export const PRIV_KEY_REFRESH_TOKEN = readFileSync(
  __dirname + `/keys/refresh_rsa_priv.pem`,
  'utf8'
);
