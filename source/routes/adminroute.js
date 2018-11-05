// const emptyPromise = require('empty-promise')
const express = require('express');
const chalk = require('chalk');
const debug = require('debug');
// const path = require('path');
// const fs = require('fs');

const hfc = require('fabric-client');

// nodemon internal watch failed error
// echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
// https://stackoverflow.com/questions/34662574/node-js-getting-error-nodemon-internal-watch-failed-watch-enospc

const adminRouter = express.Router();

// body parser to know what you clicked
// npm install body-parser
const bodyparser = require('body-parser');

debug(chalk.yellow('entered the admin page'));
// npm i -S fabric-client to get it installed in package.json
const Client = require('fabric-client');

// const logger = Client.getLogger('APPLICATION');
// let fabriCAClient = require('fabric-ca-client');

const Constants = require('../constants.js');
const ClientUtils = require('../helper.js');

// to get the ip address of a docker container
// docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name_or_id
// channel is created by the orderer initially
// each peer will join the channel by sending channel configuration to each of the peer nodes
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
  // return the const express.Router()
  return adminRouter;
}

async function buttonClickLogic() {
  Constants.logger.info('****************** INSIDE BUTTON CLICK ************************');
  Constants.logger.info('****************** Register and enroll user ************************');
  let asyncfunction = null;
  asyncfunction = async () => {
    const username = ClientUtils.getUserName();
    let orgname = Constants.ORG1;

    Constants.logger.info('****************************ORG1****************************');
    const responseOrg1 = await ClientUtils.getRegisteredUser(orgname, username);
    Constants.logger.info(responseOrg1);
    Constants.logger.info('****************** returned from registering the username %s for organization %s ************************', username, orgname);
    if (responseOrg1 && typeof responseOrg1 !== 'string') {
      Constants.logger.info('Successfully registered the username %s for organization %s', username, orgname);
    } else {
      Constants.logger.info('Failed to register the username %s for organization %s', username, orgname);
    }
    
    Constants.logger.info('****************************ORG2****************************');
    orgname = Constants.ORG2;
    const responseOrg2 = await ClientUtils.getRegisteredUser(orgname, username);
    Constants.logger.info(responseOrg1);
    Constants.logger.info('****************** returned from registering the username %s for organization %s ************************', username, orgname);
    if (responseOrg2 && typeof responseOrg2 !== 'string') {
      Constants.logger.info('Successfully registered the username %s for organization %s', username, orgname);
    } else {
      Constants.logger.info('Failed to register the username %s for organization %s', username, orgname);
    }

    Constants.logger.info('****************************ORG3****************************');
    orgname = Constants.ORG3;
    const responseOrg3 = await ClientUtils.getRegisteredUser(orgname, username);
    Constants.logger.info(responseOrg3);
    Constants.logger.info('****************** returned from registering the username %s for organization %s ************************', username, orgname);
    if (responseOrg3 && typeof responseOrg3 !== 'string') {
      Constants.logger.info('Successfully registered the username %s for organization %s', username, orgname);
    } else {
      Constants.logger.info('Failed to register the username %s for organization %s', username, orgname);
    }

    Constants.logger.info('****************************Create Channel for ORG1****************************');
    await ClientUtils.createChannelForOrg(ClientUtils.getChannelNameFromConfig(), ClientUtils.getUserName(), Constants.ORG1);
    Constants.logger.info('****************************JOIN Channel for ORG1****************************');
    await ClientUtils.joinChannel([Constants.peer0org1], ClientUtils.getUserName(), Constants.ORG1);

    Constants.logger.info('****************************JOIN Channel for ORG2****************************');
    await ClientUtils.joinChannel([Constants.peer0org2], ClientUtils.getUserName(), Constants.ORG2);

    Constants.logger.info('****************************JOIN Channel for ORG3****************************');
    await ClientUtils.joinChannel([Constants.peer0org3], ClientUtils.getUserName(), Constants.ORG3);
    // only admin can install
    Constants.logger.info('****************************INSTALL Chaincode for ORG1****************************');
    // ERROR: From the command line in chaincode instantiate
    // 2018-11-01 00:55:26.996 UTC [msp/identity] Sign -> DEBU 007 Sign: digest: 3625FB52498CC0127AC620A0C7CDCBD0ED46DC465783991351E9EB4A39748872 
    // Error: Error endorsing chaincode: rpc error: code = Unknown desc = error starting container: Failed to generate platform-specific docker build: Error returned from build: 1 "can't load package: package ../..: no Go files in /

    // NOTE: chanincode name . version is concatenated if 1.0 mycc.1.0, if v0 mycc.v0

    // error says no go files found the path mapped in the peer docker yaml should be provided here
    // while instantiating from the command line it takes ../../ - and says no GO files found there
    // error: [packager/Golang.js]: error while packaging /home/hypledvm/go/src/utilitypoc/network/chaincode/src/opt/go/src/github.com/src

    // info: [APPLICATION]: Calling peers in organization "Org1" to join the channel
    // error: [packager/Golang.js]: error while packaging /home/hypledvm/go/src/utilitypoc/chaincode/src/src
    // info: [APPLICATION]: Failed to install due to error: Error: ENOENT: no such file or directory, lstat '/home/hypledvm/go/src/utilitypoc/chaincode/src/src'

    // info: [APPLICATION]: Failed to install due to error: Error: Missing chaincodePath parameter
    // ERROR: Earlier path
    // "CC_SRC_PATH":"../../../../../",
    // ./utilitypoc/chaincode/src/


    // ERROR: Thankfully some change from the previous status
    // Till chaincode dir is set as the GOPATH
    // By default takes a src underneath and then github.com/utility_workflow dir within that and then
    // the name of the chaincode
    // now the container gets created - dev-peer0.org1.acme.com-utility_workflow-v0 but could not start the chaincode

    // https://hyperledger-fabric.readthedocs.io/en/release-1.1/chaincode4ade.html build and start chaincode
    // TODO: make this into a link - configurable


    // TO remove grpc 1.15.1 - remove the grpc dependency from package.json , remove all ^, > etc
    // keep it exact
    // rm -rf node_modules/grpc and npm rebuild
    // DRWebapp@1.0.0 /home/hypledvm/go/src/utilitypoc/network/acmedevmode
    // +-- fabric-client@1.2.2
    // | `-- grpc@1.10.1 
    // `-- UNMET DEPENDENCY grpc@1.10.1
    // no mention of grpc in package.json
    // npm install grpc@1.10.1 to remove the unmet dependency - 1.15.1 at the top level is gone now
    await ClientUtils.installChaincode([Constants.peer0org1], 'utility_workflow_v21', 'github.com/utility_workflow', 'v0', 'go', ClientUtils.getUserName(), Constants.ORG1);

    Constants.logger.info('****************************INSTALL Chaincode for ORG2****************************');
    await ClientUtils.installChaincode([Constants.peer0org2], 'utility_workflow_v21', 'github.com/utility_workflow', 'v0', 'go', ClientUtils.getUserName(), Constants.ORG2);

    Constants.logger.info('****************************INSTALL Chaincode for ORG3****************************');
    await ClientUtils.installChaincode([Constants.peer0org3], 'utility_workflow_v21', 'github.com/utility_workflow', 'v0', 'go', ClientUtils.getUserName(), Constants.ORG3);

    // Instantiate chaincode on one of the peeers in org1
    // Error: peer0.org1.acme.com    | 2018-10-31 18:28:38.291 UTC [lscc] executeDeployOrUpgrade -> ERRO 35fe cannot get package for chaincode (utility_workflow:v0)-err:open /var/hyperledger/production/chaincodes/utility_workflow.v0: no such file or directory
    // Constants.logger.info('****************************INSTANTIATE Chaincode for ORG1****************************');
    // ERROR: To change for query and move - instantiate with parameters and the chaincode has put state code
    // npm rebuild --target=8.1.0 --target_platform=linux --target_arch=x64 --target_libc=glibc --update-binary
    // cp utility_workflow.go ~/go/src/utilitypoc/chaincode/src/github.com/utility_workflow - the code needs to be here
    // This is the correct code location
    // TODO: why does it take it from this path?????????????????????
    // got to know from grep -rnw of the chaincode
    // ERROR: when only constant.peer0Org1 is sent
    // info: [APPLICATION]: found 0 eventhubs for this organization Org1
    // error: [Channel.js]: sendTransaction - no valid endorsements found
    // info: [APPLICATION]: Error: no valid endorsements found
    await ClientUtils.instantiateChaincode([Constants.peer0org1, Constants.peer0org2, Constants.peer0org3], 'mychannel', 'utility_workflow_v21', 'v0', 'init', 'golang', ['a', '100', 'b', '200'], ClientUtils.getUserName(), Constants.ORG1);

    // ERROR: everything is working but the correct code is not getting called. checked in docker-compose-base.yaml
    // Cannot start the ledger again since the API version problem comes and the channel cannot get created 
    // again.  ../../../../github.com:/opt/go/src/github.com/ . Copy the latest files to src/ under this path.
    // this will make the chaincode container build using the latest code
  }; // async fuexportsnction end
  // ERROR: to mexportsake the function call, had to call the clientpromise()
  const clientpromise = asyncfunction();
  Constants.logger.info('****************** Post calling the async function in admin route ************************');
  Constants.logger.info(clientpromise);
  Constants.logger.info('****************** Post printing the async function promise ************************');
}
// whatever it is use root here for route('/')
// form(method='POST') - not giving an action here goes to the same page
// the router here is home in adminRouter.route
// if you give adminRouter.route('/admin') or anything else you get - cannot POST /admin error
// TODO: Is the CA section required? In the config

