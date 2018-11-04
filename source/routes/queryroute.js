const express = require('express');
const chalk = require('chalk');
const debug = require('debug');

// const hfc = require('fabric-client');
const Constants = require('../constants.js');
const ClientUtils = require('../helper.js');

const queryRouter = express.Router();
// TODO: take arguments from the GUI
// peer chaincode query -C mychannel -n mycc -c '{"Args":["query","a"]}'
async function buttonClickQueryLogic() {
  Constants.logger.info('****************** INSIDE QUERY CLICK ************************');
  try {
    // first setup the client for this org
    const username = ClientUtils.getUserName();
    const orgname = Constants.ORG1;

    Constants.logger.info('****************************get client for org****************************');
    const client = await ClientUtils.getClientForOrg(orgname, username);
    Constants.logger.info(client);
    Constants.logger.info('****************** returned from registering the username %s for organization %s ************************', username, orgname);
    // Remove parameter - get default in config
    const channel = client.getChannel();
    if (!channel) {
      Constants.logger.info('****************************ERROR: Channel was not there in the config file****************************');
      throw new Error('ERROR: Channel was not created');
    }

    // send query
    // // peer chaincode invoke -n mycc5 -c '{"Args":["query", "a"]}' -C myc
    // TODO: this should be taken from what is installed and what the user wants to query
    const request = {
      targets: [Constants.peer0org1], // queryByChaincode allows for multiple targets
      chaincodeId: 'utility_workflow_v3',
      fcn: 'query',
      args: ['a']
    };
    const responsePayloads = await channel.queryByChaincode(request);
    if (responsePayloads) {
      for (let i = 0; i < responsePayloads.length; i++) {
        Constants.logger.info('a' + ' now has ' + responsePayloads[i].toString('utf8') + ' after the move');
      }
      return 'a' + ' now has ' + responsePayloads[0].toString('utf8') + ' after the move';
    }
  } catch (error) {
    Constants.logger.info('Failed to query due to error: ' + error.stack ? error.stack : error);
    return error.toString();
  }
  Constants.logger.info('response_payloads is null');
  return 'response_payloads is null';
}

debug(chalk.yellow('entered the transact page'));
// convert the whole js file into a function so that we can export the module and say
// app.use
// render the transact.pub jade file
function queryrouter(navigate) {
  queryRouter.route('/').get((req, res) => {
    // debug(chalk.yellow('rendering the transact page'));
    debug(chalk.blue(navigate));
    res.render('query',
      {
        // the navigate variable passed from the main file
        navigate,
        title: 'Query your transactions here'
      });
  });
  // return the const express.Router()
  return queryRouter;
}
// export the name of the function
// module.exports = transrouter;

queryRouter.route('/').post((req, res) => {
  // res.setHeader('content-type', 'text/plain');
  // res.end(`you have selected: ${req.body.values}`);
  debug(chalk.green('inside button click'));

  buttonClickQueryLogic();
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('query');
  res.end();
  // res.redirect('/transact');
});
// export the name of the function
module.exports = queryrouter;
