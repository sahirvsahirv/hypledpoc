const express = require('express');
const chalk = require('chalk');
const debug = require('debug');

const hfc = require('fabric-client');
const Constants = require('../constants.js');
const ClientUtils = require('../helper.js');

const queryRouter = express.Router();

async function buttonClickQueryLogic() {
  Constants.logger.info('****************** INSIDE QUERY CLICK ************************');
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
