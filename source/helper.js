/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
const util = require('util');
const fs = require('fs');
const path = require('path');

const hfc = require('fabric-client');

const Constants = require('./constants.js');

function getUserName() {
  // TODO: Move 0.
  // Ok as of now since it is always going to be admin and 0 and also will
  // move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const username = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.usernameconfig]; // 'admin';
  Constants.logger.info(username);
  Constants.logger.info('****************** printed userName from config  ************************');
  return username;
}
module.exports.getUserName = getUserName;

function getUserPassword() {
  // TODO: Move 0.
  // Ok as of now since it is always going to be admin and 0 and
  // also will move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const secret = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.secret];
  // 'admin';
  Constants.logger.info(secret);
  Constants.logger.info('****************** printed secret from config  ************************');
  return secret;
}
module.exports.getUserPassword = getUserPassword;


async function getClientForOrg(userorg, username) {
  Constants.logger.info('*******************getClientForOrg - ****** START %s %s', userorg, username);
  // get a fabric client loaded with a connection profile for this org
  // '-connection-profile-path';
  const config = Constants.configappendstr;

  // build a client context and load it with a connection profile
  // lets only load the network settings and save the client for later
  const client = hfc.loadFromConfig(hfc.getConfigSetting(Constants.networkstr + config));

  // This will load a connection profile over the top of the current one one
  // since the first one did not have a client section and the following one does
  // nothing will actually be replaced.
  // This will also set an admin identity because the organization defined in the
  // client section has one defined
  client.loadFromConfig(hfc.getConfigSetting(userorg + config));

  // this will create both the state store and the crypto store based
  // on the settings in the client section of the connection profile
  await client.initCredentialStores();

  // The getUserContext call tries to get the user from persistence.
  // If the user has been saved to *******************getClientForOrgpersistence then that means the user has
  // been registered and enrolled. If the user is found in persistence
  // the call will then assign the user to the client object.
  if (username) {
    const user = await client.getUserContext(username, true);
    if (!user) {
      Constants.logger.info('User %s was not found in the store', username);
    } else {
      Constants.logger.info('User %s was found to be registered and enrolled', username);
    } // else
  }
  Constants.logger.info('getClientForOrg - ****** END %s %s \n\n', userorg, username);
  return client;
} // getClientForOrg over
module.exports.getClientForOrg = getClientForOrg;


async function getRegisteredUser(orgname, username) {
  try {
    const client = await getClientForOrg(orgname, username);
    Constants.logger.info('Successfully initialized the credential stores');
    // client can now act as an agent for organization Org1
    // first check to see if the user is already enrolled
    let user = await client.getUserContext(username, true);
    if (user && user.isEnrolled()) {
      Constants.logger.info('Successfully loaded member from persistence');
    } else {
      // user was not enrolled, so we will need an admin user object to register
      Constants.logger.info('User %s was not enrolled, so we will need an admin user object to register', username);
      const adminUserObj = await client.setUserContext({ username: getUserName(), password: getUserPassword() });
      const caClient = client.getCertificateAuthority();

      // ERROR: Only for Org3 when you delete the key value store
      // info: [APPLICATION]: INSIDE getRegisteredUser catch Argument "registrar" must be an instance of the class "User", but is found to be missing a method "getSigningIdentity()"
      // Post changing userobj param
      // info: [APPLICATION]: INSIDE getRegisteredUser catch Missing required parameters. 'enrollmentID', 'affiliation',                and 'signingIdentity' are all required.
      // added role and affiliation
      // info: [APPLICATION]: INSIDE getRegisteredUser catch fabric-ca request register failed with errors [[{"code":0,"message":"Registration of 'admin' failed in affiliation validation: Failed getting affiliation 'Org3': : scode: 404, code: 63, msg: Failed to get Affiliation: sql: no rows in result set"}]]

      // Registration of 'admin' failed in affiliation validation: Failed getting affiliation 'Org3': : scode: 404, code: 63, msg: Failed to get Affiliation: sql: no rows in result set
      // or from the yaml - we dont have it now

      // nfo: [APPLICATION]: INSIDE getRegisteredUser catch fabric-ca request affiliations failed with errors [[{"code":60,"message":"Affiliation already exists"}]]

      /*const aff = await caClient.newAffiliationService().create(
        {
          name: 'org1.department1'
        }, adminUserObj
      );*/
      // https://fabric-sdk-node.github.io/global.html#KeyValueAttribute
      // info: [APPLICATION]: INSIDE getRegisteredUser catch fabric-ca request register failed with errors [[{"code":5,"message":"Invalid request body: json: cannot unmarshal string into Go struct field RegistrationRequestNet.attrs of type []api.Attribute; body={\"id\":\"admin\",\"affiliation\":\"org1.department1\",\"max_enrollments\":1,\"type\":\"admin\",\"attrs\":\"hf.Revoker=true,admin=true:ecert\",\"secret\":\"adminpw\",\"caName\":\"ca-org3\"}"}]]
      // TODO: Only works from kvs and not from register and enroll API
      const enrolledAdmin = await caClient.enroll({
        // ERROR: [FabricCAClientImpl.js]: Invalid enroll request, missing enrollmentID 'ID" caps required
        enrollmentID: getUserName(), // TODO: How do you avoid loading again and again
        enrollmentSecret: getUserPassword(),
        profile: 'tls' // this is important as the CA uses TLS
      });
      Constants.logger.info('*******************CA Enroll over for org : %s***********************************', orgname);
      Constants.logger.info('*******************CA Enroll over for org Printed : %s***********************************', enrolledAdmin);

      Constants.logger.info('Successfully got the secret for user %s', username);
      user = await client.setUserContext(
        {
          username: username,
          password: secret
        }
      );
      Constants.logger.info('Successfully enrolled username %s  and setUserContext on the client object', username);
    }
    if (user && user.isEnrolled) {
      return user;
    }
  } catch (error) {
    Constants.logger.info('INSIDE getRegisteredUser catch %s', error.message);
  }
  return null;
} // end of getRegisteredUser
module.exports.getRegisteredUser = getRegisteredUser;

