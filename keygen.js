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

function encodeToBase64(data) {
  return Buffer.from(data).toString('base64');
}

function generateNewSecrets() {
  const accessToken = generateRsaKeyPair();
  const refreshToken = generateRsaKeyPair();

  const PUB_KEY_ACCESS_TOKEN = encodeToBase64(accessToken.publicKey);
  const PRIV_KEY_ACCESS_TOKEN = encodeToBase64(accessToken.privateKey);
  const PUB_KEY_REFRESH_TOKEN = encodeToBase64(refreshToken.publicKey);
  const PRIV_KEY_REFRESH_TOKEN = encodeToBase64(refreshToken.privateKey);

  if (process.env.NODE_ENV === 'production') {
    const command = `heroku config:set PUB_KEY_ACCESS_TOKEN=${PUB_KEY_ACCESS_TOKEN} PRIV_KEY_ACCESS_TOKEN=${PRIV_KEY_ACCESS_TOKEN} PUB_KEY_REFRESH_TOKEN=${PUB_KEY_REFRESH_TOKEN} PRIV_KEY_REFRESH_TOKEN=${PRIV_KEY_REFRESH_TOKEN} -a todoload-api`;
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
      const [keep, drop] = fileContents.split('# SECRETS');
      const append = `PUB_KEY_ACCESS_TOKEN=${PUB_KEY_ACCESS_TOKEN}\nPRIV_KEY_ACCESS_TOKEN=${PRIV_KEY_ACCESS_TOKEN}\nPUB_KEY_REFRESH_TOKEN=${PUB_KEY_REFRESH_TOKEN}\nPRIV_KEY_REFRESH_TOKEN=${PRIV_KEY_REFRESH_TOKEN}`;

      const fileOutput = `${keep}# SECRETS\n${append}`;
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
