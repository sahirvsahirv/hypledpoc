// const emptyPromise = require('empty-promise')
const express = require('express');
const chalk = require('chalk');
const debug = require('debug');
// const path = require('path');
// const fs = require('fs');
const Constants = require('../constants.js');
const ClientHelper = require('./helper.js');

// require for superagent - approach 1
// const nocache = require('superagent-no-cache');
//  const request = require('superagent');
// const prefix = require('superagent-prefix')('/static');

// chnage .eslintrc.js to accept console.log
// "rules": {
//  "comma-dangle": 0,
//  "no-console": 0
// }
// nodemon internal watch failed error
// echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
// https://stackoverflow.com/questions/34662574/node-js-getting-error-nodemon-internal-watch-failed-watch-enospc

const adminRouter = express.Router();

// body parser to know what you clicked
// npm install body-parser
const bodyparser = require('body-parser');

debug(chalk.yellow('entered the admin page'));
// convert the whole js file into a function so that we can export the module and say
// app.use
// render the transact.pub jade file
// require the fabric-client and fabric-ca-client to use the nodejs sdk
// npm install -g grpc
// do this first to avoid errors while installing hfc
// make sure that node 8.9.4 is installed
// npm install -g hfc
// there are errors - rolling back fabric

// docker login to do a docker pull - gowrir and the usual password
// docker pull hyperledger/fabric-peer:x86_64-1.1.0
// docker image ls

// do a npm install npm install fabric-sdk-node --save
// --save option to get added in package.json
// from this page - https://github.com/hyperledger/fabric-sdk-node
// require fabric-client

// eslint does not and might not recognise fabric-client since the IDE plug-in might
// not recognise this

// npm i -S fabric-client to get it installed in package.json
const Client = require('fabric-client');

const logger = Client.getLogger('APPLICATION');
let fabriCAClient = require('fabric-ca-client');

// TODO: check for null return case
function orgnameToMSPName(orgname) {
  let MSPName;
  switch (orgname) {
    case 'org1':
      MSPName = 'Org1MSP';
      break;
    case 'org2':
      MSPName = 'Org2MSP';
      break;
    case 'org3':
      MSPName = 'Org3MSP';
      break;
    default:
      MSPName = null;
      break;
  }
  return MSPName;
}const fs = require('fs');
/const fs = require('fs'); switch case to string split
fconst fs = require('fs');aseOrg(orgname) {
  let upperOrg;
  switch (orgname) {
    case 'org1':
      upperOrg = 'Org1';
      break;
    case 'org2':
      upperOrg = 'Org2';
      break;
    case 'org3':
      upperOrg = 'Org3';
      break;
    default:
      upperOrg = null;
      break;
  }
  return upperOrg;
}const fs = require('fs');
// CONSTANTS
const usernameConfig = 'admins';
const cryptoContent = 'cryptoContent';
const ordererName = 'orderer.acme.com';
const peer0Org1 = 'peer0.org1.acme.com';
const peer0Org2 = 'peer0.org2.acme.com';
const peer0Org3 = 'peer0.org3.acme.com';
const channelNameStr = 'channelName';
const orgNameConfigStr = 'orgName';
const userNameConfigStr = 'username';
const signedCertStr = 'signedCert';
const privateKeyStr = 'privateKey';
// Sign each created user
const signaturesAllOrgs = [];

