// ERROR: FS should be the first import
const fs = require('fs');
const Constants = require('../constants.js');
const ClientHelper = require('./helper.js');

function getClientForOrg() {
  // ERROR: Error: Invalid network configuration due to "version" is missing
  // changed connectionprofile file to version: "1.1" 
  // restarting the ledger with the same genesis and channel tx files
  // ERROR: Had missed the function ()
  Constants.logger.info('****************** getClientForOrg - INSIDE FUNCTTION ************************');
  const client = Constants.hfc.loadFromConfig(ClientHelper.getClientConnectionFilePath());
  Constants.logger.info('****************** client after loadfromconfig START ************************');
  Constants.logger.info(client); // Does not type cast and shows it fully
  Constants.logger.info('****************** client after loadfromconfig END ************************');
  return client;
}
module.exports.getClientForOrg = getClientForOrg;

function getTransactionId(client) {
  // ERROR: Removed true passed as an argument
  // UnhandledPromiseRejectionWarning: TypeError: client.newTransactionID is not a function
  Constants.logger.info('****************** getTransactionId - INSIDE FUNCTTION ************************');
  const txId = client.newTransactionID();
  return txId;
}
module.exports.getTransactionId = getTransactionId;

async function enrollClientForOrg(orgname, client) {
  let createduser = null;
  Constants.logger.info('****************** enrollClientForOrg - INSIDE FUNCTTION ************************');
  Constants.logger.info(orgname);
  // await needs the function - CreateChannel to be an async function
  // manage return of a promise by making the calling function async

  // TODO: How do you avoid loading again and again
  const username = ClientHelper.getUserName();
  // TODO: store in a variable here if used multiple times
  // ClientHelper.getMSPofOrg(orgname);
  
  // Error: No credentialStore settings found - adding the client: section in the connprofile.yaml
  let promiseCredentialStore = await client.initCredentialStores();
  Constants.logger.info('****************** initCredentialStores ::: SUCCESS ************************');
  Constants.logger.info(promiseCredentialStore);
  Constants.logger.info('****************** printed client after calling initCredentialStores ************************');
  const user = await client.getUserContext(username, true);
  let createduserpromise = null;
  if (!user) {
    // throw new Error('user was not found :', username);
    // create a user context
    Constants.logger.info('****************** getUserContext had no user ADMIN ************************');
    // ERROR: UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'toString' of null
    // Clicking on the link - takes you to signedCertPEM 
    // Fails here - Give full path to the file path not relative and check
    createduserpromise = await client.createUser({
      username: username, // 'admin'
      mspid: ClientHelper.getMSPofOrg(orgname), // 'Org1MSP',
      cryptoContent: {
        privateKey: ClientHelper.getOrgPrivateKey(orgname),
        signedCert: ClientHelper.getOrgSignedCert(orgname)
      },
      skipPersistence: true // skip persistence - to resolve the error
      // Cannot save user to state store when stateStore is null
    });
    Constants.logger.info('****************** Created user::SUCCESS ************************');
    Constants.logger.info(orgname);
    Constants.logger.info(createduserpromise);
    Constants.logger.info(client.getUserContext(username, true));
    Constants.logger.info('****************** Created user::printed created user above for org 0 ************************');
  } else { // created user
    Constants.logger.info(orgname);
    Constants.logger.info('****************** ADMIN USER ALREADY EXISTS ::SUCCESS ************************');
  }
  // now set the user context - post this is successful - persists user to the state store
  /*
     Comment START: Not required to get context since user already there
     const createdUser = await client.getUserContext(username, true);
     Constants.logger.info('****************** client.getUserContext::Post Creating the user::SUCCESS ************************');
     // Not required since we are not using CA
     const fabricCAClient = client.getCertificateAuthority();
     Constants.logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::SUCCESS ************************');
     Constants.logger.info(fabricCAClient);
     Constants.logger.info('****************** GETCERTAUTHORITY - getting the enrolled admin::client.getCertificateAuthority::printed ************************');
     Comment END:
  */
  // ERROR:  UnhandledPromiseRejectionWarning: Error: Cannot save null userContext
  // Had not replaced the variable  createduser to createduserpromise and the scope was inside the 'if'
  const userPersisted = await client.setUserContext(createduserpromise, true);
  Constants.logger.info('****************** USER PERSISTED::client.setUserContext::SUCCESS ************************');
  Constants.logger.info(userPersisted);
  Constants.logger.info('****************** USER PERSISTED::client.setUserContext::printed user persisted ************************');
  if ((userPersisted != null) && (userPersisted.isEnrolled())) {
    Constants.logger.info(userPersisted);
    Constants.logger.info(userPersisted.isEnrolled());
    Constants.logger.info('****************** client.setUserContext returned TRUE. USER persisted ************************');  
  } else {
    // ERROR: eslint error. No param reassign - hence commenting it out
    // client = null;
    Constants.logger.info('****************** client.setUserContext returned FALSE. USER not persisted ************************');  
  }
  // ERROR: Removed the return client; - makes not sense here
}
module.exports.enrollClientForOrg = enrollClientForOrg;