function getClientChannelTxFilePath() {
  // TODO: Move constants to a single place
  const channelTxfilepath = Constants.hfc.getConfigSetting(Constants.channeltxpathconfigstr) + '/' + Constants.channeltxfile;
  // '/home/hypledvm/go/src/utilitypoc/network/acmedevmode/channel-artifacts/channel.tx';
  return channelTxfilepath;
}
module.exports.getClientChannelTxFilePath = getClientChannelTxFilePath;


async function createChannelForOrgPrep(channelName, username, orgname) {
  Constants.logger.info('****************** CREATING CHANNEL ************************');
  Constants.logger.info('****************** createChannelForOrg - INSIDE FUNCTTION ************************');

  // Push signatures for each org's client
  // The client has been loaded with Org1 and certs and admin username
  // transaction created by the admin
  // TODO: change it to non-admin based on user context
  const client = await getClientForOrg(orgname, username);
  Constants.logger.info('****************** getTransactionId - INSIDE FUNCTTION ************************');
  // TODO: Default is not admin based on the userContext. Passing true is admin
  // Passing true for admin
  // TODO: check client usercontext is admin, then pass true and add an else
  const createChannelTxId = client.newTransactionID(true);
  Constants.logger.info('****************** NEWTRANSACTIONID - tx_id received by the admin ************************');
  Constants.logger.info(createChannelTxId);
  Constants.logger.info('****************** NEWTRANSACTIONID - printed client.newTransactionID ************************');

  // TODO: Read bytes from file can be made generic
  const envelope = fs.readFileSync(getClientChannelTxFilePath());
  const channelConfig = client.extractChannelConfig(envelope);
  const signature = client.signChannelConfig(channelConfig);

  Constants.logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG- DONE ************************');
  Constants.logger.info(channelConfig);
  // ERROR: Signed by all three peers since i moved them all inside the channel in config
  Constants.logger.info(signature);
  Constants.logger.info('****************** pushing signature for ORG - DONE ************************');
  Constants.signaturesallorgs.push(signature);
  Constants.logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG - DONE ************************');

  // DO this only once after adding all signatures
  // 
  // channel is created by the orderer initially
  // each peer will join the channel by sending channel configuration to each of the peer nodes
  // TODO: restructure Do this only if 0, 1, 2 are over
  Constants.createchannelrequest = {
    name: channelName, // 'mychannel',
    // orderer is not there in balance-transfer example
    // orderer: Constants.orderername, // 'orderer.acme.com',
    signatures: Constants.signaturesallorgs, // signaturesallorgs
    config: channelConfig,
    txId: createChannelTxId
  };
  // try catch channel does not exist create a channel
  // exists because we created it now - or it already exists
  // Constants.logger.info('****************** CREATECHANNEL - CATCH ************************');
  // Constants.logger.info(err);
  // Constants.logger.info('****************** CREATECHANNEL - CATCH DONE ************************');

  // return client;


  // ORDERER LOGS docker logs
  // 2018-10-20 17:37:29.544 UTC [fsblkstorage] updateCheckpoint -> DEBU 3ba Broadcasting about update checkpointInfo: latestFileChunkSuffixNum=[0], latestFileChunksize=[28923], isChainEmpty=[false], lastBlockNumber=[1]
  // 2018-10-20 17:37:29.544 UTC [orderer/commmon/multichannel] commitBlock -> DEBU 3bb [channel: testchainid] Wrote block 1

  // PEER LOGS 
  // deployed all system chaincodes
  // 2018-10-20 17:35:56.257 UTC [nodeCmd] func7 -> INFO 1b9 Starting profiling server with listenAddress = 0.0.0.0:6060

  // Get genesisblock fails - no channel
  // create channel using command line
  // 2018-10-20 18:50:05.902 UTC [fsblkstorage] updateCheckpoint -> DEBU 418 Broadcasting about update checkpointInfo: latestFileChunkSuffixNum=[0], latestFileChunksize=[28846], isChainEmpty=[false], lastBlockNumber=[1]
  // 2018-10-20 18:50:05.902 UTC [orderer/commmon/multichannel] commitBlock -> DEBU 419 [channel: testchainid] Wrote block 1
  // peer channel list still empty
  // getgenesisblock succeeds
  // peer channel list on cli still does not return anything since peer has not been joined to the channel

  // stop the ledger and restart it and see if genesisBlock succeeds
}
module.exports.createChannelForOrgPrep = createChannelForOrgPrep;

function getChannelNameFromConfig() {
  const channelName = Constants.hfc.getConfigSetting(Constants.channelnamestr);
  return channelName;
}
module.exports.getChannelNameFromConfig = getChannelNameFromConfig;

