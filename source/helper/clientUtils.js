// ERROR: FS and util should be the first import
const util = require('util');
const fs = require('fs');
// const fabricCAClient = require('fabric-ca-client');
const Constants = require('../constants.js');
const ClientHelper = require('./helper.js');

async function getClientForOrg(orgname) {
  // ERROR: Error: Invalid network configuration due to "version" is missing
  // changed connectionprofile file to version: "1.1" 
  // restarting the ledger with the same genesis and channel tx files
  // ERROR: Had missed the function ()
  Constants.logger.info('****************** getClientForOrg - INSIDE FUNCTTION ************************');
  const client = Constants.hfc.loadFromConfig(ClientHelper.getClientConnectionFilePath());
  Constants.logger.info('****************** client after loadfromconfig START ************************');
  // Comment START: Required when key value store would be used
  Constants.logger.info('****************** getClientConnectionFilePath - OVER ************************');
  // 'Org3-connection-profile-path'
  const connprofilepathstr = Constants.hfc.getConfigSetting(orgname + Constants.configappendstr);
  Constants.logger.info(Constants.hfc.getConfigSetting(connprofilepathstr));
  Constants.logger.info('****************** printed the orgname config file path ************************');
  // Note: Use the same client object and load again
  // NO ERROR: This does work
  // Since the keystore is only provided in the config it will search from there
  // We need to put something there. Take from the CA and store it there
  client.loadFromConfig(connprofilepathstr);
  // Comment END: Required when key value store would be used
  // Use _mspid instead of mspid
  Constants.logger.info(client._mspid); // Does not type cast and shows it fully
  Constants.logger.info('****************** client after loadfromconfig END ************************');
  return client;
}
module.exports.getClientForOrg = getClientForOrg;

function getTransactionId(client) {
  // ERROR: Removed true passed as an argument
  // UnhandledPromiseRejectionWarning: TypeError: client.newTransactionID is not a function
  Constants.logger.info('****************** getTransactionId - INSIDE FUNCTTION ************************');
  // TODO: Default is not admin based on the userContext. Passing true is admin
  // Passing true for admin
  // TODO: check client usercontext is admin, then pass true and add an else
  const txId = client.newTransactionID(true);
  return txId;
}
module.exports.getTransactionId = getTransactionId;

