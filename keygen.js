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
  const accessToken = generateRsaKeyPair();
  const refreshToken = generateRsaKeyPair();
  const secrets = {
    PUB_KEY_ACCESS_TOKEN: accessToken.publicKey,
    PRIV_KEY_ACCESS_TOKEN: accessToken.privateKey,
    PUB_KEY_REFRESH_TOKEN: refreshToken.publicKey,
    PRIV_KEY_REFRESH_TOKEN: refreshToken.privateKey,
  };
  const stringifiedSecrets = JSON.stringify(secrets);

  if (process.env.NODE_ENV === 'production') {
    const command = `heroku config:set SECRETS=${stringifiedSecrets} -a todoload-api`;
    try {
      const process = require('child_process').spawn('pbcopy');
      process.stdin.write(command);
      process.stdin.end();
      console.log(
        '###############################################################\n# Successfully copied heroku config:set command to clipboard! #\n###############################################################'
      );
    } catch (error) {
      console.log(error);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    fs.readFile('.env', (err, data) => {
      createDotEnvBackup(data);

      const fileContents = Buffer.from(data).toString();
      const [keep, drop] = fileContents.split('SECRETS=');

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
}

generateNewSecrets();
