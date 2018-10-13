const Client = require('fabric-client');

const APPLICATION = 'APPLICATION';
const appLogger = Client.getLogger(APPLICATION);

const orgNameConfigStr = 'orgName';
const userNameConfigStr = 'username';
const usernameConfig = 'admins';
const cryptoContentConfigStr = 'cryptoContent';

module.exports = {
  logger: appLogger,
  hfc: Client,
  orgnameconfig: orgNameConfigStr,
  usernameconfig: userNameConfigStr,
  username: usernameConfig,
  cryptocontentconfig: cryptoContentConfigStr
};
