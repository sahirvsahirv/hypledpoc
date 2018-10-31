/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

const hfc = require('fabric-client');

const Constants = require('./constants.js');

function getUserName() {
  // TODO: Move 0.
  // Ok as of now since it is always going to be admin and 0 and also will
  // move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const username = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.usernameconfig]; // 'admin';
  Constants.logger.info(username);
  Constants.logger.info('****************** printed userName from config  ************************');
  return username;
}
module.exports.getUserName = getUserName;

function getUserPassword() {
  // TODO: Move 0.
  // Ok as of now since it is always going to be admin and 0 and
  // also will move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const secret = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.secret];
  // 'admin';
  Constants.logger.info(secret);
  Constants.logger.info('****************** printed secret from config  ************************');
  return secret;
}
module.exports.getUserPassword = getUserPassword;


async function getClientForOrg(userorg, username) {
  Constants.logger.info('*******************getClientForOrg - ****** START %s %s', userorg, username);
  // get a fabric client loaded with a connection profile for this org
  // '-connection-profile-path';
  const config = Constants.configappendstr;

  // build a client context and load it with a connection profile
  // lets only load the network settings and save the client for later
  const client = hfc.loadFromConfig(hfc.getConfigSetting(Constants.networkstr + config));

  // This will load a connection profile over the top of the current one one
  // since the first one did not have a client section and the following one does
  // nothing will actually be replaced.
  // This will also set an admin identity because the organization defined in the
  // client section has one defined
  client.loadFromConfig(hfc.getConfigSetting(userorg + config));

  // this will create both the state store and the crypto store based
  // on the settings in the client section of the connection profile
  await client.initCredentialStores();

  // The getUserContext call tries to get the user from persistence.
  // If the user has been saved to *******************getClientForOrgpersistence then that means the user has
  // been registered and enrolled. If the user is found in persistence
  // the call will then assign the user to the client object.
  if (username) {
    const user = await client.getUserContext(username, true);
    if (!user) {
      Constants.logger.info('User %s was not found in the store', username);
    } else {
      Constants.logger.info('User %s was found to be registered and enrolled', username);
    } // else
  }
  Constants.logger.info('getClientForOrg - ****** END %s %s \n\n', userorg, username);
  return client;
} // getClientForOrg over
module.exports.getClientForOrg = getClientForOrg;

function getCAName(orgname) {
  let caname; // ca-org2
  // TODO: change it to constants
  if (orgname === Constants.ORG1) {
    caname = 'ca-org1';
  } else if (orgname === Constants.ORG2) {
    caname = 'ca-org2';
  } else if (orgname === Constants.ORG3) {
    caname = 'ca-org3';
  }
  Constants.logger.info(caname);
  Constants.logger.info('****************** printed userName from config  ************************');
  return caname;
}
module.exports.getCAName = getCAName;

function getUserName() {
  // TODO: Move 0.
  // Ok as of now since it is always going to be admin and 0 and also will move to Keyvalue store later
  // ERROR: the constants passed were messed up
  const username = Constants.hfc.getConfigSetting(Constants.username)[0][Constants.usernameconfig]; // 'admin';
  Constants.logger.info(username);
  Constants.logger.info('****************** printed userName from config  ************************');
  return username;
}
module.exports.getUserName = getUserName;


async function getRegisteredUser(orgname, username) {
  try {
    const client = await getClientForOrg(orgname, username);
    Constants.logger.info('Successfully initialized the credential stores');
    // client can now act as an agent for organization Org1
    // first check to see if the user is already enrolled
    let user = await client.getUserContext(username, true);
    if (user && user.isEnrolled()) {
      Constants.logger.info('Successfully loaded member from persistence');
    } else {
      // user was not enrolled, so we will need an admin user object to register
      Constants.logger.info('User %s was not enrolled, so we will need an admin user object to register', username);
      const admins = hfc.getConfigSetting(Constants.username); // 'admins'
      const adminUserObj = await client.setUserContext({ username: getUserName(), password: getUserPassword() });
      const caClient = client.getCertificateAuthority();
      const enrolledAdmin = await caClient.enroll({
        // ERROR: [FabricCAClientImpl.js]: Invalid enroll request, missing enrollmentID 'ID" caps required
        enrollmentID: getUserName(), // TODO: How do you avoid loading again and again
        enrollmentSecret: getUserPassword(),
        profile: 'tls' // this is important as the CA uses TLS
      });
      const secret = await caClient.register({
        enrollmentID: username,
        affiliation: orgname + '.department1'
      }, adminUserObj);
      Constants.logger.info('Successfully got the secret for user %s', username);
      user = await client.setUserContext(
        {
          username: username,
          password: secret
        }
      );
      Constants.logger.info('Successfully enrolled username %s  and setUserContext on the client object', username);
    }
    if (user && user.isEnrolled) {
      return user;
    }
  } catch (error) {
    Constants.logger.info('INSIDE getRegisteredUser catch %s', error.message);
  }
  return null;
} // end of getRegisteredUser
module.exports.getRegisteredUser = getRegisteredUser;
