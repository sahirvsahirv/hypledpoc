// touch package.json
// add initial package.json

// add eslint to scripts
// check internet
// npm install eslint
// had to do a npm install -g eslint for some reason

// npm install express
const express = require('express');
const path = require('path'); // no need to do npm install
const process = require('process');

// for debugging the app?
// npm install debug
const debug = require('debug')('app');
// npm install chalk
const chalk = require('chalk');
// it is for setting up for seeing more error messages on the console
// npm install morgan
const morgan = require('morgan');

// for the app's configuration details - START
require('./config.js');
const hfc = require('fabric-client');
const Constants = require('./source/constants.js');


// for the app's configuration details - END

const app = express();

// npm install nodemon for auto start of the server and add in start scripts of package.json

// eslint --init and configure eslint
// choose airbnb, "no for react" and js for config file and choose nstall with npm
// eslint server is running on the blue bar below
// npm run lint - to start pointing out errors?

// npm start to start nodemon
// to restart at anytime type rs
debug('Hello');
// morgan was to get more advanced output on the debug console
app.use(morgan('combined'));


// set the view engine to jade
app.set('views', './source/views');
app.set('view engine', 'pug');

// use the bootstrap and jquery files

// setting up a static files for css and js
// everytime there is an update will have to download manually
// adding this line below - solves the problem of picking it up from node_modules
// it first looks here and then gets bootstrap and jquery from node_modules
app.use(express.static(path.join(__dirname, '/source/views')));

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));

const navigate = [
  { link: '/transact', title: 'Transact' },
  { link: '/admin', title: 'Admin' }
];

// set the route and pass navigate - searches for the module transact and admin
// will give an error till we export from that file
// name of the js file needs to be given here
const transactrouter = require('./source/routes/transactroute')(navigate);
const adminrouter = require('./source/routes/adminroute')(navigate);
// const adminRouter = require('./source/views/admin')(navigate);

// for the app's configuration details - START
const host = process.env.HOST || hfc.getConfigSetting('host');
const port = process.env.PORT || hfc.getConfigSetting('port');
// for the app's configuration details - START

// use the modules - the same constant declared above
app.use('/transact', transactrouter);
app.use('/admin', adminrouter);

// ident using 2 spaces on the blue bar
// will only come here after there is a route - " cannot GET /"

// working - had to restart nodemon : port is not working
// not required now since it got moved to config.json
// const port = process.env.PORT || 3000;
// TODO: make debug work in the app routes
debug(chalk.blue(port));


app.listen(port, () => {
  debug(chalk.red(port));
});

// const logger = hfc.getLogger('APPLICATION');
Constants.logger.info('****************** SERVER STARTED ************************');
Constants.logger.info('***************  http://%s:%s  ******************', host, port);

// run npm start
// TODO: the port number 4000 does not work
app.get('/', (req, res) => {
  // now instead of res.send use res.sendfile index.html
  // res.render is used with a templating engine
  // res.sendfile will send any file
  // cannot have bothe res.send and res.sendfile and hence comment this
  // res.send('am in the home page');

  // use this syntax to print variables
  const hompagepath = path.join(__dirname, '/source/views/index.html');
  debug(`${hompagepath}`);
  // this index.html has bootstrap referenced from CDN on the internet
  // res.sendFile(hompagepath);

  // change it to a bootstrap template that you like from
  // https://www.bootstrapzero.com/bootstrap-template/basic
  // copy the downloaded files to /source/views and maintain a backup - since our
  // previous index.html was there - copy css and js folders too

  // now remove the bootstrap files from css and js and they should refer to it from node_modules
  // refer to the comment above in the search list to look for files in the directory paths

  // now use jade and assign paths
  // rename the index.html to index.pug
  // now have to change it to res.render from sendfile
  res.render('index',
    {
      // no nav right now
      // nav for transact and admin - make changes to index.pug too for the changes in the links
      // create 2 files transact.pug and admin.pug in the same directory as index.pug
      // and 2 js files in routes dir

      // use a router and pass nav using the router
      // use the constact where we declared the routes above and pass this const to the other pages
      nav: navigate,
      title: 'fabric nodejs app'
    });

  // comma-dangle error - add in .eslintrc.js
  // view engine error as soon as you use render - add the app.use files above

  // cannot find module pug. stop and say npm install pug

  // connection refused - change the file to pug format
  // use a html to pug realtime converter online - https://html2jade.org/
  // works till now

  // now add the nav pages in the rs.render above for Transact and Admin
  // set the view engine to jade

  // removed the # because # is for an id - in all .pug files
  // a(href='transact') Transact
  //        ul.nav.navbar-nav.navbar-right
  //          li
  //            a(href='admin') Admin
  // now talk to nodejs SDK

  debug(chalk.red('in the home page'));
});