async function CreateChannel(i) {
  logger.info('****************** CreateChannel - INSIDE FUNCTTION ************************');
  logger.info('****************** JOINING CHANNEL ************************');
  // loop through the orgname for join channel
  // TODO: Remove array [0] for Org2 and Org3
  // TODO: hack change it to substr later or devise another mechanism
  // Create channel with the orderer in Org1
  const username = Client.getConfigSetting(usernameConfig)[0][userNameConfigStr]; // 'admin';
  logger.info(username);
  logger.info('****************** printed userName from config  ************************');
  // from the DEBUG watch
  // "adminpw" Client.getConfigSetting("admins")[0]["secret"]
  // Client.getConfigSetting("cryptoContent")[0]["orgName"]
  const orgnameconst = Client.getConfigSetting(cryptoContent)[i][orgNameConfigStr]; // 'org1';
  logger.info(orgname);
  logger.info('****************** printed ORGNAME from config  ************************');
  // first read in the file, this gives us a binary config envelope
  /* const envelopeBytes =.then(() => {
   fs.readFileSync(path.join(
   '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx')); */
  // have the nodeSDK extract out the config update
  // need to create an object of Client to make extractChannelConfig visible
  // http://beautifytools.com/yaml-validator.php
  const config = '-connection-profile-path';
  const networkStr = 'network';
  let channelConfig = null;
  let createChannelTxId = null;
  // before configuring
  // const client = Client.loadFromConfig('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/connectionprofile.yaml');
  // client.loadFromConfig('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/org1.yaml');
  // after configuring
  logger.info(Client.getConfigSetting(networkStr + config));
  logger.info('****************** printed the config file path ************************');
  let client = Client.loadFromConfig(Client.getConfigSetting(networkStr + config));
  logger.info(Client.getConfigSetting(upperCaseOrg(orgname) + config));
  logger.info('****************** printed the orgname config file path ************************');
  client.loadFromConfig(Client.getConfigSetting(upperCaseOrg(orgname) + config));

  // const configUpdate = client.extractChannelConfig(envelopeBytes);
  // const configSignature = client.signChannelConfig(configUpdate);
  // debug(configSignature);
  // console.log(client);
  // do not join since when it is typecasted will not spread the object and show in console
  logger.info('****************** client after loadfromconfig START ************************');
  logger.info(client); // Does not type case and shows it fully
  logger.info('****************** client after loadfromconfig END ************************');
  // await needs the function - CreateChannel to be an async function
  // manage return of a promise by making the calling function async
  await client.initCredentialStores();
  logger.info('****************** initCredentialStores ::: SUCCESS ************************');
  // TODO: console.log expands it. Try DEBUG
  logger.info(client);
  logger.info('****************** printed client after calling initCredentialStores ************************');
  // const username = 'admin';
  if (username) {
    const user = await client.getUserContext(username, true);
    if (!user) {
      // throw new Error('user was not found :', username);
      // create a user context
      logger.info('****************** getUserContext had no user ************************');
      
      const createduser = await client.createUser({
        username: username, // 'admin'
        mspid: orgnameToMSPName(orgname), // 'Org1MSP',
        cryptoContent: {
          privateKey: Client.getConfigSetting(cryptoContent)[i][privateKeyStr], // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/keystore/bdbfaa9c1b7faee6bb2cb42f699221bc6b9aabc286e43d735747e4805d98c799_sk',
          signedCert: Client.getConfigSetting(cryptoContent)[i][signedCertStr] // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' 
        },
        skipPersistence: true // skip persistence - to resolve the error
        // Cannot save user to state store when stateStore is null
      });
      logger.info('****************** Created user::SUCCESS ************************');
      logger.info(createduser);
      logger.info('****************** Created user::printed created user above for org 0 ************************');
    } else { // created user
      logger.info('****************** USER ALREADY EXISTS ::SUCCESS ************************');
    }
    // TODO: Move constants to a single place
    const channelTxFile = 'channel.tx';
    const channelTxfilepath = Client.getConfigSetting('CC_SRC_PATH') + '/' + channelTxFile; // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx';
    // The client has been loaded with Org1 and certs and admin username
    // transaction created by the admin
    // TODO: change it to non-admin based on user context
    createChannelTxId = client.newTransactionID(true);
    logger.info('****************** NEWTRANSACTIONID - tx_id received by the admin ************************');
    logger.info(createChannelTxId);
    logger.info('****************** NEWTRANSACTIONID - printed client.newTransactionID ************************');
    const envelope = fs.readFileSync(channelTxfilepath);
    // the binary config update used in the signing process. channel.tx took this info from configtx.yaml
    // Download the platform specific binaries from here
    // curl -sSL https://goo.gl/6wtTN5 | bash -s 1.1.0
    // bash bootstrap.sh -d -s
    // ./configtxlator start
    // curl -X POST --data-binary @genesis.block http://127.0.0.1:7059/protolator/decode/common.Block > genesis.json
    // curl -X POST --data-binary @mychannel.tx http://127.0.0.1:7059/protolator/decode/common.Envelope > mychannel.json
    channelConfig = client.extractChannelConfig(envelope);

    const signature = client.signChannelConfig(channelConfig);
    logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG 0- DONE ************************');
    logger.info(channelConfig);
    logger.info(signature);
    logger.info('****************** pushing signature for org 0 - DONE ************************');
    signaturesAllOrgs.push(signature);
    logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG 0 - DONE ************************');
    // return client; // return the client loaded with the user in org1 and certs and not createduser;
  } // if (username)
  // now set the user context - post this is successful - persists user to the state store
  // TODO: how does it get client.createduser
  // Extract the created user from  createUser
  const createdUser = await client.getUserContext(username, true);
  logger.info('****************** client.getUserContext::Post Creating the user::SUCCESS ************************');
  const userPersisted = await client.setUserContext(createdUser, true);
  logger.info('****************** USER PERSISTED::client.setUserContext::SUCCESS ************************');
  logger.info(userPersisted);
  logger.info('****************** USER PERSISTED::client.setUserContext::printed user persisted ************************');
  const fabricCAClient = client.getCertificateAuthority();
  logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::SUCCESS ************************');
  logger.info(fabricCAClient);
  logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::client.getCertificateAuthority::printed ************************');

  if ((userPersisted != null) && (userPersisted.isEnrolled())) {
    logger.info(userPersisted);
    logger.info(userPersisted.isEnrolled());
    logger.info('****************** client.setUserContext returned TRUE. USER persisted ************************');  
  } else {
    client = null;
    logger.info('****************** client.setUserContext returned FALSE. USER not persisted ************************');  
  }
  debug(chalk.green('Creating channel'));
  logger.info('****************** CREATING CHANNEL ************************');
  if (client == null) {
    throw new Error('getRegisteredUsers - client returned null');
  }
  const channelName = Client.getConfigSetting(channelNameStr);
  // channel is created by the orderer initially
  // each peer will join the channel by sending channel configuration to each of the peer nodes
  // TODO: restructure Do this only if 0, 1, 2 are over
  let createChannelRequest = null;
  // if (i === 2) {  // ERROR: Each org creates it own channel 
  createChannelRequest = {
    name: channelName, // 'mychannel',
    orderer: ordererName, // 'orderer.acme.com',
    signatures: signaturesAllOrgs, // [signature],
    config: channelConfig,
    txId: createChannelTxId
  };
  const channel = client.getChannel(channelName);
  if (!channel) {
    // create a channel
    // TO create the channel - the network should be running
    const response = await client.createChannel(createChannelRequest);
    if (response) {
      logger.info('****************** CREATECHANNEL - DONE ************************');
      logger.info(response);
      logger.info('****************** CREATECHANNEL - printed createChannelResponse ************************');
    } else {
      logger.info('****************** CREATECHANNEL - FAILED ************************');
    }// create channel failed
  } // if channel does not exist create a channel
  // } // only if i === 2
  // exists because we created it now - or it already exists
  // Comment end - trying to sign all orgs with the configtxlator
  return client;
} // CreateChannel
/*
async function getRegisteredUsers(username, orgname) {
  logger.info('****************** getRegisteredUser - INSIDE FUNCTTION ************************');
  // The async function written to separate code
  let client = await getClientForOrgs(username, orgname);
  // now set the user context - post this is successful - persists user to the state store
  // TODO: how does it get client.createduser
  // Extract the created user from  createUser
  const createdUser = await client.getUserContext(username, true);
  logger.info('****************** client.getUserContext::Post Creating the user::SUCCESS ************************');
  const userPersisted = await client.setUserContext(createdUser, true);
  logger.info('****************** USER PERSISTED::client.setUserContext::SUCCESS ************************');
  logger.info(userPersisted);
  logger.info('****************** USER PERSISTED::client.setUserContext::printed user persisted ************************');
  const fabricCAClient = client.getCertificateAuthority();
  logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::SUCCESS ************************');
  logger.info(fabricCAClient);
  logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::client.getCertificateAuthority::printed ************************');

  if ((userPersisted != null) && (userPersisted.isEnrolled())) {
    logger.info(userPersisted);
    logger.info(userPersisted.isEnrolled());
    logger.info('****************** client.setUserContext returned FALSE. USER not persisted ************************');  
  } else {
    client = null;
  }
  return client;
}
*/
// const utils = require('fabric-client/lib/utils');
/*
async function createClientForOrg(username, orgname) {
  logger.info('****************** createClientForOrg - INSIDE FUNCTTION ************************');
  // first read in the file, this gives us a binary config envelope
  // const envelopeBytes =.then(() => {
  // fs.readFileSync(path.join(
  // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx')); 
  // have the nodeSDK extract out the config update
  // need to create an object of Client to make extractChannelConfig visible
  // http://beautifytools.com/yaml-validator.php
  const config = '-connection-profile-path';
  const networkStr = 'network';
  // before configuring
  // const client = Client.loadFromConfig('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/connectionprofile.yaml');
  // client.loadFromConfig('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/org1.yaml');
  // after configuring
  logger.info(Client.getConfigSetting(networkStr + config));
  logger.info('****************** printed the config file path ************************');
  const client = Client.loadFromConfig(Client.getConfigSetting(networkStr + config));
  logger.info(Client.getConfigSetting(upperCaseOrg(orgname) + config));
  logger.info('****************** printed the orgname config file path ************************');
  client.loadFromConfig(Client.getConfigSetting(upperCaseOrg(orgname) + config));

  // const configUpdate = client.extractChannelConfig(envelopeBytes);
  // const configSignature = client.signChannelConfig(configUpdate);
  // debug(configSignature);
  // console.log(client);
  // do not join since when it is typecasted will not spread the object and show in console
  logger.info('****************** client after loadfromconfig START ************************');
  logger.info(client); // Does not type case and shows it fully
  logger.info('****************** client after loadfromconfig END ************************');
  // await needs the function - CreateChannel to be an async function
  // manage return of a promise by making the calling function async
  await client.initCredentialStores();
  logger.info('****************** initCredentialStores ::: SUCCESS ************************');
  // TODO: console.log expands it. Try DEBUG
  logger.info(client);
  logger.info('****************** printed client after calling initCredentialStores ************************');
  return client;
}

async function createClientForOrgs(username, orgname) {
  logger.info('****************** createClientForOrg - INSIDE FUNCTTION ************************');
  // first read in the file, this gives us a binary config envelope
  // const envelopeBytes =.then(() => {
  // fs.readFileSync(path.join(
  // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx')); 
  // have the nodeSDK extract out the config update
  // need to create an object of Client to make extractChannelConfig visible
  // http://beautifytools.com/yaml-validator.php
  const config = '-connection-profile-path';
  const networkStr = 'network';
  // before configuring
  // const client = Client.loadFromConfig('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/connectionprofile.yaml');
  // client.loadFromConfig('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/org1.yaml');
  // after configuring
  logger.info(Client.getConfigSetting(networkStr + config));
  logger.info('****************** printed the config file path ************************');
  const client = Client.loadFromConfig(Client.getConfigSetting(networkStr + config));
  logger.info(Client.getConfigSetting(upperCaseOrg(orgname) + config));
  logger.info('****************** printed the orgname config file path ************************');
  client.loadFromConfig(Client.getConfigSetting(upperCaseOrg(orgname) + config));

  // const configUpdate = client.extractChannelConfig(envelopeBytes);
  // const configSignature = client.signChannelConfig(configUpdate);
  // debug(configSignature);
  // console.log(client);
  // do not join since when it is typecasted will not spread the object and show in console
  logger.info('****************** client after loadfromconfig START ************************');
  logger.info(client); // Does not type case and shows it fully
  logger.info('****************** client after loadfromconfig END ************************');
  // await needs the function - CreateChannel to be an async function
  // manage return of a promise by making the calling function async
  await client.initCredentialStores();
  logger.info('****************** initCredentialStores ::: SUCCESS ************************');
  // TODO: console.log expands it. Try DEBUG
  logger.info(client);
  logger.info('****************** printed client after calling initCredentialStores ************************');
  return client;
} // createClientForOrgs 
async function getClientForOrg(username, orgname) {
  logger.info('****************** getClientForOrg - INSIDE FUNCTTION ************************');
  const client = await createClientForOrg(username, orgname);
  // const username = 'admin';
  if (username) {
    const user = await client.getUserContext(username, true);
    if (!user) {
      // throw new Error('user was not found :', username);
      // create a user context
      logger.info('****************** getUserContext had no user ************************');
      // TODO: Remove array [0] for Org2 and Org3
      const createduser = await client.createUser({
        username: username, // 'admin'
        mspid: orgnameToMSPName(orgname), // 'Org1MSP',
        cryptoContent: {
          privateKey: Client.getConfigSetting(cryptoContent)[0][privateKeyStr], // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/keystore/bdbfaa9c1b7faee6bb2cb42f699221bc6b9aabc286e43d735747e4805d98c799_sk',
          signedCert: Client.getConfigSetting(cryptoContent)[0][signedCertStr] // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' 
        },
        skipPersistence: true // skip persistence - to resolve the error
        // Cannot save user to state store when stateStore is null
      });
      logger.info('****************** Created user ::SUCCESS ************************');
      logger.info(createduser);
      logger.info('****************** Created user::printed created user above ************************');
      // return client; // return the client loaded with the user in org1 and certs and not createduser;
    } else {
      logger.info('****************** USER ALREADY EXISTS ::SUCCESS ************************');
    }
  } // if (username)
  return client; // return the client loaded with the user in org1 and certs and not createduser;
} // getClientForOrg

async function signClientsForOrgs(username, orgname) {
  logger.info('****************** signClientsForOrgs - INSIDE FUNCTTION ************************');
  const client = await createClientForOrg(username, orgname);
  // TODO: Remove this redo work
  const channelTxFile = 'channel.tx';
  const channelTxfilepath = Client.getConfigSetting('CC_SRC_PATH') + '/' + channelTxFile; // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx';
  const envelope = fs.readFileSync(channelTxfilepath);
  const channelConfig = client.extractChannelConfig(envelope);
  // The client has been loaded with Org1 and certs and admin username
  // transaction created by the admin
  // TODO: change it to non-admin based on user context
  // const username = 'admin';
  if (username) {
    const user = await client.getUserContext(username, true);
    if (!user) {
      // throw new Error('user was not found :', username);
      // create a user context
      logger.info('****************** getUserContext had no user - creating a user for all 3 orgs ************************');
      // TODO: Remove array [0] for Org2 and Org3
      // TODO: hack change it to substr later or devise another mechanism
      let i = 0;
      if (orgname === 'org1') {
        i = 0;
      } else if (orgname === 'org2') {
        i = 1;
      } else if (orgname === 'org3') {
        i = 2;
      }
      let createduser = await client.createUser({
        username: username, // 'admin'
        mspid: orgnameToMSPName(orgname), // 'Org1MSP',
        cryptoContent: {
          privateKey: Client.getConfigSetting(cryptoContent)[i][privateKeyStr], // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/keystore/bdbfaa9c1b7faee6bb2cb42f699221bc6b9aabc286e43d735747e4805d98c799_sk',
          signedCert: Client.getConfigSetting(cryptoContent)[i][signedCertStr] // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' 
        },
        skipPersistence: true // skip persistence - to resolve the error
        // Cannot save user to state store when stateStore is null
      });
      logger.info('****************** Created user::SUCCESS ************************');
      logger.info(createduser);
      logger.info('****************** Created user::printed created user above for org 0 ************************');

      // Sign each created user
      const signatures = [];
      const signature = client.signChannelConfig(channelConfig);
      logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG 0- DONE ************************');
      logger.info(channelConfig);
      logger.info(signature);
      logger.info('****************** pushing signature for org 0 - DONE ************************');
      signatures.push(signature);
      logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG 0 - DONE ************************');
    } else {
      logger.info('****************** USER ALREADY EXISTS ::SUCCESS ************************');
    }
  } // if (username)
  return client; // return the client loaded with the user in org1 and certs and not createduser;
}

async function getRegisteredUser(username, orgname) {
  logger.info('****************** getRegisteredUser - INSIDE FUNCTTION ************************');
  // The async function written to separate code
  let client = await getClientForOrg(username, orgname);
  // now set the user context - post this is successful - persists user to the state store
  // TODO: how does it get client.createduser
  // Extract the created user from  createUser
  const createdUser = await client.getUserContext(username, true);
  logger.info('****************** client.getUserContext::Post Creating the user::SUCCESS ************************');
  const userPersisted = await client.setUserContext(createdUser, true);
  logger.info('****************** USER PERSISTED::client.setUserContext::SUCCESS ************************');
  logger.info(userPersisted);
  logger.info('****************** USER PERSISTED::client.setUserContext::printed user persisted ************************');
  const fabricCAClient = client.getCertificateAuthority();
  logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::SUCCESS ************************');
  logger.info(fabricCAClient);
  logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::client.getCertificateAuthority::printed ************************');

  if ((userPersisted != null) && (userPersisted.isEnrolled())) {
    logger.info(userPersisted);
    logger.info(userPersisted.isEnrolled());
    logger.info('****************** client.setUserContext returned FALSE. USER not persisted ************************');  
  } else {
    client = null;
  }
  return client;
}
*/
function channelAddPeer(client, channel, peerStr, orgname) {
  // Peer object is not required since we have already loadedfromconfig
  // Due to the error while joining channel - add peer to channel and then join
  // Error: Peer with name "peer0.org1.acme.com" not assigned to this channel
  // Peer0 org1
  logger.info(orgname);
  try {
    const channelPeer = channel.getPeer(peerStr);
    logger.info('****************** channel.getPeer:: SUCCESS ************************');
    logger.info(channelPeer);
    logger.info('****************** channel.getPeer:: printed channelPeer ************************');
  } catch (err) {
    // get from the client and add it to the channel
    logger.info('****************** channel.getPeer:: FAILURE - getPeer from client and add it to the channel ************************');
    const peer1 = client.getPeer(peerStr);
    logger.info('****************** client.getPeer:: SUCCESS ************************');
    logger.info(peer1);
    logger.info('****************** client.getPeer:: printed  ************************');
    channel.addPeer(peer1, orgnameToMSPName(orgname), true, false); // last is replace, third is endorsing peer
    logger.info('****************** channel.addPeer:: SUCCESS  ************************');
    const channelPeer = channel.getPeer(peerStr);
    logger.info('****************** channel.getPeer:: SUCCESS ************************');
    logger.info(channelPeer);
    logger.info('****************** channel.getPeer:: printed channelPeer ************************');
  }
  logger.info(orgname);
  logger.info('DONE');
  return channel;
}

