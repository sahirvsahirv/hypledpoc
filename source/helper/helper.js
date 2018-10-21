// Create and join channel for all 3 orgs separately
// TODO: take from key value store instead of harcoded values from config.json
// TODO: Make a separate route with URL or from server for org and join
// Path import should be the first import
const Constants = require('../constants.js');

function getUserName() {
  // TODO: Move 0. 
  // Ok as of now since it is always going to be admin and 0 and also will move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const username = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.usernameconfig]; // 'admin';
  Constants.logger.info(username);
  Constants.logger.info('****************** printed userName from config  ************************');
  return username;
}
module.exports.getUserName = getUserName;

function getUserPassword() {
  // TODO: Move 0. 
  // Ok as of now since it is always going to be admin and 0 and also will move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const secret = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.secret]; // 'admin';
  Constants.logger.info(secret);
  Constants.logger.info('****************** printed secret from config  ************************');
  return secret;
}
module.exports.getUserPassword = getUserPassword;

// Store the MSP name in config.json 'Org1' needs to be passed as in connectionprofile.yaml under Organisations
function getMSPofOrg(orgname) {
  // TODO: Later take i from the substr
  let orgnameMSP;
  if (orgname === Constants.ORG1) {
    orgnameMSP = Constants.hfc.getConfigSetting(Constants.cryptocontentconfig)[0][Constants.orgnameconfig];
  } else if (orgname === Constants.ORG2) {
    orgnameMSP = Constants.hfc.getConfigSetting(Constants.cryptocontentconfig)[1][Constants.orgnameconfig];
  } else if (orgname === Constants.ORG3) {
    orgnameMSP = Constants.hfc.getConfigSetting(Constants.cryptocontentconfig)[2][Constants.orgnameconfig];
  }
  Constants.logger.info(orgnameMSP);
  Constants.logger.info('****************** printed ORGNAMEMSP from config  ************************');
  return orgnameMSP;
}
module.exports.getMSPofOrg = getMSPofOrg;

function getClientConnectionFilePath() {
  // indicate to the application where the setup file is located so it able
  // to have the hfc load it to initalize the fabric client instance
  // connprofilepathstr = 'network-connection-profile-path'
  // TODO: do away with config.js
  // Pick up the path from config.js
  Constants.logger.info('****************** getClientConnectionFilePath - INSIDE FUNCTTION ************************');
  const connprofilepathstr = Constants.hfc.getConfigSetting(Constants.networkstr + Constants.configappendstr);
  Constants.logger.info(connprofilepathstr);
  Constants.logger.info('****************** printed the config file path ************************');
  // ERROR: No return statement was there
  return connprofilepathstr;
}
module.exports.getClientConnectionFilePath = getClientConnectionFilePath;

function getOrgPrivateKey(orgname) {
  // TODO: Use substring and modulatrize the below code
  let i;
  if (orgname === Constants.ORG1) {
    i = 0;
  } else if (orgname === Constants.ORG2) {
    i = 1;
  } else if (orgname === Constants.ORG3) {
    i = 2;
  }
  const privateKeyFilePath = Constants.hfc.getConfigSetting(Constants.cryptocontentconfig)[i][Constants.privatekeystr];
  // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/keystore/bdbfaa9c1b7faee6bb2cb42f699221bc6b9aabc286e43d735747e4805d98c799_sk',
  return privateKeyFilePath;
}
module.exports.getOrgPrivateKey = getOrgPrivateKey;

function getOrgSignedCert(orgname) {
  // TODO: Use substring and modulatrize the below code
  let i;
  if (orgname === Constants.ORG1) {
    i = 0;
  } else if (orgname === Constants.ORG2) {
    i = 1;
  } else if (orgname === Constants.ORG3) {
    i = 2;
  }
  // ERROR: UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'toString' of null
  // Clicking on the link - takes you to signedCertPEM - Had missed this line - null was getting passed
  const signedCertFilePath = Constants.hfc.getConfigSetting(Constants.cryptocontentconfig)[i][Constants.signedcertstr];
  // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' 
  return signedCertFilePath;
}
module.exports.getOrgSignedCert = getOrgSignedCert;

function getClientChannelTxFilePath() {
  // TODO: Move constants to a single place
  const channelTxfilepath = Constants.hfc.getConfigSetting(Constants.channeltxpathconfigstr) + '/' + Constants.channeltxfile; 
  // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx';
  return channelTxfilepath;
}
module.exports.getClientChannelTxFilePath = getClientChannelTxFilePath;

function getChannelNameFromConfig() {
  const channelName = Constants.hfc.getConfigSetting(Constants.channelnamestr);
  return channelName;
}
module.exports.getChannelNameFromConfig = getChannelNameFromConfig;