async function createChannelForOrg(client) {
  Constants.logger.info('****************** CREATING CHANNEL ************************');
  const channelName = ClientHelper.getChannelNameFromConfig();
  Constants.logger.info('****************** createChannelForOrg - INSIDE FUNCTTION ************************');
  
  // Push signatures for each org's client
  // The client has been loaded with Org1 and certs and admin username
  // transaction created by the admin
  // TODO: change it to non-admin based on user context
  const createChannelTxId = getTransactionId(client);
  Constants.logger.info('****************** NEWTRANSACTIONID - tx_id received by the admin ************************');
  Constants.logger.info(createChannelTxId);
  Constants.logger.info('****************** NEWTRANSACTIONID - printed client.newTransactionID ************************');
  // TODO: Read bytes from file can be made generic
  const envelope = fs.readFileSync(ClientHelper.getClientChannelTxFilePath());
  const channelConfig = client.extractChannelConfig(envelope);
  const signature = client.signChannelConfig(channelConfig);
  const signaturesallorgs = [];
  Constants.logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG 0- DONE ************************');
  Constants.logger.info(channelConfig);
  Constants.logger.info(signature);
  Constants.logger.info('****************** pushing signature for org 0 - DONE ************************');
  signaturesallorgs.push(signature);
  Constants.logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG 0 - DONE ************************');
  
  // channel is created by the orderer initially
  // each peer will join the channel by sending channel configuration to each of the peer nodes
  // TODO: restructure Do this only if 0, 1, 2 are over
  let createChannelRequest = null;
  createChannelRequest = {
    name: channelName, // 'mychannel',
    orderer: Constants.orderername, // 'orderer.acme.com',
    signatures: signaturesallorgs, // [signature],
    config: channelConfig,
    txId: createChannelTxId
  };
  const channel = client.getChannel(channelName);
  if (!channel) {
    // create a channel
    // TO create the channel - the network should be running
    const response = await client.createChannel(createChannelRequest);
    if (response) {
      Constants.logger.info('****************** CREATECHANNEL - DONE ************************');
      Constants.logger.info(response);
      Constants.logger.info('****************** CREATECHANNEL - printed createChannelResponse ************************');
    } else {
      Constants.logger.info('****************** CREATECHANNEL - FAILED ************************');
    }// create channel failed
  } // if channel does not exist create a channel
  // exists because we created it now - or it already exists
  // return client;
}
module.exports.createChannelForOrg = createChannelForOrg;