/*
async function CreateChannel(userName, orgName) {
  debug(chalk.green('Creating channel'));
  logger.info('****************** CREATING CHANNEL ************************');
  const client = await getClientForOrgs(userName, orgName);
  if (client == null) {
    throw new Error('getRegisteredUsers - client returned null');
  }
  const channelName = Client.getConfigSetting(channelNameStr);
      
  // channel is created by the orderer initially
  // each peer will join the channel by sending channel configuration to each of the peer nodes
  const createChannelRequest = {
    name: channelName, // 'mychannel',
    orderer: ordererName, // 'orderer.acme.com',
    signatures: signaturesAllOrgs, // [signature],
    config: channelConfig,
    txId: createChannelTxId
  };
  const channel = client.getChannel(channelName);
  if (!channel) {
    // create a channel
    // TO create the channel - the network should be running
    const response = await client.createChannel(createChannelRequest);
    if (response) {
      logger.info('****************** CREATECHANNEL - DONE ************************');
      logger.info(response);
      logger.info('****************** CREATECHANNEL - printed createChannelResponse ************************');
    } else {
      logger.info('****************** CREATECHANNEL - FAILED ************************');
    }// create channel failed
  } // if channel does not exist create a channel
  // exists because we created it now - or it already exists
  // Comment end - trying to sign all orgs with the configtxlator
  return client;

  approach - 1
  // npm install superagent
  const response = request
    .post('http://127.0.0.1:7059/protolator/encode/common.ConfigUpdate', channelConfig.toString())
    .buffer()
    .end((err, res) => {
      if (err) {
        logger.error(err);
        return;
      }
      config_proto = res.body;
    });
   
  
  const signature = client.signChannelConfig(config_proto);
  signatures.push(signature);

  // to get the ip address of a docker container
  // docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name_or_id
  // channel is created by the orderer initially
  // each peer will join the channel by sending channel configuration to each of the peer nodes
  const createChannelRequest = {
    name: channelName, // 'mychannel',
    config: config_proto,
    orderer: ordererName, // 'orderer.acme.com',
    signatures: signatures,
    txId: createChannelTxId
  };
  const channel = client.getChannel(channelName);
  if (!channel) {
    // create a channel
    // TO create the channel - the network should be running
    const channelResponse = await client.createChannel(createChannelRequest);
    if (response) {
      logger.info('****************** CREATECHANNEL - DONE ************************');
      logger.info(channelResponse);
      logger.info('****************** CREATECHANNEL - printed createChannelResponse ************************');
    } else {
      logger.info('****************** CREATECHANNEL - FAILED ************************');
    }// create channel failed
  } // if channel does not exist create a channel

  // Comment start - trying to sign all orgs with the configtxlator
  
  
  // Comment - already signed it in getRegisteredUsers - START
  // const signature = client.signChannelConfig(channelConfig);
  // logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel - DONE ************************');
  // logger.info(channelConfig);
  // logger.info(signature);
  // logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel - DONE ************************');
  // Comment - already signed it in getRegisteredUsers - END
  

  // to get the ip address of a docker container
  // docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name_or_id
} // end of createChannel function
*/
async function joinChannel(i) {
  // calling the CreateChannel function created for seggregation
  // { Error: 2 UNKNOWN: access denied: channel [] creator org [Org1MSP] still exists
  // TODO: async for loop
  let client = await CreateChannel(i);
  const channelName = Client.getConfigSetting(channelNameStr);
  let channel = client.getChannel(channelName); // 'mychannel'
  logger.info('****************** GETCHANNEL - DONE ************************');
  logger.info(channel);
  logger.info('****************** GETCHANNEL - printed getChannel result ************************');
  if (i === 0) {
    channel = channelAddPeer(client, channel, peer0Org1, 'org1');
  } else if (i === 1) {
    channel = channelAddPeer(client, channel, peer0Org2, 'org2');
  } else if (i === 2) {
    channel = channelAddPeer(client, channel, peer0Org3, 'org3');
  }

  const genesisBlockTxid = client.newTransactionID();
  const requestGenesisBlock = {
    txId: genesisBlockTxid
  };
  // "orderer" request parameter is missing and there are no orderers defined on this channel in the network configuration
  // hence get the orderer object - too many parameters
  const ordererObj = client.getOrderer(ordererName); // 'orderer.acme.com'
  // ERROR: [Channel.js]: Orderer orderer.acme.com already exists
  if (channel.getOrderer(ordererName)) {
    // orderer already there - need not add
    logger.info('****************** Orderer already there:: channel.getOrderer ************************');
  } else {
    channel.addOrderer(ordererObj, false); // false - so that no replacing is done if it exists
    logger.info('****************** added orderer to channel:: getOrderer ************************');
    logger.info(ordererObj);
    logger.info('****************** added orderer to channel:: getOrderer:: printed ordererObj ************************');
  }

  const genesisBlock = await channel.getGenesisBlock(requestGenesisBlock);
  logger.info('****************** GETGENSISBLOCK:: SUCCESS ************************');
  logger.info(genesisBlock);
  logger.info('****************** GETGENSISBLOCK:: printed genesisBlock ************************');
  // Before adding the peers from different orgs initialize the peers from different orgs in the channel
  // we will take values from the connectionprofile.yaml
  
  try {
    let arrPeerNames;
    if (i === 0) {
      arrPeerNames = [peer0Org1];
    } else if (i === 1) {
      arrPeerNames = [peer0Org2];
    } else if (i === 2) {
      arrPeerNames = [peer0Org3];
    }
    
    const joinChannelRequest = {
      targets: arrPeerNames,
      block: genesisBlock,
      txId: client.newTransactionID(true)
    };
    // proposalResponse[0]['message'] "2 UNKNOWN: chaincode error (status: 500, message: Cannot create ledger from genesis block, due to LedgerID already exists)"
    // proposalResponse[0]['code'] 2
    const channelpostsigning = client.getChannel(channelName);
    const proposalResponse = await channelpostsigning.joinChannel(joinChannelRequest, 10000); // 10 secs
    logger.info('****************** JOINCHANNEL:: CALLED ************************');
    if ((proposalResponse[0].code === 2) && (proposalResponse[0].message === 'Cannot create ledger from genesis block, due to LedgerID already exists')) {
      logger.info('****************** JOINCHANNEL:: ALREADY JOINED ************************');
    }
    console.log(proposalResponse);
    logger.info('****************** JOINCHANNEL:: printed proposal response ************************');
  } catch (err) {
    logger.info('****************** JOINCHANNEL:: INSIDE CATCH ************************');
    logger.info(err.message);
    logger.info('****************** JOINCHANNEL:: ALREADY JOINED ************************');
  }
  
  logger.info('****************** JOINCHANNEL:: SUCCESS ************************');
  
  // client = await CreateChannel(1);
  // these two channels must be joined with Org2 and Org3 permissions
  // channel = channelAddPeer(client, channel, peer0Org2, 'org2');
  // channel = channelAddPeer(client, channel, peer0Org3, 'org3');

  // client = await CreateChannel(0);

  


  // Peer object is not required since we have already loadedfromconfig
  // Due to the error while joining channel - add peer to channel and then join
  // Error: Peer with name "peer0.org1.acme.com" not assigned to this channel
  // Peer0 org1
  // TODO: Make this generic to bring the number of orgs from config
  // Internal function
  // TODO: Try without returning
  // TODO: sending orgname won't work since it is only org1 sent till now
  // adds only if not added before

  
  

  // comment not required - START
  // const clientpostusersigning = await signClientsForOrgs(userName, orgName);
  // logger.info('****************** POST ALL ORGS SIGNING ************************');
  // logger.info(clientpostusersigning);
  // logger.info('****************** POST ALL ORGS SIGNING PRINTED ************************');
  // comment not required - END

  // approach 2 - try initialize to add the other orgs to the channel
  // the fabric-client reference - moved it to after adding peers
  // since it gave an error on debugger which said - could not initialize
  // without any peers on the channel

  // Error: 12 UNIMPLEMENTED: unknown service discovery.Discovery
  // Client.setConfigSetting('initialize-with-discovery', true);
  /* await channel.initialize({
    discover: true,
    target: 'peer0.org2.acme.com', // peer defined in the connection profile
    asLocalhost: true
  });
  logger.info('****************** CHANNEL INITIALIZE - DONE ************************');
  */

  // For peers to join the channel
  // Error: Peer with name "peer0.org1.acme.com" not assigned to this channel
  /* This is not required - does not work
      const transactionIDOrg1 = {
        signer_or_userContext: {
          role: {
            name: 'admin',
            mspId: 'Org1MSP'
          },
        },
        admin: true
      };
  */
  // 1. UNKNOWN: access denied: channel [] creator org [Org1MSP], so removed other peers
  // and will join them one by one
  // 2. TypeError: request.txId.isAdmin is not a function
  // 3.  Error: 2 UNKNOWN: access denied'/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' : channel [] creator org [Org1MSP] - if
  // we add peer0 in org2 and org3
  // const arrPeerNames = [peer0Org1, peer0Org2, peer0Org3];
  // [ { Error: 2 UNKNOWN: chaincode error (status: 500, message: Cannot create ledger from genesis block, due to LedgerID already exists)
  // [client-utils.js]: sendPeersProposal - Promise is rejected: Error: 2 UNKNOWN: access denied: channel [] creator org [Org1MSP]
  
}