async function enrollClientForOrg(orgname, client) {
  // REFERENCE: https://hackernoon.com/setting-up-restful-api-server-for-hyperledger-fabric-with-nodejs-sdk-a4642edaf98e
  // NOT ENTIRELY CORRECT
  // https://stackoverflow.com/questions/52927032/how-certificates-get-derived-from-the-real-fabric-ca-server-certificate-in-hfc-k/53002284#53002284
  // https://github.com/hyperledger/fabric-sdk-java/blob/master/src/test/java/org/hyperledger/fabric_ca/sdkintegration/HFCAClientIT.java
  Constants.logger.info('****************** enrollClientForOrg - INSIDE FUNCTTION ************************');
  Constants.logger.info(orgname);
  // await needs the function - CreateChannel to be an async function
  // manage return of a promise by making the calling function async

  const promiseCredentialStore = await client.initCredentialStores();
  Constants.logger.info('****************** initCredentialStores ::: SUCCESS ************************');
  Constants.logger.info(promiseCredentialStore);
  Constants.logger.info('****************** printed client after calling initCredentialStores ************************');
  // ERROR: no error but loads only ca-org1
  // pass caname as parameter
  const fabCAClient = client.getCertificateAuthority(ClientHelper.getCAName(orgname));
  Constants.logger.info('****************** getCertificateAuthority ::: CALLED ************************');
  Constants.logger.info(fabCAClient);
  Constants.logger.info('****************** getCertificateAuthority ::: PRINTED CACLIENT instance ************************');
  const userContextPromise = await client.getUserContext(ClientHelper.getUserName(), true);
  // user does not exist and state store has not been set
  if (userContextPromise != null) {
    Constants.logger.info('****************** getUserContext::NOT NULL returned - user exists in store ************************');
    // return null;
  }
  Constants.logger.info('****************** getUserContext had no user ADMIN - hence create by enrolling  ************************');
  // TODO: User getUserContext for future requests from the keystore instead of enrolling
  // Enroll the user
  // TODO: Remove hardcoding of the strings
  // Need not start separately - already there in the docker images.
  // check is TLS is set - mutual TLS is set
  // status on the ledger
  // ca_peerOrg1            | 2018/10/21 14:49:14 [INFO] 172.19.0.1:55198 POST /api/v1/enroll 201 0 "OK"
  // http://www.littlebigextra.com/how-to-enable-remote-rest-api-on-docker-host/
  
  // attr_reqs: [
  //  { name: 'hf.Registrar.Roles' },
  //  { name: 'hf.Registrar.Attributes' }
  // ]
  const enrolledAdmin = await fabCAClient.enroll({
    // ERROR: [FabricCAClientImpl.js]: Invalid enroll request, missing enrollmentID 'ID" caps required
    enrollmentID: ClientHelper.getUserName(), // TODO: How do you avoid loading again and again
    enrollmentSecret: ClientHelper.getUserPassword(),
    profile: 'tls'
  });
  Constants.logger.info('****************** fabCAClient.enroll CALLED ************************');
  if (!enrolledAdmin) {
    // TODO: There should be a try catch somewhere
    // TODO: Remove hardcode message to constants
    Constants.logger.info('****************** fabCAClient.enroll - UNSUCCESSFUL ************************');
    throw Error('admin enrollment unsuccessful');
  }
  // TODO: CA server is not running what is it enrolling?
  // Successfully called the Certificate Authority to get the TLS material
  const key = enrolledAdmin.key.toBytes();
  Constants.logger.info(key);
  Constants.logger.info('******************  ENROLLMENT KEY PRINTED ************************');
  const cert = enrolledAdmin.certificate;
  Constants.logger.info(cert);
  Constants.logger.info('******************  ENROLLMENT CERT PRINTED ************************');
  // set the material on the client to be used when building endpoints for the user
  client.setTlsClientCertAndKey(cert, key);
  Constants.logger.info('******************  client.setTlsClientCertAndKey called ************************');
  // console.log(enrolledAdmin);
  // Constants.logger.info('****************** fabCAClient.enroll printed admin ************************');
  Constants.logger.info('****************** fabCAClient.enroll SUCCESS ************************');
  // ERROR: (node:27192) UnhandledPromiseRejectionWarning: TypeError: enrolledAdmin.setEnrollment is not a function
  // TODO: change the kvs to a DB later
  // Persist it in the kvs
  const userPersisted = await client.setUserContext(
    {
      username: ClientHelper.getUserName(),
      password: ClientHelper.getUserPassword()
    },
    true
  );
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
    Constants.logger.info('****************** client.setUserContext returned FALSE. USER not persisted and not enrolled************************');
  }
  // ERROR: This promise is pending - this is only if we want to use it again
  // TODO: something
  // TODO: some condition to pick from kvs if it exists instead of going to the ca
  const adminSigningIdentity = userPersisted.setEnrollment(
    key,
    cert,
    ClientHelper.getMSPofOrg(orgname),
    true
  );
  Constants.logger.info('****************** setEnrollment CALLED  ************************');
  console.log(adminSigningIdentity);
  Constants.logger.info('****************** setEnrollment printed promise  ************************');
  
  // TODO: store in a variable here if used multiple times
  // ClientHelper.getMSPofOrg(orgname);

  // ERROR: No credentialStore settings found - adding the client: section in the connprofile.yaml
  // ERROR: Need to change context of different clients. Hence loading org1, org2 etc
  // and if not found in the key store get it from config and assign it to the client
  /*
  try {
    const adminUserContext = await client.setUserContext(
      {
        username: username, // 'admin'
        password: ClientHelper.getUserPassword() // 'adminpw'
      }
    );
    Constants.logger.info('****************** setUserContext ::: CALLED ************************');
    Constants.logger.info(adminUserContext);
    Constants.logger.info('****************** setUserContext ::: PRINTED PROMISE ************************');
  } catch (err) {
    Constants.logger.info('****************** setUserContext ::: CATCH ************************');
    Constants.logger.info(err.message);
    Constants.logger.info('****************** setUserContext ::: PRINTED CATCH MESSAGE ************************');
  }
  */
  
  /* 
  await fabricCaClient.register(
    {
      enrollmentID: ClientHelper.getUserName(), // 'user1', - for me still admin
      affiliation: orgname// 'org1' // TODO: Check lowercase or 'Org1'
    }, adminUserContext // from setUserContext
  );
  */
  
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
  Constants.logger.info('****************** extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG- DONE ************************');
  Constants.logger.info(channelConfig);
  Constants.logger.info(signature);
  Constants.logger.info('****************** pushing signature for ORG - DONE ************************');
  signaturesallorgs.push(signature);
  Constants.logger.info('****************** PRINTED extractChannelConfig and signChannelConfig - config to pass to CreateChannel ORG - DONE ************************');

  // channel is created by the orderer initially
  // each peer will join the channel by sending channel configuration to each of the peer nodes
  // TODO: restructure Do this only if 0, 1, 2 are over
  let createChannelRequest = null;
  createChannelRequest = {
    name: channelName, // 'mychannel',
    // orderer is not there in balance-transfer example
    // orderer: Constants.orderername, // 'orderer.acme.com',
    signatures: [signature], // signaturesallorgs
    config: channelConfig,
    txId: createChannelTxId
  };
  // ERROR: Remove the if condition - having the channel object loaded is no guarantee for
  // the channel to have been created
  // TODO: rectify this. channel is not created, there should be another way to know channel
  // has been created
  try {
    // ERROR: this param is the one seen in the network config - remove it
    const channel = client.getChannel(null, true);
    Constants.logger.info('****************** GETCHANNEL - CALLED ************************');
    Constants.logger.info(channel);
    Constants.logger.info('****************** GETCHANNEL - PRINTED CHANNEL ************************');
    // TODO: remove hack - throwing error on purpose so that it creates a channel and 
    // make sure you create it only once - should not be specific to the org
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
    Constants.logger.info('****************** GETCHANNEL - CATCH ************************');
    const response = await client.createChannel(createChannelRequest);

    Constants.logger.info('****************** CREATECHANNEL - CALLED ************************');
    Constants.logger.info(response.status);
    Constants.logger.info(response.message);
    if (response && response.status === 'SUCCESS') {
      Constants.logger.info('****************** CREATECHANNEL - DONE ************************');
      Constants.logger.info(response);
      Constants.logger.info('****************** CREATECHANNEL - printed createChannelResponse ************************');
    } else {
      Constants.logger.info('****************** CREATECHANNEL - FAILED ************************');
    }// create channel failed

    // try catch channel does not exist create a channel
    // exists because we created it now - or it already exists
    // Constants.logger.info('****************** CREATECHANNEL - CATCH ************************');
    // Constants.logger.info(err);
    // Constants.logger.info('****************** CREATECHANNEL - CATCH DONE ************************');
  }
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
module.exports.createChannelForOrg = createChannelForOrg;

