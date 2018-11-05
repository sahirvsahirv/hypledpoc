const express = require('express');
const chalk = require('chalk');
const debug = require('debug');
const util = require('util');

const hfc = require('fabric-client');
const Constants = require('../constants.js');
const ClientUtils = require('../helper.js');

const transactRouter = express.Router();

// peer chaincode invoke -n utility_workflow_v15 -c '{"Args":["move", "a", "b", "2"]}' -C mychannel
// TODO: try 2 buttons on a single page - did not work
async function buttonClickTransactLogic() {
  Constants.logger.info('****************** INSIDE TRANSACT CLICK ************************');
  let errorMessage = null;
  let txIdString = null;
  // TODO: Redirect to query page 
  try {
    // first setup the client for this org
    const username = ClientUtils.getUserName();
    const orgname = Constants.ORG1;

    Constants.logger.info('****************************get client for org****************************');
    const client = await ClientUtils.getClientForOrg(orgname, username);
    Constants.logger.info(client);
    Constants.logger.info('****************** returned from registering the username %s for organization %s ************************', username, orgname);

    const channel = client.getChannel();
    if (!channel) {
      Constants.logger.info('****************************ERROR: Channel was not there in the config file****************************');
      throw new Error('ERROR: Channel was not created');
    }
    const txId = client.newTransactionID();
    // will need the transaction ID string for the event registration later
    txIdString = txId.getTransactionID();

    // TODO: take it from the GUI
    // send proposal to endorser
    const request = {
      targets: [Constants.peer0org1],
      chaincodeId: 'utility_workflow_v21',
      fcn: 'move', // ERROR: to make move happen in the chaincode
      args: ['a', 'b', '20'], // ERROR: to make move happen in the chaincode
      chainId: 'mychannel',
      txId: txId
    };

    const results = await channel.sendTransactionProposal(request);

    // the returned object has both the endorsement results
    // and the actual proposal, the proposal will be needed
    // later when we send a transaction to the orderer
    const proposalResponses = results[0];
    const proposal = results[1];

    // lets have a look at the responses to see if they are
    // all good, if good they will also include signatures
    // required to be committed
    let allGood = true;
    for (let i in proposalResponses) {
      let oneGood = false;
      if (proposalResponses && proposalResponses[i].response &&
        proposalResponses[i].response.status === 200) {
        oneGood = true;
        Constants.logger.info('****************************INVOKE SUCCESS****************************');
      } else {
        Constants.logger.info('****************************INVOKE ERROR****************************');
      }
      allGood = allGood & oneGood;
    }

    if (allGood) {
      Constants.logger.info(util.format(
        'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
        proposalResponses[0].response.status, proposalResponses[0].response.message,
        proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature
      ));

      // wait for the channel-based event hub to tell us
      // that the commit was good or bad on each peer in our organization
      let promises = [];
      let eventHubs = channel.getChannelEventHubsForOrg();
      eventHubs.forEach((eh) => {
        Constants.logger.debug('invokeEventPromise - setting up event');
        let invokeEventPromise = new Promise((resolve, reject) => {
          let eventTimeout = setTimeout(() => {
            let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
            Constants.logger.info(message);
            eh.disconnect();
          }, 3000);
          eh.registerTxEvent(txIdString, (tx, code, blockNum) => {
            Constants.logger.info('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
            Constants.logger.info('Transaction %s has status of %s in blocl %s', tx, code, blockNum);
            clearTimeout(eventTimeout);

            if (code !== 'VALID') {
              let message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
              Constants.logger.info(message);
              reject(new Error(message));
            } else {
              let message = 'The invoke chaincode transaction was valid.';
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
        promises.push(invokeEventPromise);
      });

      let ordererRequest = {
        txId: txId,
        proposalResponses: proposalResponses,
        proposal: proposal
      };
      let sendPromise = channel.sendTransaction(ordererRequest);
      // put the send to the orderer last so that the events get registered and
      // are ready for the orderering and committing
      promises.push(sendPromise);
      let results = await Promise.all(promises);
      Constants.logger.info(util.format('------->>> R E S P O N S E : %j', results));
      let response = results.pop(); //  orderer results are last in the results
      if (response.status === 'SUCCESS') {
        Constants.logger.info('Successfully sent transaction to the orderer.');
      } else {
        errorMessage = util.format('Failed to order the transaction. Error code: %s', response.status);
        Constants.logger.info(errorMessage);
      }

      // now see what each of the event hubs reported
      for (let i in results) {
        let eventHubResult = results[i];
        let eventHub = event_hubs[i];
        Constants.logger.info('Event results for event hub :%s', eventHub.getPeerAddr());
        if (typeof eventHubResult === 'string') {
          Constants.logger.info(eventHubResult);
        } else {
          if (!error_message) errorMessage = eventHubResult.toString();
          Constants.logger.info(eventHubResult.toString());
        }
      }
    } else {
      errorMessage = util.format('Failed to send Proposal and receive all good ProposalResponse');
      Constants.logger.info(errorMessage);
    }
  } catch (error) {
    Constants.logger.info('Failed to invoke due to error: ' + error.stack ? error.stack : error);
    errorMessage = error.toString();
  }

  if (!errorMessage) {
    let message = util.format(
      'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
      Constants.ORG1, 'mychannel', txIdString
    );
    Constants.logger.info(message);

    return txIdString;
  } else {
    let message = util.format('Failed to invoke chaincode. cause:%s', errorMessage);
    Constants.logger.info(message);
    throw new Error(message);
  }
}

debug(chalk.yellow('entered the transact page'));
// convert the whole js file into a function so that we can export the module and say
// app.use
// render the transact.pub jade file
function transrouter(navigate) {
  transactRouter.route('/').get((req, res) => {
    // debug(chalk.yellow('rendering the transact page'));
    debug(chalk.blue(navigate));

    res.render('transact',
      {
        // the navigate variable passed from the main file
        navigate,
        title: 'Start your transactions here'
      });
  });
  // return the const express.Router()
  return transactRouter;
}
// export the name of the function
// module.exports = transrouter;
transactRouter.route('/').post((req, res) => {
  // res.setHeader('content-type', 'text/plain');
  // res.end(`you have selected: ${req.body.values}`);
  debug(chalk.green('inside button click'));
  buttonClickTransactLogic();
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('transacted');
  res.end();
  // res.redirect('/transact');
});

// export the name of the function
module.exports = transrouter;

/* ORDERER logs block 4 on invoke
2018-11-04 02:22:41.794 UTC [common/deliver] deliverBlocks -> DEBU cd7 [channel: mychannel] Delivering block for (0xc420659680) for 172.21.0.5:44858
2018-11-04 02:22:41.831 UTC [fsblkstorage] waitForBlock -> DEBU cd8 Came out of wait. maxAvailaBlockNumber=[4]
2018-11-04 02:22:41.831 UTC [fsblkstorage] nextBlockBytesAndPlacementInfo -> DEBU cd9 Remaining bytes=[4651], Going to peek [8] bytes
2018-11-04 02:22:41.831 UTC [fsblkstorage] nextBlockBytesAndPlacementInfo -> DEBU cda Returning blockbytes - length=[4649], placementInfo={fileNum=[0], startOffset=[30607], bytesOffset=[30609]}

*/

/*
********
info: [APPLICATION]: ****************************INVOKE SUCCESS****************************
info: [APPLICATION]: Successfully sent Proposal and received ProposalResponse: Status - 200, message - "OK", metadata - "", endorsement signature: 0E!{������Ib` r��VY���+q�YQg���� +�'�r�>xU�S<��vw�,{J�՚����l
info: [APPLICATION]: ------->>> R E S P O N S E : [{"status":"SUCCESS","info":""}]
info: [APPLICATION]: Successfully sent transaction to the orderer.
info: [APPLICATION]: Successfully invoked the chaincode Org1 to the channel 'mychannel' for transaction ID: faa8d4273bf79c77a20049da1591bc5401adc61ce5301dffca6af10c6c78ef8f
*/