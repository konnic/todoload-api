import { generateKeyPairSync, KeyPairSyncResult } from 'crypto';
import * as fs from 'fs';
import { Logger } from '../../app/app.utils';

const logger = new Logger(__filename);

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

export function generateNewKeyPair(prefixes: string[]): void {
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
      `[generateKeyPairSync] Generated new ${prefix}_rsa key pair into directory: ${__dirname}/keys`
    );
  });
}
