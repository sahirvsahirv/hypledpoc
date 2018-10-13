const express = require('express');
const chalk = require('chalk');
const debug = require('debug');

const transactRouter = express.Router();

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
module.exports = transrouter;
