// var util = require('util');
const path = require('path');
const hfc = require('fabric-client');
const Constants = require('./source/constants.js');

const file = 'connectionprofile.yaml';

// TODO: change this to an enviromnent variable`
// export HFC_LOGGING='{"debug":"console","info":"console"}';

// const logger = hfc.GetLogger('APPLICATION');

// var env = process.env.TARGET_NETWORK;
// if (env)
//     file = util.format(file, '-' + env);
// else
//      file = util.format(file, '');

// indicate to the application where the setup file is located so it able
// to have the hfc load it to initalize the fabric client instance
hfc.setConfigSetting('network-connection-profile-path', path.join(__dirname, file));
Constants.logger.debug('%s NETWORK CONFIG PATH', path.join(__dirname, file));

// TODO: change all INFO to DEBUg
hfc.setConfigSetting('Org1-connection-profile-path', path.join(__dirname, 'org1.yaml'));
Constants.logger.debug('%s ORG1 CONFIG PATH', hfc.getConfigSetting('Org1-connection-profile-path'));
hfc.setConfigSetting('Org2-connection-profile-path', path.join(__dirname, 'org2.yaml'));
Constants.logger.debug('%s ORG2 CONFIG PATH', hfc.getConfigSetting('Org2-connection-profile-path'));
hfc.setConfigSetting('Org3-connection-profile-path', path.join(__dirname, 'org3.yaml'));
Constants.logger.debug('%s ORG3 CONFIG PATH', hfc.getConfigSetting('Org3-connection-profile-path'));


// some other settings the application might need to know
hfc.addConfigFile(path.join(__dirname, 'config.json'));