async function createChannelForOrg(channelName, username, orgname) {
  // ERROR: Remove the if condition - having the channel object loaded is no guarantee for
  // the channel to have been created
  // TODO: rectify this. channel is not created, there should be another way to know channel
  // has been created
  const client = await getClientForOrg(orgname, username);
  let createchannelrequest = null;
  try {
    Constants.logger.info('****************** CREATING CHANNEL ************************');
    Constants.logger.info('****************** createChannelForOrg - INSIDE FUNCTTION ************************');

    // Push signatures for each org's client
    // The client has been loaded with Org1 and certs and admin username
    // transaction created by the admin
    // TODO: change it to non-admin based on user context
    Constants.logger.info('****************** getTransactionId - INSIDE FUNCTTION ************************');
    // TODO: Default is not admin based on the userContext. Passing true is admin
    // Passing true for admin
    // TODO: check client usercontext is admin, then pass true and add an else
    const createChannelTxId = client.newTransactionID(true);
    Constants.logger.info('****************** NEWTRANSACTIONID - tx_id received by the admin ************************');
    Constants.logger.info(createChannelTxId);
    Constants.logger.info('****************** NEWTRANSACTIONID - printed client.newTransactionID ************************');

    // TODO: Read bytes from file can be made generic
    const envelope = fs.readFileSync(getClientChannelTxFilePath());
    const channelConfig = client.extractChannelConfig(envelope);
    const signature = client.signChannelConfig(channelConfig);

    Constants.logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG- DONE ************************');
    Constants.logger.info(channelConfig);
    // ERROR: Signed by all three peers since i moved them all inside the channel in config
    Constants.logger.info(signature);
    Constants.logger.info('****************** pushing signature for ORG - DONE ************************');
    Constants.signaturesallorgs.push(signature);
    Constants.logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG - DONE ************************');

    // DO this only once after adding all signatures
    // 
    // channel is created by the orderer initially
    // each peer will join the channel by sending channel configuration to each of the peer nodes
    // TODO: restructure Do this only if 0, 1, 2 are over
    createchannelrequest = {
      name: channelName, // 'mychannel',
      // orderer is not there in balance-transfer example
      // orderer: Constants.orderername, // 'orderer.acme.com',
      signatures: [signature], // signaturesallorgs
      config: channelConfig,
      txId: createChannelTxId
    };
    // ERROR: this param is the one seen in the network config - remove it
    //  TODO: https://stackoverflow.com/questions/46449327/how-to-get-all-existing-channels-in-hyperledger-1-0-node-sdk
    // This or try getGenesisBlock and in catch add this
    // null or channelName - tried both
    const channel = client.getChannel(channelName, true);
    Constants.logger.info('****************** GETCHANNEL - CALLED ************************');
    Constants.logger.info(channel);
    Constants.logger.info('****************** GETCHANNEL - PRINTED CHANNEL ************************');
    // TODO: remove hack - throwing error on purpose so that it creates a channel and 
    // make sure you create it only once - should not be specific to the org
    // TODO: comment it once channel creation is successful
    // throw Error('hack to create a channel');
    // creates mychannel.block = did it manually using the cli -
    // ERROR: No error - getting the channel even if the blockchain is stopped and restarted. 
    // The genesis block is not deleted
    // docker logs orderer.acme.com
    /*
    2018-10-20 18:32:59.945 UTC [fsblkstorage] nextBlockBytesAndPlacementInfo -> DEBU 0c5 blockbytes [11622] read from file [0]
    2018-10-20 18:32:59.945 UTC [orderer/commmon/multichannel] NewRegistrar -> INFO 0c6 Starting system channel 'testchainid' with genesis block hash fee2e849b763c082ce1f2b870b5a92f7bb37411e54e77a15f36199ffb582c0c0 and orderer type solo
    2018-10-20 18:32:59.945 UTC [orderer/common/server] Start -> INFO 0c7 Starting orderer:
    Version: 1.1.0
    Go version: go1.9.2
    OS/Arch: linux/amd64
    Experimental features: false
    2018-10-20 18:32:59.945 UTC [orderer/common/server] Start -> INFO 0c8 Beginning to serve requests
    */
  } catch (err) {
    // TODO: This API does not work (true) option - handle it another way and proceed
    // TODO: how do you verify channel has been created?
    // create a channel
    // TO create the channel - the network should be running
    let response = null;
    Constants.logger.info('****************** GETCHANNEL - CATCH ************************');
    try {
      Constants.logger.info('****************** CREATECHANNEL - CALLED ************************');
      response = await client.createChannel(createchannelrequest);
      Constants.logger.info(response);
      Constants.logger.info('****************** CREATECHANNEL - PRINTED RESPONSE ************************');
    } catch (error) {
      Constants.logger.info('****************** CREATECHANNEL - CATCH ************************');
      Constants.logger.info(error.msg);
      Constants.logger.info('****************** CREATECHANNEL - CATCH PRINTED ERROR MSG ************************');
    }
    /* No timeout while running it with npm start without brakpoints
    info: [APPLICATION]: .common.ConfigSignature
    info: [APPLICATION]: ****************** pushing signature for ORG - DONE ************************
    info: [APPLICATION]: ****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG- DONE ************************
    info: [APPLICATION]: ****************** GETCHANNEL - CALLED ************************
    info: [APPLICATION]: {"name":"mychannel","orderers":["Orderer:{url:grpcs://localhost:7050}"],"peers":["Peer:{url:grpcs://localhost:7051}","Peer:{url:grpcs://localhost:8051}","Peer:{url:grpcs://localhost:9051}"]}
    info: [APPLICATION]: ****************** GETCHANNEL - PRINTED CHANNEL ************************
    info: [APPLICATION]: ****************** GETCHANNEL - CATCH ************************
    info: [APPLICATION]: ****************** CREATECHANNEL - CALLED ************************
    info: [APPLICATION]: [object Object]
    info: [APPLICATION]: ****************** CREATECHANNEL - PRINTED RESPONSE ************************
    info: [APPLICATION]: ****************** CREATECHANNEL - CALLED ************************
    info: [APPLICATION]: SUCCESS
    info: [APPLICATION]: undefined
    info: [APPLICATION]: ****************** CREATECHANNEL - DONE ************************
    info: [APPLICATION]: [object Object]
    info: [APPLICATION]: ****************** CREATECHANNEL - printed createChannelResponse ************************
    */
    Constants.logger.info('****************** CREATECHANNEL - CALLED ************************');
    if (response != null) {
      Constants.logger.info(response.status);
      Constants.logger.info(response.message);
      if (response && response.status === 'SUCCESS') {
        Constants.logger.info('****************** CREATECHANNEL - DONE ************************');
        Constants.logger.info(response);
        Constants.logger.info('****************** CREATECHANNEL - printed createChannelResponse ************************');
      } else {
        Constants.logger.info('****************** CREATECHANNEL - FAILED ************************');
      } // else
    } // if response != null
  }// catch
}
module.exports.createChannelForOrg = createChannelForOrg;

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