adminRouter.route('/').post((req, res) => {
  // res.setHeader('content-type', 'text/plain');
  // res.end(`you have selected: ${req.body.values}`);
  debug(chalk.green('inside button click'));
  buttonClickLogic();
  res.redirect('/transact');
});

// export the name of the function
module.exports = adminrouter;


// ERROR:
// channel is not yet created
// peer0.org1.acme.com    | 2018-11-01 02:07:09.178 UTC [protoutils] ValidateProposalMessage -> WARN d0f channel [mychannel]: MSP error: channel doesn't exist
// peer0.org1.acme.com    | 2018-11-01 02:07:09.201 UTC [endorser] ProcessProposal -> DEBU d10 Exit: request from%!(EXTRA string=172.21.0.1:43734)
// peer0.org1.acme.com    | 2018-11-01 02:11:39.024 UTC [endorser] ProcessProposal -> DEBU d11 Entering: Got request from 172.21.0.6:58492
// peer0.org1.acme.com    | 2018-11-01 02:11:39.035 UTC [protoutils] ValidateProposalMessage -> DEBU d12 ValidateProposalMessage starts for signed proposal 0xc4218b52c0
// peer0.org1.acme.com    | 2018-11-01 02:11:39.036 UTC [protoutils] validateChannelHeader -> DEBU d13 validateChannelHeader info: header type 3
// peer0.org1.acme.com    | 2018-11-01 02:11:39.036 UTC [protoutils] checkSignatureFromCreator -> DEBU d14 begin
// peer0.org1.acme.com    | 2018-11-01 02:11:39.043 UTC [protoutils] ValidateProposalMessage -> WARN d15 channel [mychannel]: MSP error: channel doesn't exist


