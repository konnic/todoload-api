const crypto = require('crypto');
const fs = require('fs');

const ACCESS_TOKEN_KEY_PREFIX = 'access';
const REFRESH_TOKEN_KEY_PREFIX = 'refresh';
const prefixes = [ACCESS_TOKEN_KEY_PREFIX, REFRESH_TOKEN_KEY_PREFIX];

function generateRsaKeyPair() {
  return crypto.generateKeyPairSync('rsa', {
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

function generateNewKeyPairIfNoneIsPresent() {
  fs.stat('dist/keys', (err, stats) => {
    if (stats) {
      console.log('dist/keys exists, no need to generate a new key pair');
    }

    if (err) {
      console.log('dist/keys does not exists, generating new key pair');

      fs.mkdirSync('dist/keys');

      prefixes.forEach((prefix) => {
        const keyPair = generateRsaKeyPair();
        fs.writeFileSync(
          __dirname + `/dist/keys/${prefix}_rsa_pub.pem`,
          keyPair.publicKey
        );
        fs.writeFileSync(
          __dirname + `/dist/keys/${prefix}_rsa_priv.pem`,
          keyPair.privateKey
        );
        console.log(
          `[generateNewKeyPair] Generated new ${prefix}_rsa key pair into directory: ${__dirname}dist/keys`
        );
      });
    }
  });
}

generateNewKeyPairIfNoneIsPresent();