/*
 * Have an organization join a channel
 */
async function joinChannel(peers, username, orgname) {
  // TODO: Test the whole code for a multi peer per org network and change the code to an array
  // of peers at required places

  // TODO: change channeleventhub to async await model instead of promise chain
  Constants.logger.info('****************** JOIN CHANNEL:: FUNCTION START ************************');
  let errorMessage = null;
  const allEventhubs = [];
  let channel = null;
  let response = null;

  const client = await getClientForOrg(orgname, username);
  try {
    Constants.logger.info('Calling peers in organization "%s" to join the channel', orgname);
    // first setup the client for this org
    Constants.logger.info('Successfully got the fabric client for the organization "%s"', orgname);
    // ERROR: (node:25734) UnhandledPromiseRejectionWarning: TypeError: Channel options must be an object with string keys and integer or string values
    // Remove the name param  (ClientHelper.getChannelNameFromConfig())- we want it from the client not from config

    // ERROR: Throw error = true
    channel = client.getChannel(null, true);
    if (!channel) {
      const message = util.format('Channel %s was not defined in the connection profile', Constants.channelnamestr);
      Constants.logger.info(message);
      throw new Error(message);
    }

    // Check if channel already has peers
    // TODO: Extend to which peer of the organisation. Currently our org has only 1 peer
    /*
    Constants.logger.info('****************** getChannelPeers:: CALLING ************************');
    const channelPeerArr = channel.getChannelPeers();
    Constants.logger.info(channelPeerArr.length);
    Constants.logger.info('****************** getChannelPeers:: PRINTED CHANNELPEERS CONTINUE ************************');
    // TODO: This API does not work. Hack since channel hass been created
    
    if (channelPeerArr.length == 0) {
      Constants.logger.info('****************** HACK SINCE API NOT WORKING _ RETURNING SINCE PEER ALREADY JOINED THE CHANNEL ************************');
      return null;
    }
    
    if (channelPeerArr.length > 0) {
      // TODO: 3 in array? Need to change?
      // TODO: check if exists add else not add for all 3
      channelPeerArr.forEach((channelPeer) => {
        // TODO: Change it to a constant from the connprofile to match with the peername argument
        if (channelPeer._peer._url === 'grpcs://localhost:7051') {
          Constants.logger.info('Channel Peer exists. Need not join peer to the channel %s', channelPeer._peer._url);
          // return null;
          // TODO: Does it mean need not join peer to the channel? we still need to
        }
        if (channelPeer._peer._url === 'grpcs://local    info: [APPLICATION]: ****************** pushing signature for ORG - DONE ************************
    info: [APPLICATION]: ****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG- DONE ************************
    info: [APPLICATION]: ****************** GETCHANNEL - CALLED ************************
    info: [APPLICATION]: {"name":"mychannel","orderers":["Orderer:{url:grpcs://localhost:7050}"],"peers":["Peer:{url:grpcs://localhost:7051}","Peer:{url:grpcs://localhost:8051}","Peer:{url:grpcs://localhost:9051}"]}
    info: [APPLICATION]: ****************** GETCHANNEL - PRINTED CHANNEL ************************
    info: [APPLICATION]: ****************** GETCHANNEL - CATCH ************************
    info: [APPLICATION]: ****************** CREATECHANNEL - CALLED ************************
    info: [APPLICATION]: [object Object]
    info: [APPLICATION]: ****************** CREATECHANNEL - PRINTED RESPONSE ************************
    info: [APPLICATION]: ****************** CREATECHANNEL - CALLED ************************
    info: [APPLICATION]: SUCCESS
    info: [APPLICATION]: undefined
    info: [APPLICATION]: ****************** CREATECHANNEL - DONE ************************
    info: [APPLICATION]: [object Object]
    info: [APhost:8051') {
          Constants.logger.info('Channel Peer exists. Need not join peer to the channel %s', channelPeer._peer._url);
          // return null;
          // TODO: Does it mean need not join peer to the channel? we still need to
        }
        if (channelPeer._peer._url === 'grpcs://localhost:9051') {
          Constants.logger.info('Channel Peer exists. Need not join peer to the channel %s', channelPeer._peer._url);
          // return null;
          // TODO: Does it mean need not join peer to the channel? we still need to
        }
        Constants.logger.info('****************** getChannelPeers:: PEERS THERE CONTINUE ************************');
      }); // for each
    } else if (channelPeerArr.length === 0) {
      // if there are channelPeers added to the channel need not fo and add more
      Constants.logger.info('****************** getChannelPeers:: NO PEERS RETURNING ************************');
    }
    */
    // If channel peer does not exists come here
    // TODO: Put all the below code in the else of channelPeer does not exist
    // Add peer
    try {
      // get peer from channel
      const channelPeer = channel.getPeer(peers[0]);
      Constants.logger.info('****************** channel.getPeer:: SUCCESS ************************');
      Constants.logger.info(channelPeer);
      Constants.logger.info('****************** channel.getPeer:: printed channelPeer ************************');
    } catch (err) {
      // if peer is not in channel, add it
      // get from the client and add it to the channel
      Constants.logger.info('****************** channel.getPeer:: FAILURE - getPeer from client and add it to the channel ************************');
      // TODO: Put a for loop here
      const peer1 = client.getPeer(peers[0]);
      Constants.logger.info('****************** client.getPeer:: SUCCESS ************************');
      Constants.logger.info(peer1);
      Constants.logger.info('****************** client.getPeer:: printed  ************************');
      // Add it to the channel
      channel.addPeer(peer1, getMSPofOrg(orgname), true, false); // last is replace, third is endorsing peer
      Constants.logger.info('****************** channel.addPeer:: SUCCESS  ************************');
      const channelPeer = channel.getPeer(peers[0]);
      Constants.logger.info('****************** channel.getPeer:: SUCCESS ************************');
      Constants.logger.info(channelPeer);
      Constants.logger.info('****************** channel.getPeer:: printed channelPeer ************************');
    } // Ctach if no peer is there

    // next step is to get the genesis_block from the orderer,
    // the starting point for the channel that we want to join
    // ERROR: Need time out also
    /*
      const request = {
      txId: client.newTransactionID(true) // get an admin based transactionID
    };
    */
    // ERROR: Orderer requesty parameter is not valid, must be an orderer name or an orderer object
    // channed in orderer section in conn_profile.yaml
    const request = {
      txId: client.newTransactionID(true), // get an admin based transactionID,
    };

    // ERROR: Failing at getGenesisBlock - the client and other details are getting loaded 
    // dynamically
    // ERROR: Message = Failed to connect before the deadline
    // ERROR: it is not traking 300000 and taking 3000
    let genesisBlock = null;
    try {
      genesisBlock = await channel.getGenesisBlock(request);
      Constants.logger.info(genesisBlock);
      Constants.logger.info('****************** channel.getGenesisiBlock:: printed genesisBlock************************');
    } catch (error) {
      Constants.logger.info('****************** channel.getGenesisiBlock:: FAILURE************************');
      Constants.logger.info(error.message);
      Constants.logger.info('******************************************************');
      Constants.logger.info('******************************************************');
      Constants.logger.info('****************** channel.getGenesisiBlock:: FAILURE printed errror message************************');
      return null;
    }
    // tell each peer to join and wait for the event hub of each peer to tell us
    // that the channel has been created on each peer
    const promises = [];
    const blockRegistrationNumbers = [];
    const eventHubs = client.getEventHubsForOrg(orgname);
    eventHubs.forEach((eh) => {
      const configBlockPromise = new Promise((resolve, reject) => {
        const eventTimeout = setTimeout(() => {
          const message = 'REQUEST_TIMEOUT:' + eh._ep._endpoint.addr;
          Constants.logger.info(message);
          eh.disconnect();
          reject(new Error(message));
        }, 60000);
        const blockRegistrationNumber = eh.registerBlockEvent((block) => {
          clearTimeout(eventTimeout);
          // a peer may have more than one channel so
          // we must check that this block came from the channel we
          // asked the peer to join
          if (block.data.data.length === 1) {
            // Config block must only contain one transaction
            const channelHeader = block.data.data[0].payload.header.channel_header;
            if (channelHeader.channel_id === Constants.channelnamestr) {
              const message = util.format('EventHub % has reported a block update for channel %s', eh._ep._endpoint.addr, Constants.channelnamestr);
              Constants.logger.info(message);
              resolve(message);
            } else {
              const message = util.format('Unknown channel block event received from %s', eh._ep._endpoint.addr);
              Constants.logger.info(message);
              reject(new Error(message));
            }
          }
        }, (err) => {
          clearTimeout(eventTimeout);
          const message = 'Problem setting up the event hub :' + err.toString();
          Constants.logger.info(message);
          reject(new Error(message));
        });
        // save the registration handle so able to deregister
        blockRegistrationNumbers.push(blockRegistrationNumber);
        allEventhubs.push(eh); // save for later so that we can shut it down
      });
      promises.push(configBlockPromise);
      eh.connect();
      // this opens the event stream that must be shutdown at some point with a disconnect()
    });
    let results = null;
    try {
      // All permissions of the peer should come from config?
      const joinRequest = { // TODO: if this works remove peers as a param Or send peers
        targets: peers, // peername TODO: Change this to channel peers - since all 3 will join the channel once
        // using the peer names which only is allowed when a connection profile is loaded
        txId: client.newTransactionID(true), // get an admin based transactionID
        block: genesisBlock
      };
      const joinPromise = channel.joinChannel(joinRequest);
      promises.push(joinPromise);
      results = await Promise.all(promises);
      Constants.logger.info(util.format('Join Channel R E S P O N S E : %j', results));
    } catch (error) {
      Constants.logger.info('Probably ledger already created - need not throw an error here and proceed');
    }
    // lets check the results of sending to the peers which is
    // last in the results array
    const peersResults = results.pop();
    // then each peer results
    peersResults.forEach((peerResult) => {
      if (peerResult.response && peerResult.response.status === 200) {
        Constants.logger.info('Successfully joined peer to the channel %s', Constants.channelnamestr);
      } else {
        const message = util.format('Failed to join peer to the channel %s', Constants.channelnamestr);
        errorMessage = message;
        Constants.logger.info(message);
      }
    }); // foreach
    // now see what each of the event hubs reported
    let i = 0;
    results.forEach((eventHubResult) => {
      const eventHub = eventHubs[i];
      const blockRegistrationNumber = blockRegistrationNumbers[i];
      Constants.logger.info('Event results for event hub :%s', eventHub._ep._endpoint.addr);
      if (typeof eventHubResult === 'string') {
        Constants.logger.info(eventHubResult);
      } else {
        if (!errorMessage) errorMessage = eventHubResult.toString();
        Constants.logger.info(eventHubResult.toString());
      }
      eventHub.unregisterBlockEvent(blockRegistrationNumber);
      i = i + 1;
    });
  } catch (error) {
    Constants.logger.info('Failed to join channel due to error: ' + error.stack ? error.stack : error);
    errorMessage = error.toString();
  } // Try at the beginning of the function

  // need to shutdown open event streams
  allEventhubs.forEach((eh) => {
    eh.disconnect();
  });

  if (!errorMessage) {
    const messageResponse = util.format(
      'Successfully joined peers in organization %s to the channel:%s',
      orgname, Constants.channelnamestr
    );
    Constants.logger.info(messageResponse);
    // build a response to send back to the REST caller
    response = {
      success: true,
      message: messageResponse
    };
    return response;
  }
  return response;
}
module.exports.joinChannel = joinChannel;