function adminrouter(navigate) {
  adminRouter.use(bodyparser.json());
  adminRouter.use(bodyparser.urlencoded({ extended: false }));
  adminRouter.route('/').get((req, res) => {
    // debug(chalk.yellow('rendering the transact page'));
    debug(chalk.yellow(navigate));
    res.render('admin',
      {
        // the navigate variable passed from the main file
        navigate,
        title: 'Start the blockchain setup here'
      });
    res.render('form');
  });
  // whatever it is use root here for route('/')
  // form(method='POST') - not giving an action here goes to the same page
  // the router here is home in adminRouter.route
  // if you give adminRouter.route('/admin') or anything else you get - cannot POST /admin error
  adminRouter.route('/').post((req, res) => {
    // res.setHeader('content-type', 'text/plain');
    // res.end(`you have selected: ${req.body.values}`);
    debug(chalk.green('inside button click'));

    // now call nodejs functions to start BC
    // Register and enroll user
    logger.info('****************** INSIDE BUTTON CLICK ************************');
    let client = getClientForOrg();

    let orgname = Constants.ORG1;
    let peername = Constants.peer0org1;
    client = enrollClientForOrg(orgname, client);
    client = createChannelForOrg(client);
    client = ClientHelper.joinChannel(orgname, peername, client);
    
    orgname = Constants.ORG2;
    peername = Constants.peer0org2;
    client = enrollClientForOrg(orgname, client);
    client = createChannelForOrg(client);
    client = ClientHelper.joinChannel(orgname, peername, client);
    
    orgname = Constants.ORG3;
    peername = Constants.peer0org3;
    client = enrollClientForOrg(orgname, client);
    client = createChannelForOrg(client);
    client = ClientHelper.joinChannel(orgname, peername, client);
    
    res.redirect('/transact');
  });
  // return the const express.Router()
  return adminRouter;
}