// ERRORS from running instantiate from peer and CLI
// From peer Error: Error getting broadcast client: failed to load config for OrdererClient: unable to load orderer.tls.rootcert.file: open /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/acme.com/orderers/orderer.acme.com/msp/tlscacerts/tlsca.acme.com-cert.pem: no such file or directory
// from CLI: Error: Error endorsing chaincode: rpc error: code = Unknown desc = access denied: channel [mychannel] creator org [Org1MSP]


// chaincodePath	string	Required. The path to the location of the source code of the chaincode. If the chaincode type is golang, then this path is the fully qualified package name, such as 'mycompany.com/myproject/mypackage/mychaincode'
// https://blog.golang.org/package-names
// Build tools map package paths onto directories. The go tool uses the GOPATH environment variable to find the source files for path "github.com/user/hello" in directory $GOPATH/src/github.com/user/hello. (This situation should be familiar, of course, but it's important to be clear about the terminology and structure of packages.)
// https://github.com/christo4ferris/node_sdk/blob/master/node-sdk-indepth.md

/* instantiate works and the container gets created
info: [APPLICATION]: ------->>> R E S P O N S E : [{"status":"SUCCESS","info":""}]
info: [APPLICATION]: ------->>> R E S P O N S E : [{"status":"SUCCESS","info":""}]
info: [APPLICATION]: Successfully sent transaction to the orderer.
info: [APPLICATION]: Successfully sent transaction to the orderer.
info: [APPLICATION]: Successfully instantiate chaingcode in organization Org1 to the channel 'mychannel'
info: [APPLICATION]: Successfully instantiate chaingcode in organization Org1 to the channel 'mychannel'
debug: [Orderer.js]: sendBroadcast - on end:
*/