// ERROR: Context deadline is due to breakpoints and does not come in npm start

/*
info: [APPLICATION]: Calling peers in organization "Org1" to join the channel
info: [APPLICATION]: Successfully got the fabric client for the organization "Org1"
info: [APPLICATION]: ****************** channel.getPeer:: SUCCESS ************************
info: [APPLICATION]: Peer:{url:grpcs://localhost:7051}
info: [APPLICATION]: ****************** channel.getPeer:: printed channelPeer ************************
info: [APPLICATION]: .common.Block
info: [APPLICATION]: ****************** channel.getGenesisiBlock:: printed genesisBlock************************
info: [APPLICATION]: Join Channel R E S P O N S E : [[{"version":0,"timestamp":null,"response":{"status":200,"message":"","payload":{"type":"Buffer","data":[]}},"payload":{"type":"Buffer","data":[]},"endorsement":null}]]
info: [APPLICATION]: Successfully joined peer to the channel channelName
info: [APPLICATION]: Successfully joined peers in organization Org1 to the channel:channelName

info: [APPLICATION]: Calling peers in organization "Org2" to join the channel
info: [APPLICATION]: Successfully got the fabric client for the organization "Org2"
info: [APPLICATION]: ****************** channel.getPeer:: SUCCESS ************************
info: [APPLICATION]: Peer:{url:grpcs://localhost:8051}
info: [APPLICATION]: ****************** channel.getPeer:: printed channelPeer ************************
info: [APPLICATION]: .common.Block
info: [APPLICATION]: ****************** channel.getGenesisiBlock:: printed genesisBlock************************
info: [APPLICATION]: Join Channel R E S P O N S E : [[{"version":0,"timestamp":null,"response":{"status":200,"message":"","payload":{"type":"Buffer","data":[]}},"payload":{"type":"Buffer","data":[]},"endorsement":null}]]
info: [APPLICATION]: Successfully joined peer to the channel channelName
info: [APPLICATION]: Successfully joined peers in organization Org2 to the channel:channelName

info: [APPLICATION]: Calling peers in organization "Org3" to join the channel
info: [APPLICATION]: Successfully got the fabric client for the organization "Org3"
info: [APPLICATION]: ****************** channel.getPeer:: SUCCESS ************************
info: [APPLICATION]: Peer:{url:grpcs://localhost:9051}
info: [APPLICATION]: ****************** channel.getPeer:: printed channelPeer ************************
info: [APPLICATION]: .common.Block
info: [APPLICATION]: ****************** channel.getGenesisiBlock:: printed genesisBlock************************
info: [APPLICATION]: Join Channel R E S P O N S E : [[{"version":0,"timestamp":null,"response":{"status":200,"message":"","payload":{"type":"Buffer","data":[]}},"payload":{"type":"Buffer","data":[]},"endorsement":null}]]
info: [APPLICATION]: Successfully joined peer to the channel channelName
info: [APPLICATION]: Successfully joined peers in organization Org3 to the channel:channelName

hypledvm@hypledvm-VirtualBox:~/go/src/utilitypoc/network/acmedevmode$ docker exec -it peer0.org1.acme.com bash
el list68008e9d56:/opt/gopath/src/github.com/hyperledger/fabric/peer# peer chann 
2018-10-31 12:22:30.594 UTC [msp] GetLocalMSP -> DEBU 001 Returning existing local MSP
2018-10-31 12:22:30.594 UTC [msp] GetDefaultSigningIdentity -> DEBU 002 Obtaining default signing identity
2018-10-31 12:22:30.625 UTC [channelCmd] InitCmdFactory -> INFO 003 Endorser and orderer connections initialized
2018-10-31 12:22:30.625 UTC [msp/identity] Sign -> DEBU 004 Sign: plaintext: 0A94070A5C08031A0C0886BDE6DE0510...631A0D0A0B4765744368616E6E656C73 
2018-10-31 12:22:30.625 UTC [msp/identity] Sign -> DEBU 005 Sign: digest: 3483858D378F3A076C122DC3467FC2C763EBE9FD2B625D607601008340AB821E 
Channels peers has joined: 
mychannel
2018-10-31 12:22:30.627 UTC [main] main -> INFO 006 Exiting.....
root@9868008e9d56:/opt/gopath/src/github.com/hyperledger/fabric/peer# exit
exit
hypledvm@hypledvm-VirtualBox:~/go/src/utilitypoc/network/acmedevmode$ docker exec -it peer0.org2.acme.com bash
el list81a0f4c08d:/opt/gopath/src/github.com/hyperledger/fabric/peer# peer chann 
2018-10-31 12:22:45.223 UTC [msp] GetLocalMSP -> DEBU 001 Returning existing local MSP
2018-10-31 12:22:45.223 UTC [msp] GetDefaultSigningIdentity -> DEBU 002 Obtaining default signing identity
2018-10-31 12:22:45.244 UTC [channelCmd] InitCmdFactory -> INFO 003 Endorser and orderer connections initialized
2018-10-31 12:22:45.245 UTC [msp/identity] Sign -> DEBU 004 Sign: plaintext: 0A93070A5B08031A0B0895BDE6DE0510...631A0D0A0B4765744368616E6E656C73 
2018-10-31 12:22:45.245 UTC [msp/identity] Sign -> DEBU 005 Sign: digest: 81C08BD0BFF5DF36D4D219F9894E105B43CC8A7813AB2A657627A2C21EA3EC3D 
Channels peers has joined: 
mychannel
2018-10-31 12:22:45.247 UTC [main] main -> INFO 006 Exiting.....
root@3e81a0f4c08d:/opt/gopath/src/github.com/hyperledger/fabric/peer# exit
exit
hypledvm@hypledvm-VirtualBox:~/go/src/utilitypoc/network/acmedevmode$ docker exec -it peer0.org3.acme.com bash
root@8f9d8a64bd1d:/opt/gopath/src/github.com/hyperledger/fabric/peer# peer channel list
2018-10-31 12:22:58.646 UTC [msp] GetLocalMSP -> DEBU 001 Returning existing local MSP
2018-10-31 12:22:58.646 UTC [msp] GetDefaultSigningIdentity -> DEBU 002 Obtaining default signing identity
2018-10-31 12:22:58.681 UTC [channelCmd] InitCmdFactory -> INFO 003 Endorser and orderer connections initialized
2018-10-31 12:22:58.681 UTC [msp/identity] Sign -> DEBU 004 Sign: plaintext: 0A94070A5C08031A0C08A2BDE6DE0510...631A0D0A0B4765744368616E6E656C73 
2018-10-31 12:22:58.681 UTC [msp/identity] Sign -> DEBU 005 Sign: digest: CC360E6C9E07E273FF53DEABEEEAC0FEA45CAE8F58A20EB08196C54DC6C4823E 
Channels peers has joined: 
mychannel
2018-10-31 12:22:58.685 UTC [main] main -> INFO 006 Exiting.....

*/