// export the name of the function
module.exports = adminrouter;




/*else {
      console.log('user - admin was found');
    }*/

      
      
      
      
      
      
      


  //  let fabri_CA_Client = client.getCertificateAuthority();
    // promise to build a key value store and crypto store has been fulfilled
    // error:'Network configuration is missing this client's organization and certificate authority'
    // set up fabric ca server
    // prerequisites = https://hyperledger-fabric-ca.readthedocs.io/en/latest/users-guide.html#prerequisites
    // export GOPATH=/home/hypledvm/go/src/utilitypoc/network/chaincode

    // straight start did not work
    // Configuration file location: /home/hypledvm/go/bin/fabric-ca-server-config.yaml
    // Starting server in home directory: /home/hypledvm/go/bin
    // panic: Version is not set for fabric-ca library
    //    Starting fabric-ca -server ... 
    //    Starting fabric-ca-server ... done
    //    Attaching to fabric-ca-server
    // Configuration file location: /etc/hyperledger/fabric-ca-server/fabric-ca-server-config.yaml
    //    Starting server in home directory: /etc/hyperledger/fabric-ca-server
    //    Server Version: 1.1.1-snapshot-e656889
    //    Server Levels: &{Identity:1 Affiliation:1 Certificate:1}
    //    The CA key and certificate already exist
    //    The key is stored by BCCSP provider 'SW'
    //    The certificate is at: /etc/hyperledger/fabric-ca-server/ca-cert.pem
    //    Initialized sqlite3 database at /etc/hyperledger/fabric-ca-server/fabric-ca-server.db
    //    Home directory for default CA: /etc/hyperledger/fabric-ca-server
    //    Listening on http://0.0.0.0:7054

    // tls is for https

    // installed in$GOPATH/bin

    // console.log('>>>>>>>>>>>>');
      // use docker-compose -f docker-compose.yml up
    //  console.log(client.getClientConfig());
    //  console.log(client.getCryptoSuite());
    //  console.log(client.getMspid());
    //  console.log('>>>>>>>>>>>>');
    /* return client.setUserContext({ username: 'admin', password: 'adminpw' }).then((admin) => {
      console.log('>>>>>>>> client.setUserContext succeeded');
      console.log(admin);
      console.log('>>>>>>>>>>>>');
      // use docker-compose -f docker-compose.yml up
      console.log(client.getClientConfig());
      console.log(client.getCryptoSuite());
      console.log(client.getMspid());
      console.log('>>>>>>>>>>>>');
      // let fabri_CA_Client = client.getCertificateAuthority();
      console.log(' >>>>>>>> fabricCAClient :::');
    }).catch((err) => {
      console.log('>>>>>>>> client.setUserContext failed' + err);
    });*/
  //}).catch((err) => {
  //  console.log(' >>>>>>>> initCredentialStores :::' + err);
  //});


  // emptyPromise().then(() => {
  //  emptyPromise.then is not a function = had missed the () after emptyPromise
  // console.log(client);
  /*return client.getUserContext('admin', true).then((user) => { // then of getUserContext
    console.log('>>>>>>>> success');

    if (user == null) {
      console.log('>>>>>>>> need to enroll admin user');

      return client.createUser({
        username: 'admin',
        mspid: 'Org1MSP',
        cryptoContent: {
          privateKey: '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/keystore/bdbfaa9c1b7faee6bb2cb42f699221bc6b9aabc286e43d735747e4805d98c799_sk',
          signedCert: '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' 
        },
        skipPersistence: true // skip persistence - to resolve the error
        // Cannot save user to state store when stateStore is null
      }).then((createduser) => { // then of client.createuser
        console.log('>>>>>>>> client.createUser succeeded' + createduser);
        
      }).catch((err) => { // error of fabriCAClient.enroll
        console.log('>>>>>>>> client.createUser failed' + err);
      });// then endsconst Constants = require('../constants.js');
const ClientHelper = require('./helper.js'); here
    }
    console.log('>>>>>>>> user :::' + user);
  }, (err) => { // err of getUserContext
    console.log('>>>>>>>> NO success');
    console.log('>>>>>>>>Error at client.getUserContext' + err);
  });*/