async function joinChannel(orgname, peername, client) {
  Constants.logger.info('****************** createChannelForOrg - INSIDE FUNCTTION ************************');
  
  const channelName = ClientHelper.getChannelNameFromConfig();
  const channel = "testchainid"; // client.getChannel(channelName); // 'mychannel'
  Constants.logger.info('****************** GETCHANNEL - DONE ************************');
  Constants.logger.info(channel);
  Constants.logger.info('****************** GETCHANNEL - printed getChannel result ************************');

  // Add peer
  try {
    // get peer from channel
    const channelPeer = channel.getPeer(Constants.peer0org1);
    Constants.logger.info('****************** channel.getPeer:: SUCCESS ************************');
    Constants.logger.info(channelPeer);
    Constants.logger.info('****************** channel.getPeer:: printed channelPeer ************************');
  } catch (err) {
    // if peer is not in channel, add it
    // get from the client and add it to the channel
    Constants.logger.info('****************** channel.getPeer:: FAILURE - getPeer from client and add it to the channel ************************');
    const peer1 = client.getPeer(peername);
    Constants.logger.info('****************** client.getPeer:: SUCCESS ************************');
    Constants.logger.info(peer1);
    Constants.logger.info('****************** client.getPeer:: printed  ************************');
    // Add it to the channel
    channel.addPeer(peer1, ClientHelper.getMSPofOrg(orgname), true, false); // last is replace, third is endorsing peer
    Constants.logger.info('****************** channel.addPeer:: SUCCESS  ************************');
    const channelPeer = channel.getPeer(peername);
    Constants.logger.info('****************** channel.getPeer:: SUCCESS ************************');
    Constants.logger.info(channelPeer);
    Constants.logger.info('****************** channel.getPeer:: printed channelPeer ************************');
  } // Ctach if no peer is there
  
  // Join channel
  const genesisBlockTxid = client.newTransactionID();
  const requestGenesisBlock = {
    txId: genesisBlockTxid,
    orderer: {
      url: 'grpcs://localhost:7050',
      opts: {
        'request-timeout': 60000
      }
    }
  };
  // "orderer" request parameter is missing and there are no orderers defined on this channel in the network configuration
  // hence get the orderer object - too many parameters
  const ordererObj = client.getOrderer(Constants.orderername); // 'orderer.acme.com'
  // ERROR: [Channel.js]: Orderer orderer.acme.com already exists
  if (Object.is(channel.getOrderer(Constants.orderername), null) === false) {
    // orderer already there - need not add
    Constants.logger.info('****************** Orderer already there:: channel.getOrderer ************************');
  } else {
    // ERROR: error: [Orderer.js]: sendDeliver - rejecting - status:NOT_FOUND
    // (node:300) UnhandledPromiseRejectionWarning: Error: Invalid results returned ::NOT_FOUND
    // It comes here and exits. Need not come here. To the if statement - add != null since orderer is there
    channel.addOrderer(ordererObj, false); // false - so that no replacing is done if it exists
    Constants.logger.info('****************** added orderer to channel:: getOrderer ************************');
    Constants.logger.info(ordererObj);
    Constants.logger.info('****************** added orderer to channel:: getOrderer:: printed ordererObj ************************');
  }
  // removing the parameter since it is optional - requestGenesisBlock
  // UnhandledPromiseRejectionWarning: Error: "orderer" request parameter is not valid. Must be an orderer nameor "Orderer" object
  // error: [Orderer.js]: sendDeliver - rejecting - status:NOT_FOUND
  // (node:6928) UnhandledPromiseRejectionWarning: Error: Invalid results returned ::NOT_FOUND
  // On peer: Broken pipe: peer channel fetch newest mychannel.block -c mychannel --orderer orderer.example.com:7050
  // On orderer: orderer
  // 2018-10-20 11:57:52.948 UTC [orderer/common/server] initializeServerConfig -> INFO 01e Starting orderer with TLS enabled
  // 2018-10-20 11:57:52.949 UTC [orderer/common/server] initializeGrpcServer -> CRIT 01f Failed to listen: listen tcp 0.0.0.0:7050: bind: address already in use
  // (node:8152) UnhandledPromiseRejectionWarning: Error: Failed to connect before the deadline
  // Orderer logs: 2018-10-20 12:32:57.130 UTC [common/deliver] deliverBlocks -> DEBU 126fa Rejecting deliver for 172.21.0.4:44910 because channel mychannel not found

  const genesisBlock = await channel.getGenesisBlock(Constants.orderername);
  Constants.logger.info('****************** GETGENSISBLOCK:: SUCCESS ************************');
  Constants.logger.info(genesisBlock);
  Constants.logger.info('****************** GETGENSISBLOCK:: printed genesisBlock ************************');
  // Before adding the peers from different orgs initialize the peers from different orgs in the channel
  // we will take values from the connectionprofile.yaml

  const joinChannelRequest = {
    targets: [peername],
    block: genesisBlock,
    txId: client.newTransactionID(true)
  };
  const proposalResponse = await channel.joinChannel(joinChannelRequest, 10000); // 10 secs
  Constants.logger.info('****************** JOINCHANNEL:: CALLED ************************');
  if ((proposalResponse[0].code === 2) && (proposalResponse[0].message === 'Cannot create ledger from genesis block, due to LedgerID already exists')) {
    Constants.logger.info('****************** JOINCHANNEL:: ALREADY JOINED ************************');
  }
  console.log(proposalResponse);
  Constants.logger.info('****************** JOINCHANNEL:: printed proposal response ************************');
  Constants.logger.info('****************** JOINCHANNEL:: SUCCESS ************************');
  // return client;
}
module.exports.joinChannel = joinChannel;
