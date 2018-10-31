// const emptyPromise = require('empty-promise')
const express = require('express');
const chalk = require('chalk');
const debug = require('debug');
// const path = require('path');
// const fs = require('fs');

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
    await ClientUtils.installChaincode([Constants.peer0org1], 'utility_workflow', '../../', 'v0', 'go', ClientUtils.getUserName(), Constants.ORG1);

    Constants.logger.info('****************************INSTALL Chaincode for ORG2****************************');
    await ClientUtils.installChaincode([Constants.peer0org2], 'utility_workflow', '../../', 'v0', 'go', ClientUtils.getUserName(), Constants.ORG2);

    Constants.logger.info('****************************INSTALL Chaincode for ORG3****************************');
    await ClientUtils.installChaincode([Constants.peer0org3], 'utility_workflow', '../../', 'v0', 'go', ClientUtils.getUserName(), Constants.ORG3);

    // Instantiate chaincode on one of the peeers in org1
    // Error: peer0.org1.acme.com    | 2018-10-31 18:28:38.291 UTC [lscc] executeDeployOrUpgrade -> ERRO 35fe cannot get package for chaincode (utility_workflow:v0)-err:open /var/hyperledger/production/chaincodes/utility_workflow.v0: no such file or directory
    // Constants.logger.info('****************************INSTANTIATE Chaincode for ORG1****************************');
    await ClientUtils.instantiateChaincode([Constants.peer0org1], 'mychannel', 'utility_workflow', 'v0', 'init', 'go', '[]', ClientUtils.getUserName(), Constants.ORG1);
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