/*
async function joinChannel(orgname, peername, client) {
  Constants.logger.info('****************** JOIN CHANNEL - INSIDE FUNCTTION ************************');

  const channelName = ClientHelper.getChannelNameFromConfig();
  const channel = client.getChannel(channelName); // 'mychannel'
  Constants.logger.info('****************** GETCHANNEL - DONE ************************');
  Constants.logger.info(channel);
  Constants.logger.info('****************** GETCHANNEL - printed getChannel result ************************');

  try {
    // Join channel
    // ERROR: Need to pass client to getTransactionId
    const genesisBlockTxid = getTransactionId(client);
    const requestGenesisBlock = {
      txId: genesisBlockTxid
      
      // orderer: {
      //  url: 'grpcs://localhost:7050',
      //  opts: {
      //    'request-timeout': 60000
      //  }
      // }
      
    };
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
    // ERROR: Works on executing the following on the peer/cli
    // peer channel fetch newest -c mychannel -o orderer.acme.com:7050 --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/acme.com/orderers/orderer.acme.com/msp/tlscacerts/tlsca.acme.com-cert.pem
    // Created mychannel_newest.block
    // the authorization was the problem
    // TODO: Restart the network. Give orderer permissions and then use channel event hubs to join peers to the channel
    // ERROR:
    // Post the channel has been created and genesis block is a success. join channel need not be called again
    // If called gives the following error
    // [ { Error: 2 UNKNOWN: chaincode error (status: 500, message: Cannot create ledger from genesis block, due to LedgerID already exists)
    //  at new createStatusError (/home/hypledvm/go/src/utilitypoc/network/acmedevmode/node_modules/grpc/src/client.js:64:15)
    //  at /home/hypledvm/go/src/utilitypoc/network/acmedevmode/node_modules/grpc/src/client.js:583:15
    //  code: 2,
    //  metadata: Metadata { _internal_repr: {} },
    //  details: 'chaincode error (status: 500, message: Cannot create ledger from genesis block, due to LedgerID already exists)' } ]

    // ERROR: (node:27623) UnhandledPromiseRejectionWarning: Error: Peer with name "peer0.org1.acme.com" not assigned to this channel
    // This error is a a result of CreateChannel Failure
    Constants.logger.info('****************** GETGENSISBLOCK:: CALLING ************************');
    const genesisBlock = await channel.getGenesisBlock(requestGenesisBlock);
    Constants.logger.info('****************** GETGENSISBLOCK:: SUCCESS ************************');
    Constants.logger.info(genesisBlock);
    // .common.Block - is the block created
    Constants.logger.info('****************** GETGENSISBLOCK:: printed genesisBlock ************************');
    // While using a connection profile
    const channelEventHub = channel.newChannelEventHub(peername);
    // blockRegNo used to unregister
    // block is the callback
    const blockRegNo = await channelEventHub.registerBlockEvent((block) => {
      Constants.logger.info('****************** REGISTERBLOCKEVENT:: BLOCK RECEIVED START************************');
      Constants.logger.info(block.data.data.length);
      if (block.data.data.length === 1) {
        const channelHeader = block.data.data[0].payload.header.channel_header;
        if (channelHeader.channel_id === channelName) {
          const message = util.format('EventHub % has reported a block update for channel %s', channelEventHub._ep._endpoint.addr, channelName);
          Constants.logger.info(message);
        } else {
          const message = util.format('Unknown channel block event received from %s', channelEventHub._ep._endpoint.addr);
          Constants.logger.info(message);
        }
      } // if only the genesis block has been added
      // channelEventHub.unregisterBlockEvent(blockRegNo);
      // Constants.logger.info('****************** UNREGISTERBLOCKEVENT:: BLOCK RECEIVED START************************');
      channelEventHub.connect();
    }, (error) => { // callback over
      Constants.logger.info('****************** REGISTERBLOCKEVENT:: ERROR START************************');
      Constants.logger.info(error);
      Constants.logger.info('****************** REGISTERBLOCKEVENT:: ERROR END ************************');
      channelEventHub.unregisterBlockEvent(blockRegNo);
      Constants.logger.info('****************** UNREGISTERBLOCKEVENT:: ERROR END ************************');
    }); // registerBlockEvent over

    // JOIN CHANNEL
    // Before adding the peers from different orgs initialize the peers from different orgs in the channel
    // we will take values from the connectionprofile.yaml
    // TODO: To extend it for all peers in an org
    const joinChannelRequest = {
      targets: [peername], // peers in an org, for our case it is only one peer
      block: genesisBlock,
      txId: client.newTransactionID(true)
    };
    // ERROR: (node:8787) UnhandledPromiseRejectionWarning: Error: Peer with name "peer0.org1.acme.com" not assigned to this channel
    // Use channelEventHub
    const proposalResponse = await channel.joinChannel(joinChannelRequest, 10000); // 10 secs
    Constants.logger.info('****************** JOINCHANNEL:: CALLED ************************');
    Constants.logger.info(proposalResponse);
    if ((proposalResponse[0].code === 2) && (proposalResponse[0].message === 'Cannot create ledger from genesis block, due to LedgerID already exists')) {
      Constants.logger.info('****************** JOINCHANNEL:: ALREADY JOINED ************************');
    }
    console.log(proposalResponse);
    Constants.logger.info('****************** JOINCHANNEL:: printed proposal response ************************');
  } catch (err) {
    Constants.logger.info('****************** JOIN CHANNEL:: CATCH ************************');
    Constants.logger.info(err.message);
    Constants.logger.info('****************** JOIN CHANNEL:: CATCH END ************************');
  } // end of catch - from getGenesisBlock channeEventHub
}
*/

/*
 * Have an organization join a channel
 */