function setupChaincodeDeploy() {
  process.env.GOPATH = path.join(__dirname, hfc.getConfigSetting('CC_SRC_PATH'));
}

exports.setupChaincodeDeploy = setupChaincodeDeploy;

// install chaincode on org1 peers and org2 peers and org3 peers - 1 org at a time
async function installChaincode(
  peers,
  chaincodeName,
  chaincodePath,
  chaincodeVersion,
  chaincodeType,
  username,
  orgname
) {
  Constants.logger.info('******************************Install chaincode on organizations******************************');
  Constants.logger.info('******************************Called setupChaincodeDeploy ******************************');

  // ERROR:  error: [client-utils.js]: sendPeersProposal - Promise is rejected:
  // Error: 2 UNKNOWN: chaincode error (status: 500, message: Error installing chaincode code
  // chaincode:v0(chaincode /var/hyperledger/production/chaincodes/chaincode.v0 exists))
  // first setup the client for this org
  const client = await getClientForOrg(orgname, username);
  Constants.logger.info('Successfully got the fabric client for the organization "%s"', orgname);
  // TODO: change it to check for all peers
  // ERROR: error: [client-utils.js]: sendPeersProposal - Promise is rejected: 
  // Error: 2 UNKNOWN: chaincode error (status: 500, message: Authorization for GETINSTALLEDCHAINCODES on channel getinstalledchaincodes has been denied with error Failed verifying that proposal's creator satisfies local MSP principal during channelless check policy with policy [Admins]: [This identity is not an admin])
  //  at new createStatusError (/home/hypledvm/go/src/utilitypoc/network/acmedevmode/node_modules/fabric-client/node_modules/grpc/src/client.js:64:15)
  // passing true helps
  const queryResponse = client.queryInstalledChaincodes(peers[0], true);
  Constants.logger.info('******************************queryInstalledChaincodes called ******************************');
  Constants.logger.info(queryResponse);
  Constants.logger.info('******************************queryInstalledChaincodes queryResponse printed ******************************');

  if (queryResponse != null) {
    // TODO: check the name version etc and see if it matches
    Constants.logger.info('******************************CHAINCODE already installed ******************************');
    return null;
  }
  setupChaincodeDeploy();
  let errorMessage = null;
  try {
    Constants.logger.info('Calling peers in organization "%s" to join the channel', orgname);
    txId = client.newTransactionID(true); // get an admin transactionID
    const request = {
      targets: peers,
      chaincodePath: chaincodePath,
      chaincodeId: chaincodeName,
      chaincodeVersion: chaincodeVersion,
      chaincodeType: chaincodeType
    };
    const results = await client.installChaincode(request);
    // the returned object has both the endorsement results
    // and the actual proposal, the proposal will be needed
    // later when we send a transaction to the orederer
    const proposalResponses = results[0];

    // lets have a look at the responses to see if they are
    // all good, if good they will also include signatures
    // required to be committed
    let allGood = true;
    if (proposalResponses) {
      for (var i in proposalResponses) {
        const oneGood = false;
        if (proposalResponses &&
          proposalResponses[i].response &&
          proposalResponses[i].response.status === 200) {
          oneGood = true;
          Constants.logger.info('install proposal was good');
        } else {
          Constants.logger.info('install proposal was bad %j', proposalResponses[0]);
        } // end of else
        allGood = allGood & oneGood;
      } // for var in proposalResponses
      if (allGood) {
        Constants.logger.info('Successfully sent install Proposal and received ProposalResponse');
      } else {
        errorMessage = 'Failed to send install Proposal or receive valid response. Response null or status is not 200';
        Constants.logger.info(errorMessage);
      } // install proposals else
    } // end of if proposal responses
  } catch (error) {
    Constants.logger.info('Failed to install due to error: ' + (error.stack ? error.stack : error));
    errorMessage = error.toString();
  } // end of catch
  let response = null;
  if (!errorMessage) {
    const message = util.format('Successfully install chaincode');
    Constants.logger.info(message);
    // build a response to send back to the REST caller
    response = {
      success: true,
      message: message
    };
  } else {
    const message = util.format('Failed to install due to:%s', errorMessage);
    Constants.logger.info(message);
    throw new Error(message);
  }
  return response;
}
exports.installChaincode = installChaincode;

