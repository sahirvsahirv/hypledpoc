// Create and join channel for all 3 orgs separately
// TODO: take from key value store instead of harcoded values from config.json
// TODO: Make a separate route with URL or from server for org and join

const Constants = require('../constants.js');

function getUserName() {
  const username = Constants.hfc.getConfigSetting(Constants.usernameconfig)[0][Constants.username]; // 'admin';
  Constants.logger.info(username);
  Constants.logger.info('****************** printed userName from config  ************************');
}

function getOrgName() {
    
}
async function getClientForOrg(userorg, username) {
    logger.info('****************** getClientForOrg - INSIDE FUNCTTION ************************');
}
