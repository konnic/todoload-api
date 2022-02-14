const crypto = require('crypto');
const fs = require('fs');

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

function createDotEnvBackup(data) {
  fs.writeFile('backup.env', data, (err) => {
    if (err) console.log(err);
  });
}

function generateNewSecrets() {
  fs.readFile('.env', (err, data) => {
    createDotEnvBackup(data);

    const fileContents = Buffer.from(data).toString();
    const [keep, drop] = fileContents.split('SECRETS=');

    const accessToken = generateRsaKeyPair();
    const refreshToken = generateRsaKeyPair();
    const secrets = {
      PUB_KEY_ACCESS_TOKEN: accessToken.publicKey,
      PRIV_KEY_ACCESS_TOKEN: accessToken.privateKey,
      PUB_KEY_REFRESH_TOKEN: refreshToken.publicKey,
      PRIV_KEY_REFRESH_TOKEN: refreshToken.privateKey,
    };
    const stringifiedSecrets = JSON.stringify(secrets);

    const fileOutput = `${keep}SECRETS=${stringifiedSecrets}`;
    const buffer = Buffer.from(fileOutput, 'utf-8');

    fs.writeFile('.env', buffer, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(
          '[generateNewSecrets] Generated new new secrets for .env file'
        );
      }
    });
  });
}

generateNewSecrets();