async function joinChannel(client, peername, orgname) {
  // TODO: Test the whole code for a multi peer per org network and change the code to an array
  // of peers at required places

  // TODO: change channeleventhub to async await model instead of promise chain
  Constants.logger.info('****************** JOIN CHANNEL:: FUNCTION START ************************');
  let errorMessage = null;
  const allEventhubs = [];
  let channel = null;
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
    Constants.logger.info('****************** getChannelPeers:: CALLING ************************');
    const channelPeerArr = channel.getChannelPeers();
    Constants.logger.info(channelPeerArr.length);
    Constants.logger.info('****************** getChannelPeers:: PRINTED CHANNELPEERS CONTINUE ************************');
    // TODO: This API does not work. Hack since channel hass been created
    /*
    if (channelPeerArr.length == 0) {
      Constants.logger.info('****************** HACK SINCE API NOT WORKING _ RETURNING SINCE PEER ALREADY JOINED THE CHANNEL ************************');
      return null;
    }
    */
    if (channelPeerArr.length > 0) {
      // TODO: 3 in array? Need to change?
      // TODO: check if exists add else not add for all 3
      channelPeerArr.forEach((channelPeer) => {
        // TODO: Change it to a constant from the connprofile to match with the peername argument
        if (channelPeer._peer._url === 'grpcs://localhost:7051') {
          Constants.logger.info('Channel Peer exists. Need not join peer to the channel');
          Constants.logger.info('****************** getChannelPeers:: NO PEERS RETURNING ************************');
          // return null;
          // TODO: Does it mean need not join peer to the channel? we still need to
        }
        Constants.logger.info('****************** getChannelPeers:: PEERS THERE CONTINUE ************************');
      }); // for each
    } // if there are channelPeers added to the channel need not fo and add more
    // If channel peer does not exists come here
    // TODO: Put all the below code in the else of channelPeer does not exist
    // Add peer
    /*try {
      // get peer from channel
      const channelPeer = channel.getPeer(peername);
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
    */
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
    // All permissions of the peer should come from config?
    const joinRequest = {
      targets: channelPeerArr, // peername TODO: Change this to channel peers - since all 3 will join the channel once
      // using the peer names which only is allowed when a connection profile is loaded
      txId: client.newTransactionID(true), // get an admin based transactionID
      block: genesisBlock
    };
    const joinPromise = channel.joinChannel(joinRequest);
    promises.push(joinPromise);
    const results = await Promise.all(promises);
    Constants.logger.info(util.format('Join Channel R E S P O N S E : %j', results));

    // lets check the results of sending to the peers which is
    // last in the results array
    const peersResults = results.pop();
    // then each peer results
    peersResults.forEach((peerResult) => {
      if (peerResult.response && peerResult.response.status === 200) {
        Constants.logger.info('Successfully joined peer to the channel %s', Constants.channelnamestr);
      } else {
        const message = util.format('Failed to joined peer to the channel %s', Constants.channelnamestr);
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
    const response = {
      success: true,
      message: messageResponse
    };
    return response;
  }
}
module.exports.joinChannel = joinChannel;

/*version
// tell each peer to join and wait f{ key:
   ECDSA_KEY {
     _key:
      { type: 'EC',
        isPrivate: true,
        isPublic: false,
        getBigRandom: [Function],
        setNamedCurve: [Function],
        setPrivateKeyHex: [Function],
        setPublicKeyHex: [Function],
        getPublicKeyXYHex: [Function],
        getShortNISTPCurveName: [Function],
        generateKeyPairHex: [Function],
        signWithMessageHash: [Function],
        signHex: [Function],
        sign: [Function],
        verifyWithMessageHash: [Function],
        verifyHex: [Function],
        verify: [Function],
        verifyRaw: [Function],
        serializeSig: [Function],
        parseSig: [Function],
        parseSigCompact: [Function],
        readPKCS5PrvKeyHex: [Function],
        readPKCS8PrvKeyHex: [Function],
        readPKCS8PubKeyHex: [Function],
        readCertPubKeyHex: [Function],
        curveName: 'secp256r1',
        ecparams: [Object],
        prvKeyHex: 'dbcae5e001c14599f151dedeadfbf6f60b419bab4052f56cb1c96c51a3c0e047',
        pubKeyHex: '041a41c2f2e89b18c1364b447c8979cffcffc71bbafdd3a489aa800e9751f8fec33fbc7b206694ac4dce1a166c4fcfc9fc4f9cc02a134ff7191cc1d8102b6abad4' } },
  certificate: '-----BEGIN CERTIFICATE-----\nMIICHTCCAcOgAwIBAgIUGQUN+4M9TlLQAsGZERzO2d7+mfYwCgYIKoZIzj0EAwIw\nbTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xFjAUBgNVBAoTDW9yZzEuYWNtZS5jb20xGTAXBgNVBAMTEGNh\nLm9yZzEuYWNtZS5jb20wHhcNMTgxMDIxMTU0ODAwWhcNMTkxMDIxMTU1MzAwWjAh\nMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZIzj0CAQYI\nKoZIzj0DAQcDQgAEGkHC8uibGME2S0R8iXnP/P/HG7r906SJqoAOl1H4/sM/vHsg\nZpSsTc4aFmxPz8n8T5zAKhNP9xkcwdgQK2q61KOBjDCBiTAOBgNVHQ8BAf8EBAMC\nA6gwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAw\nHQYDVR0OBBYEFE+07h5AYtkgVHtNXBixeJGnEDymMCsGA1UdIwQkMCKAIKLJst5o\nEIgb9D9QJZqzEk22jVBznRY8oPmMvZi7ZRmDMAoGCCqGSM49BAMCA0gAMEUCIQDd\nLAq00atY0zQJUtIEp8rS6y5OlFiiXLkCzpkGlu3dBwIgblucxpbEaueMRiK5eWIc\n64YOZffDYr3RWoc1Qrw6yHs=\n-----END CERTIFICATE-----\n',
  rootCertificate: '-----BEGIN CERTIFICATE-----\nMIICNzCCAd2gAwIBAgIQL+TRV62JPU53XvYTCU0ZWTAKBggqhkjOPQQDAjBtMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEWMBQGA1UEChMNb3JnMS5hY21lLmNvbTEZMBcGA1UEAxMQY2Eub3Jn\nMS5hY21lLmNvbTAeFw0xODA5MDcwNzQ3MDRaFw0yODA5MDQwNzQ3MDRaMG0xCzAJ\nBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJh\nbmNpc2NvMRYwFAYDVQQKEw1vcmcxLmFjbWUuY29tMRkwFwYDVQQDExBjYS5vcmcx\nLmFjbWUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAES1FRQP2vcFVWdaCO\nluDq/qdMhc/voMyqFsImhxqSBGhsGBkiGpDyXWwqmWZefSL/Q0Y1h5AZlEfgJkJL\nalJBa6NfMF0wDgYDVR0PAQH/BAQDAgGmMA8GA1UdJQQIMAYGBFUdJQAwDwYDVR0T\nAQH/BAUwAwEB/zApBgNVHQ4EIgQgosmy3mgQiBv0P1AlmrMSTbaNUHOdFjyg+Yy9\nmLtlGYMwCgYIKoZIzj0EAwIDSAAwRQIhAK6CKyEMOVkT022/EsK9NmjmwRsdxKP/\n6BfpDpbrz427AiA+e7A9XwLrAnx6dZegosZS0D2iC1haM7kjVPszVy3frQ==\n-----END CERTIFICATE-----\n' }or the event hub of each peer to tell us
    // that the channel has been created on each peer
    // TODO:
    // Would need a join channel on each peer. And StartBC would get shaded on all other peers if
    // one peer chooses to start the BC
  const allEventHubs = [];
  let errorMessage = null;
    let promises = [];
    let blockRegistrationNumbers = [];
    let event_hubs = client.getEventHubsForOrg(orgname);
    event_hubs.forEach((eh) => {
      let configBlockPromise = new Promise((resolve, reject) => {
        let event_timeout = setTimeout(() => {
          let message = 'REQUEST_TIMEOUT:' + eh._ep._endpoint.addr;
          logger.error(message);
          eh.disconnect();
          reject(new Error(message));
        }, 60000);
        let blockRegistrationNumber = eh.registerBlockEvent((block) => {
          clearTimeout(event_timeout);
          // a peer may have more than one channel so
          // we must check that this block came from the channel we
          // asked the peer to join
          if (block.data.data.length === 1) {
            // Config block must only contain one transaction
            const channelHeader = block.data.data[0].payload.header.channel_header;
            if (channelHeader.channel_id === channelName) {
              const message = util.format('EventHub % has reported a block update for channel %s', eh._ep._endpoint.addr, channelName);
              Constants.logger.info(message);
              resolve(message);
            } else {
              const message = util.format('Unknown channel block event received from %s', eh._ep._endpoint.addr);
              Constants.logger.info(message);
              reject(new Error(message));
            }
          } // if block data length
        }, (err) => {
          clearTimeout(event_timeout);
          const message = 'Problem setting up the event hub :' + err.toString();
          Constants.logger.info(message);
          reject(new Error(message));
        }); // if register block event over
        // save the registration handle so able to deregister
        blockRegistrationNumbers.push(blockRegistrationNumber);
        allEventHubs.push(eh); // save for later so that we can shut it down
      }); // new promise
      promises.push(configBlockPromise);
      eh.connect(); // this opens the event stream that must be shutdown at some point with a disconnect()
    }); // for each


    // Before adding the peers from different orgs initialize the peers from different orgs in the channel
    // we will take values from the connectionprofile.yaml
    // TODO: To extend it for all peers in an org
    const joinChannelRequest = {
      targets: [peername], // peers in an org, for our case it is only one peer
      block: genesisBlock,
      txId: client.newTransactionID(true)
    };
    // ERROR: (node:8787) UnhandledPromiseRejectionWarning: Error: Peer with name "peer0.org1.acme.com" not assigned to this channel
    // Use channelEventHub
    const proposalResponse = await channel.joinChannel(joinChannelRequest, 10000); // 10 secs
    promises.push(proposalResponse);
    const results = await Promise.all(promises);
    Constants.logger.info('****************** JOINCHANNEL:: CALLED ************************');
    Constants.logger.info(results);
    if ((proposalResponse[0].code === 2) && (proposalResponse[0].message === 'Cannot create ledger from genesis block, due to LedgerID already exists')) {
      Constants.logger.info('****************** JOINCHANNEL:: ALREADY JOINED ************************');
    }
    console.log(proposalResponse);
    Constants.logger.info('****************** JOINCHANNEL:: printed proposal response ************************');

    // lets check the results of sending to the peers which is
    // last in the results array
    const peersResults = results.pop();
    // then each peer results
    for (let i in peersResults) {
      let peerResult = peersResults[i];
      if (peerResult.response && peerResult.response.status == 200) {
        Constants.logger.info('Successfully joined peer to the channel %s', channelName);
      } else {
        let message = util.format('Failed to joined peer to the channel %s', channelName);
        errorMessage = message;
        Constants.logger.info(message);
      }
    } //for loop peerResults
    Constants.logger.info('for loop peer results over');
    // now see what each of the event hubs reported
    for (let i in results) {
      let eventHubResult = results[i];
      let eventHub = eventHubs[i];
      let blockRegistrationNumber = blockRegistrationNumbers[i];
      Constants.logger.info('Event results for event hub :%s', eventHub._ep._endpoint.addr);
      if (typeof eventHubResult === 'string') {
        Constants.logger.info(eventHubResult);
      } else {
        if (!errorMessage) errorMessage = eventHubResult.toString();
        Constants.logger.info(eventHubResult.toString());
      }
      eventHub.unregisterBlockEvent(blockRegistrationNumber);
      Constants.logger.info('for loop results over');
    } // for loop i in results
  } catch (error) {
    Constants.logger.info('catch over');
    Constants.logger.info('Failed to join channel due to error: ' + error.stack ? error.stack : error);
    errorMessage = error.toString();
    Constants.logger.info(errorMessage);
  } // catch

  // need to shutdown open event streams
  allEventHubs.forEach((eh) => {
    eh.disconnect();
  });
  Constants.logger.info('allEventHubs for each over');
  if (!errorMessage) {
    const message = util.format(
      'Successfully joined peers in organization %s to the channel:%s',
      orgname, channelName
    );
    Constants.logger.info(message);
    // build a response to send back to the REST caller
    const response = {
      success: true,
      message: message
    };
    return response;
  } 
    else {
    let message = util.format('Failed to join all peers to channel. cause:%s', error_message);
    logger.error(message);
    throw new Error(message);
  }
  
  Constants.logger.info('****************** JOINCHANNEL:: SUCCESS ************************');
  return client;
*/

/*
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
  */

/*
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
  */

/*
RESPONSE at the ledger till now
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] ca.Config: &{Version:1.3.0 Cfg:{Identities:{AllowRemove:false} Affiliations:{AllowRemove:false}} CA:{Name:ca-org1 Keyfile:/etc/hyperledger/fabric-ca-server-config/a2c9b2de6810881bf43f50259ab3124db68d50739d163ca0f98cbd98bb651983_sk Certfile:/etc/hyperledger/fabric-ca-server-config/ca.org1.acme.com-cert.pem Chainfile:/etc/hyperledger/fabric-ca-server/ca-chain.pem} Signing:0xc420182a70 CSR:{CN:ca.org1.acme.com Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[761e859e9e77 localhost] KeyRequest:0xc4201604c0 CA:0xc420160540 SerialNumber:} Registry:{MaxEnrollments:-1 Identities:[{ Name:**** Pass:**** Type:client Affiliation: MaxEnrollments:0 Attrs:map[hf.Registrar.Roles:* hf.Registrar.DelegateRoles:* hf.Revoker:1 hf.IntermediateCA:1 hf.GenCRL:1 hf.Registrar.Attributes:* hf.AffiliationMgr:1]  }]} Affiliations:map[org1:[department1 department2] org2:[department1]] LDAP:{ Enabled:false URL:ldap://****:****@<host>:<port>/<base> UserFilter:(uid=%s) GroupFilter:(memberUid=%s) Attribute:{[uid member] [{ }] map[groups:[{ }]]} TLS:{false [] { }}  } DB:{ Type:sqlite3 Datasource:/etc/hyperledger/fabric-ca-server/fabric-ca-server.db TLS:{false [] { }}  } CSP:0xc420469c80 Client:<nil> Intermediate:{ParentServer:{ URL: CAName:  } TLS:{Enabled:false CertFiles:[] Client:{KeyFile: CertFile:}} Enrollment:{ Name: Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:<nil> Type:x509  }} CRL:{Expiry:24h0m0s} Idemix:{IssuerPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerPublicKey IssuerSecretKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerSecretKey RevocationPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerRevocationPublicKey RevocationPrivateKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerRevocationPrivateKey RHPoolSize:1000 NonceExpiration:15s NonceSweepInterval:15m}}
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] DB: Login user admin with max enrollments of -1 and state of 0
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] DB: identity admin successfully logged in
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Processing sign request: id=admin, CommonName=admin, Subject=<nil>
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Request is not for a CA signing certificate
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Checking CSR fields to make sure that they do not exceed maximum character limits
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Finished processing sign request
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Attribute extension being added to certificate is: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Adding attribute extension to CSR: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:34:23 [INFO] signed certificate with serial number 639175166269639644107397196128961460288194136412
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] DB: Insert Certificate
 ca_peerOrg1            | 2018/10/21 13:34:23 [DEBUG] Saved serial number as hex 6ff59b10d6f2ee525627df0b104acc6288f4c95c
 ca_peerOrg1            | 2018/10/21 13:34:24 [DEBUG] saved certificate with serial number 639175166269639644107397196128961460288194136412
 ca_peerOrg1            | 2018/10/21 13:34:24 [DEBUG] Successfully incremented state for identity admin to 1
 ca_peerOrg1            | 2018/10/21 13:34:24 [INFO] 172.19.0.1:34558 POST /api/v1/enroll 201 0 "OK"
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Received request for /api/v1/enroll
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] ca.Config: &{Version:1.3.0 Cfg:{Identities:{AllowRemove:false} Affiliations:{AllowRemove:false}} CA:{Name:ca-org1 Keyfile:/etc/hyperledger/fabric-ca-server-config/a2c9b2de6810881bf43f50259ab3124db68d50739d163ca0f98cbd98bb651983_sk Certfile:/etc/hyperledger/fabric-ca-server-config/ca.org1.acme.com-cert.pem Chainfile:/etc/hyperledger/fabric-ca-server/ca-chain.pem} Signing:0xc420182a70 CSR:{CN:ca.org1.acme.com Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[761e859e9e77 localhost] KeyRequest:0xc4201604c0 CA:0xc420160540 SerialNumber:} Registry:{MaxEnrollments:-1 Identities:[{ Name:**** Pass:**** Type:client Affiliation: MaxEnrollments:0 Attrs:map[hf.Registrar.Attributes:* hf.AffiliationMgr:1 hf.Registrar.Roles:* hf.Registrar.DelegateRoles:* hf.Revoker:1 hf.IntermediateCA:1 hf.GenCRL:1]  }]} Affiliations:map[org1:[department1 department2] org2:[department1]] LDAP:{ Enabled:false URL:ldap://****:****@<host>:<port>/<base> UserFilter:(uid=%s) GroupFilter:(memberUid=%s) Attribute:{[uid member] [{ }] map[groups:[{ }]]} TLS:{false [] { }}  } DB:{ Type:sqlite3 Datasource:/etc/hyperledger/fabric-ca-server/fabric-ca-server.db TLS:{false [] { }}  } CSP:0xc420469c80 Client:<nil> Intermediate:{ParentServer:{ URL: CAName:  } TLS:{Enabled:false CertFiles:[] Client:{KeyFile: CertFile:}} Enrollment:{ Name: Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:<nil> Type:x509  }} CRL:{Expiry:24h0m0s} Idemix:{IssuerPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerPublicKey IssuerSecretKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerSecretKey RevocationPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerRevocationPublicKey RevocationPrivateKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerRevocationPrivateKey RHPoolSize:1000 NonceExpiration:15s NonceSweepInterval:15m}}
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] DB: Login user admin with max enrollments of -1 and state of 1
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] DB: identity admin successfully logged in
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Processing sign request: id=admin, CommonName=admin, Subject=<nil>
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Request is not for a CA signing certificate
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Checking CSR fields to make sure that they do not exceed maximum character limits
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Finished processing sign request
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Attribute extension being added to certificate is: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Adding attribute extension to CSR: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:38:36 [INFO] signed certificate with serial number 584447990567162144443277794142598426453856199515
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] DB: Insert Certificate
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] Saved serial number as hex 665f8de62720a221c9cf9b0945ff5b187103a35b
 ca_peerOrg1            | 2018/10/21 13:38:36 [DEBUG] saved certificate with serial number 584447990567162144443277794142598426453856199515
 ca_peerOrg1            | 2018/10/21 13:38:37 [DEBUG] Successfully incremented state for identity admin to 2
 ca_peerOrg1            | 2018/10/21 13:38:37 [INFO] 172.19.0.1:34600 POST /api/v1/enroll 201 0 "OK"
 ca_peerOrg1            | 2018/10/21 13:39:09 [DEBUG] Cleaning up expired nonces for CA 'ca-org1'
 ca_peerOrg3            | 2018/10/21 13:39:10 [DEBUG] Cleaning up expired nonces for CA 'ca-org3'
 ca_peerOrg2            | 2018/10/21 13:39:10 [DEBUG] Cleaning up expired nonces for CA 'ca-org2'
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Received request for /api/v1/enroll
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] ca.Config: &{Version:1.3.0 Cfg:{Identities:{AllowRemove:false} Affiliations:{AllowRemove:false}} CA:{Name:ca-org1 Keyfile:/etc/hyperledger/fabric-ca-server-config/a2c9b2de6810881bf43f50259ab3124db68d50739d163ca0f98cbd98bb651983_sk Certfile:/etc/hyperledger/fabric-ca-server-config/ca.org1.acme.com-cert.pem Chainfile:/etc/hyperledger/fabric-ca-server/ca-chain.pem} Signing:0xc420182a70 CSR:{CN:ca.org1.acme.com Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[761e859e9e77 localhost] KeyRequest:0xc4201604c0 CA:0xc420160540 SerialNumber:} Registry:{MaxEnrollments:-1 Identities:[{ Name:**** Pass:**** Type:client Affiliation: MaxEnrollments:0 Attrs:map[hf.Registrar.Roles:* hf.Registrar.DelegateRoles:* hf.Revoker:1 hf.IntermediateCA:1 hf.GenCRL:1 hf.Registrar.Attributes:* hf.AffiliationMgr:1]  }]} Affiliations:map[org1:[department1 department2] org2:[department1]] LDAP:{ Enabled:false URL:ldap://****:****@<host>:<port>/<base> UserFilter:(uid=%s) GroupFilter:(memberUid=%s) Attribute:{[uid member] [{ }] map[groups:[{ }]]} TLS:{false [] { }}  } DB:{ Type:sqlite3 Datasource:/etc/hyperledger/fabric-ca-server/fabric-ca-server.db TLS:{false [] { }}  } CSP:0xc420469c80 Client:<nil> Intermediate:{ParentServer:{ URL: CAName:  } TLS:{Enabled:false CertFiles:[] Client:{KeyFile: CertFile:}} Enrollment:{ Name: Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:<nil> Type:x509  }} CRL:{Expiry:24h0m0s} Idemix:{IssuerPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerPublicKey IssuerSecretKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerSecretKey RevocationPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerRevocationPublicKey RevocationPrivateKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerRevocationPrivateKey RHPoolSize:1000 NonceExpiration:15s NonceSweepInterval:15m}}
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] DB: Login user admin with max enrollments of -1 and state of 2
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] DB: identity admin successfully logged in
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Processing sign request: id=admin, CommonName=admin, Subject=<nil>
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Request is not for a CA signing certificate
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Checking CSR fields to make sure that they do not exceed maximum character limits
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Finished processing sign request
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Attribute extension being added to certificate is: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Adding attribute extension to CSR: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:43:18 [INFO] signed certificate with serial number 579078940875517441145496341340016171229436866444
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] DB: Insert Certificate
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Saved serial number as hex 656ecc3b32c47972a047004caf469723361a6f8c
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] saved certificate with serial number 579078940875517441145496341340016171229436866444
 ca_peerOrg1            | 2018/10/21 13:43:18 [DEBUG] Successfully incremented state for identity admin to 3
 ca_peerOrg1            | 2018/10/21 13:43:18 [INFO] 172.19.0.1:34646 POST /api/v1/enroll 201 0 "OK"
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Received request for /api/v1/enroll
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] ca.Config: &{Version:1.3.0 Cfg:{Identities:{AllowRemove:false} Affiliations:{AllowRemove:false}} CA:{Name:ca-org1 Keyfile:/etc/hyperledger/fabric-ca-server-config/a2c9b2de6810881bf43f50259ab3124db68d50739d163ca0f98cbd98bb651983_sk Certfile:/etc/hyperledger/fabric-ca-server-config/ca.org1.acme.com-cert.pem Chainfile:/etc/hyperledger/fabric-ca-server/ca-chain.pem} Signing:0xc420182a70 CSR:{CN:ca.org1.acme.com Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[761e859e9e77 localhost] KeyRequest:0xc4201604c0 CA:0xc420160540 SerialNumber:} Registry:{MaxEnrollments:-1 Identities:[{ Name:**** Pass:**** Type:client Affiliation: MaxEnrollments:0 Attrs:map[hf.GenCRL:1 hf.Registrar.Attributes:* hf.AffiliationMgr:1 hf.Registrar.Roles:* hf.Registrar.DelegateRoles:* hf.Revoker:1 hf.IntermediateCA:1]  }]} Affiliations:map[org1:[department1 department2] org2:[department1]] LDAP:{ Enabled:false URL:ldap://****:****@<host>:<port>/<base> UserFilter:(uid=%s) GroupFilter:(memberUid=%s) Attribute:{[uid member] [{ }] map[groups:[{ }]]} TLS:{false [] { }}  } DB:{ Type:sqlite3 Datasource:/etc/hyperledger/fabric-ca-server/fabric-ca-server.db TLS:{false [] { }}  } CSP:0xc420469c80 Client:<nil> Intermediate:{ParentServer:{ URL: CAName:  } TLS:{Enabled:false CertFiles:[] Client:{KeyFile: CertFile:}} Enrollment:{ Name: Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:<nil> Type:x509  }} CRL:{Expiry:24h0m0s} Idemix:{IssuerPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerPublicKey IssuerSecretKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerSecretKey RevocationPublicKeyfile:/etc/hyperledger/fabric-ca-server/IssuerRevocationPublicKey RevocationPrivateKeyfile:/etc/hyperledger/fabric-ca-server/msp/keystore/IssuerRevocationPrivateKey RHPoolSize:1000 NonceExpiration:15s NonceSweepInterval:15m}}
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] DB: Login user admin with max enrollments of -1 and state of 3
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] DB: identity admin successfully logged in
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Processing sign request: id=admin, CommonName=admin, Subject=<nil>
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Request is not for a CA signing certificate
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Checking CSR fields to make sure that they do not exceed maximum character limits
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Finished processing sign request
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] DB: Getting identity admin
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Attribute extension being added to certificate is: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Adding attribute extension to CSR: &{ID:[1 2 3 4 5 6 7 8 1] Critical:false Value:7b226174747273223a7b2268662e5265676973747261722e41747472696275746573223a222a222c2268662e5265676973747261722e526f6c6573223a222a227d7d}
 ca_peerOrg1            | 2018/10/21 13:44:25 [INFO] signed certificate with serial number 337712626132840733037516515881823044175789504446
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] DB: Insert Certificate
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Saved serial number as hex 3b278ed28d20eec18c77c625371331326b6737be
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] saved certificate with serial number 337712626132840733037516515881823044175789504446
 ca_peerOrg1            | 2018/10/21 13:44:25 [DEBUG] Successfully incremented state for identity admin to 4
 ca_peerOrg1            | 2018/10/21 13:44:25 [INFO] 172.19.0.1:34682 POST /api/v1/enroll 201 0 "OK"
*/ 

/*
enrollment response
{ key:
   ECDSA_KEY {
     _key:
      { type: 'EC',
        isPrivate: true,
        isPublic: false,
        getBigRandom: [Function],
        setNamedCurve: [Function],
        setPrivateKeyHex: [Function],
        setPublicKeyHex: [Function],
        getPublicKeyXYHex: [Function],
        getShortNISTPCurveName: [Function],
        generateKeyPairHex: [Function],
        signWithMessageHash: [Function],
        signHex: [Function],
        sign: [Function],
        verifyWithMessageHash: [Function],
        verifyHex: [Function],
        verify: [Function],
        verifyRaw: [Function],
        serializeSig: [Function],
        parseSig: [Function],
        parseSigCompact: [Function],
        readPKCS5PrvKeyHex: [Function],
        readPKCS8PrvKeyHex: [Function],
        readPKCS8PubKeyHex: [Function],
        readCertPubKeyHex: [Function],
        curveName: 'secp256r1',
        ecparams: [Object],
        prvKeyHex: 'dbcae5e001c14599f151dedeadfbf6f60b419bab4052f56cb1c96c51a3c0e047',
        pubKeyHex: '041a41c2f2e89b18c1364b447c8979cffcffc71bbafdd3a489aa800e9751f8fec33fbc7b206694ac4dce1a166c4fcfc9fc4f9cc02a134ff7191cc1d8102b6abad4' } },
  certificate: '-----BEGIN CERTIFICATE-----\nMIICHTCCAcOgAwIBAgIUGQUN+4M9TlLQAsGZERzO2d7+mfYwCgYIKoZIzj0EAwIw\nbTELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xFjAUBgNVBAoTDW9yZzEuYWNtZS5jb20xGTAXBgNVBAMTEGNh\nLm9yZzEuYWNtZS5jb20wHhcNMTgxMDIxMTU0ODAwWhcNMTkxMDIxMTU1MzAwWjAh\nMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZIzj0CAQYI\nKoZIzj0DAQcDQgAEGkHC8uibGME2S0R8iXnP/P/HG7r906SJqoAOl1H4/sM/vHsg\nZpSsTc4aFmxPz8n8T5zAKhNP9xkcwdgQK2q61KOBjDCBiTAOBgNVHQ8BAf8EBAMC\nA6gwHQYDVR0lBBYwFAYIKwYBBQUHAwEGCCsGAQUFBwMCMAwGA1UdEwEB/wQCMAAw\nHQYDVR0OBBYEFE+07h5AYtkgVHtNXBixeJGnEDymMCsGA1UdIwQkMCKAIKLJst5o\nEIgb9D9QJZqzEk22jVBznRY8oPmMvZi7ZRmDMAoGCCqGSM49BAMCA0gAMEUCIQDd\nLAq00atY0zQJUtIEp8rS6y5OlFiiXLkCzpkGlu3dBwIgblucxpbEaueMRiK5eWIc\n64YOZffDYr3RWoc1Qrw6yHs=\n-----END CERTIFICATE-----\n',
  rootCertificate: '-----BEGIN CERTIFICATE-----\nMIICNzCCAd2gAwIBAgIQL+TRV62JPU53XvYTCU0ZWTAKBggqhkjOPQQDAjBtMQsw\nCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMNU2FuIEZy\nYW5jaXNjbzEWMBQGA1UEChMNb3JnMS5hY21lLmNvbTEZMBcGA1UEAxMQY2Eub3Jn\nMS5hY21lLmNvbTAeFw0xODA5MDcwNzQ3MDRaFw0yODA5MDQwNzQ3MDRaMG0xCzAJ\nBgNVBAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRYwFAYDVQQHEw1TYW4gRnJh\nbmNpc2NvMRYwFAYDVQQKEw1vcmcxLmFjbWUuY29tMRkwFwYDVQQDExBjYS5vcmcx\nLmFjbWUuY29tMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAES1FRQP2vcFVWdaCO\nluDq/qdMhc/voMyqFsImhxqSBGhsGBkiGpDyXWwqmWZefSL/Q0Y1h5AZlEfgJkJL\nalJBa6NfMF0wDgYDVR0PAQH/BAQDAgGmMA8GA1UdJQQIMAYGBFUdJQAwDwYDVR0T\nAQH/BAUwAwEB/zApBgNVHQ4EIgQgosmy3mgQiBv0P1AlmrMSTbaNUHOdFjyg+Yy9\nmLtlGYMwCgYIKoZIzj0EAwIDSAAwRQIhAK6CKyEMOVkT022/EsK9NmjmwRsdxKP/\n6BfpDpbrz427AiA+e7A9XwLrAnx6dZegosZS0D2iC1haM7kjVPszVy3frQ==\n-----END CERTIFICATE-----\n' }
  */