async function instantiateChaincode(peers, channelName, chaincodeName, chaincodeVersion, functionName, chaincodeType, args, username, orgname) {
  Constants.logger.info('*********************** Instantiate chaincode on channel ' + channelName + ' ***********************');
  let errorMessage = null;

  try {
    // first setup the client for this org
    const client = await getClientForOrg(orgname, username);
    Constants.logger.info('Successfully got the fabric client for the organization "%s"', orgname);
    const channel = client.getChannel(channelName);
    if (!channel) {
      const message = util.format('Channel %s was not defined in the connection profile', channelName);
      Constants.logger.info(message);
      throw new Error(message);
    }
    const txId = client.newTransactionID(true); // Get an admin based transactionID
    // An admin based transactionID will
    // indicate that admin identity should
    // be used to sign the proposal request.
    // will need the transaction ID string for the event registration later
    const deployId = txId.getTransactionID();

    // send proposal to endorser
    const request = {
      targets: peers,
      chaincodeId: chaincodeName,
      chaincodeType: chaincodeType,
      chaincodeVersion: chaincodeVersion,
      args: args,
      txId: txId
    };

    if (functionName) {
      request.fcn = functionName;
    }
    // instantiate takes much longer
    const results = await channel.sendInstantiateProposal(request, 600000000000);

    // the returned object has both the endorsement results
    // and the actual proposal, the proposal will be needed
    // later when we send a transaction to the orderer
    const proposalResponses = results[0];
    const proposal = results[1];

    // lets have a look at the responses to see if they are
    // all good, if good they will also include signatures
    // required to be committed
    const allGood = true;
    if (proposalResponses != null) {
      for (let i in proposalResponses) {
        let oneGood = false;
        if (
          proposalResponses &&
          proposalResponses[i].response &&
          proposalResponses[i].response.status === 200) {
          oneGood = true;
          Constants.logger.info('instantiate proposal was good');
        } else {
          Constants.logger.info('instantiate proposal was bad');
        } // else
        allGood = allGood & oneGood;
      } // for loop
    } // if proposal responses exist

    if (allGood) {
      Constants.logger.info(util.format(
        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
        proposalResponses[0].response.status, proposalResponses[0].response.message,
        proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature
      ));

      // wait for the channel-based event hub to tell us that the
      // instantiate transaction was committed on the peer
      const promises = [];
      let eventHubs = channel.getChannelEventHubsForOrg();
      Constants.logger.info('found %s eventhubs for this organization %s', eventHubs.length, orgname);
      eventHubs.forEach((eh) => {
        const instantiateEventPromise = new Promise((resolve, reject) => {
          Constants.logger.info('instantiateEventPromise - setting up event');
          let eventTimeout = setTimeout(() => {
            const message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
            Constants.logger.info(message);
            eh.disconnect();
          }, 60000);
          eh.registerTxEvent(deployId, (tx, code, blockNum) => {
            Constants.logger.info('The chaincode instantiate transaction has been committed on peer %s', eh.getPeerAddr());
            Constants.logger.info('Transaction %s has status of %s in blocl %s', tx, code, blockNum);
            clearTimeout(eventTimeout);

            if (code !== 'VALID') {
              const message = util.format('The chaincode instantiate transaction was invalid, code:%s', code);
              Constants.logger.info(message);
              reject(new Error(message));
            } else {
              const message = 'The chaincode instantiate transaction was valid.';
              Constants.logger.info(message);
              resolve(message);
            }
          }, (err) => {
            clearTimeout(eventTimeout);
            Constants.logger.info(err);
            reject(err);
          },
            // the default for 'unregister' is true for transaction listeners
            // so no real need to set here, however for 'disconnect'
            // the default is false as most event hubs are long running
            // in this use case we are using it only once
            { unregister: true, disconnect: true });
          eh.connect();
        });
        promises.push(instantiateEventPromise);
      });

      const ordererRequest = {
        txId: txId, // must include the transaction id so that the outbound
        // transaction to the orderer will be signed by the admin
        // id as was the proposal above, notice that transactionID
        // generated above was based on the admin id not the current
        // user assigned to the 'client' instance.
        proposalResponses: proposalResponses,
        proposal: proposal
      };
      const sendPromise = channel.sendTransaction(ordererRequest);
      // put the send to the orderer last so that the events get registered and
      // are ready for the orderering and committing
      promises.push(sendPromise);
      const results = await Promise.all(promises);
      Constants.logger.info(util.format('------->>> R E S P O N S E : %j', results));
      const response = results.pop(); //  orderer results are last in the results
      if (response.status === 'SUCCESS') {
        Constants.logger.info('Successfully sent transaction to the orderer.');
      } else {
        errorMessage = util.format('Failed to order the transaction. Error code: %s', response.status);
        Constants.logger.info(errorMessage);
      }

      // now see what each of the event hubs reported
      if (results != null) {
        for (let i in results) {
          let eventHubResult = results[i];
          let eventHub = eventHubs[i];
          Constants.logger.info('Event results for event hub :%s', eventHub.getPeerAddr());
          if (typeof event_hub_result === 'string') {
            Constants.logger.info(eventHubResult);
          } else {
            if (!errorMessage) errorMessage = eventHubResult.toString();
            Constants.logger.info(eventHubResult.toString());
          }
        }
      } // if
    } else {
      errorMessage = util.format('Failed to send Proposal and receive all good ProposalResponse');
      Constants.logger.info(errorMessage);
    } // if allGood
  } catch (error) {
    Constants.logger.info('Failed to send instantiate due to error: ' + error.stack ? error.stack : error);
    errorMessage = error.toString();
  }
  let response = null;
  if (!errorMessage) {
    const message = util.format(
      'Successfully instantiate chaingcode in organization %s to the channel \'%s\'',
      orgname,
      channelName
    );
    Constants.logger.info(message);
    // build a response to send back to the REST caller
    response = {
      success: true,
      message: message
    };
  } else {
    const message = util.format('Failed to instantiate. cause:%s', errorMessage);
    Constants.logger.info(message);
    throw new Error(message);
  }
  return response;
}
exports.instantiateChaincode = instantiateChaincode;