/*
  if (username) {
    const user = await client.getUserContext(username, true);
    if (!user) {
      // throw new Error('user was not found :', username);
      // create a user context
      console.log('getUserContext hand no user - creating a user');
      const createduser = await client.createUser({
        username: 'admin',
        mspid: 'Org1MSP',
        cryptoContent: {
          privateKey: '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/keystore/bdbfaa9c1b7faee6bb2cb42f699221bc6b9aabc286e43d735747e4805d98c799_sk',
          signedCert: '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/peers/peer0.org1.acme.com/msp/signcerts/peer0.org1.acme.com-cert.pem' 
        },
        skipPersistence: true // skip persistence - to resolve the error
        // Cannot save user to state store when stateStore is null
      });
      console.log('>>>>>>>>>>>>Created user::');
      console.log(createduser);

      // now set the user context - post this is successful - persists user to the state store
      let user_persisted = await client.setUserContext(createduser, true);
      console.log('>>>>>>>>>>USER PERSISTED');
      console.log(user_persisted);
      let fabric_CA_Client = client.getCertificateAuthority();
      console.log('>>>>>>>>>>GETCERTAUTHORITY - getting the enrolled admin');
      console.log(fabric_CA_Client);
      // transaction created by the admin
      let tx_id = client.newTransactionID(true);
      console.log('>>>>>>>>>>NEWTRANSACTIONID - tx_id received by the admin');
      console.log(tx_id);
      const envelope = fs.readFileSync('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx');
      const channelConfig = client.extractChannelConfig(envelope);
      const signature = client.signChannelConfig(channelConfig);
      console.log('>>>>>>>>>>extractChannelConfig and signChannelConfig - config to pass to CreateChannel');
      console.log(channelConfig);
      console.log(signature);
      console.log('>>>>>>>>>>>>');
      // to get the ip address of a docker container
      // docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name_or_id

      // channel is created by the orderer initially
      // each peer will join the channel by sending channel configuration to each of the peer nodes
      const request = {
        name: 'mychannel',
        orderer: 'orderer.acme.com',
        signatures: [signature],
        config: channelConfig,
        txId: tx_id
      };
      let channel = client.getChannel('mychannel');
      if (!channel) {
        // create a channel
        // TO create the channel - the network should be running
        const response = await client.createChannel(request);
        if (response) {
          console.log('>>>>>>>>>CREATECHANNEL');
          console.log(response);
          console.log('>>>>>>>>>CREATECHANNEL - DONE');
        } else {
          console.log('>>>>>>>>>CREATECHANNEL FAILED');
        }// create channel failed
      } // if channel does not exist create a channel
      // exists because we created it now - or it already exists
      channel = client.getChannel('mychannel');
      console.log('>>>>>>>>>GETCHANNEL');
      console.log(channel);
      console.log('>>>>>>>>>GETCHANNEL - DONE');
      */
     // tell each peer to join and wait for the event hub to inform that it has joined
      /*
      const channelEventHubs = channel.getChannelEventHubsForOrg();
      console.log('>>>>>>>>>GETCHANNELEVENTHUBSFORORG');
      console.log(channelEventHubs[0]);
      console.log(channelEventHubs[1]);
      console.log(channelEventHubs[2]);
      console.log('>>>>>>>>>GETCHANNELEVENTHUBSFORORG - DONE');
      const data = fs.readFileSync('/home/hypledvm/go/src/utilitypoc/network/acmedevmode/crypto-config/peerOrganizations/org1.acme.com/msp/tlscacerts/tlsca.org1.acme.com-cert.pem');
      const peer = client.newPeer(
        'grpcs://localhost:7051',
        {
          pem: Buffer.from(data).toString(),
          'ssl-target-name-override': 'peer0.org1.acme.com'
        }
      );
      const channel_event_hub = channel.newChannelEventHub(peer);
      console.log('>>>>>>>>>newChannelEventHub');
      console.log(channel_event_hub);
      console.log('>>>>>>>>>newChannelEventHub - DONE');
      */