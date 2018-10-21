const Client = require('fabric-client');

const APPLICATION = 'APPLICATION';
const appLogger = Client.getLogger(APPLICATION);

const orgNameConfigStr = 'orgName';
const userNameConfigStr = 'username';
const usernameConfig = 'admins';
const cryptoContentConfigStr = 'cryptoContent';
const org1 = 'Org1';
const org2 = 'Org2';
const org3 = 'Org3';
const configStr = '-connection-profile-path';
const networkStr = 'network';
const clientConnProfileFileName = 'connectionprofile.yaml';
const privateKeyStr = 'privateKey';
const signedCertStr = 'signedCert';
const channelTxFile = 'channel.tx';
const channelTxPathConfigStr = 'CC_SRC_PATH';
// const signaturesAllOrgs = [];
const channelNameStr = 'channelName';
const ordererName = 'orderer.acme.com';
const peer0Org1 = 'peer0.org1.acme.com';
const peer0Org2 = 'peer0.org2.acme.com';
const peer0Org3 = 'peer0.org3.acme.com';
const secretPasswordStr = 'secret';
module.exports = {
  logger: appLogger,
  hfc: Client,
  orgnameconfig: orgNameConfigStr,
  usernameconfig: userNameConfigStr,
  username: usernameConfig,
  secret: secretPasswordStr,
  cryptocontentconfig: cryptoContentConfigStr,
  ORG1: org1,
  ORG2: org2,
  ORG3: org3,
  configappendstr: configStr,
  networkstr: networkStr,
  clientconnprofilefilename: clientConnProfileFileName,
  privatekeystr: privateKeyStr,
  signedcertstr: signedCertStr,
  channeltxfile: channelTxFile,
  channeltxpathconfigstr: channelTxPathConfigStr,
  // signaturesallorgs: signaturesAllOrgs,
  channelnamestr: channelNameStr,
  orderername: ordererName,
  peer0org1: peer0Org1,
  peer0org2: peer0Org2,
  peer0org3: peer0Org3
};
