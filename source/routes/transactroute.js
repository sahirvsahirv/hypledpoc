const express = require('express');
const chalk = require('chalk');
const debug = require('debug');

const hfc = require('fabric-client');
const Constants = require('../constants.js');
const ClientUtils = require('../helper.js');

const transactRouter = express.Router();

async function buttonClickTransactLogic() {
  Constants.logger.info('****************** INSIDE TRANSACT CLICK ************************');
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
  res.write('transaction');
  // res.redirect('/transact');
});

// export the name of the function
module.exports = transrouter;
