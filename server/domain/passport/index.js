const utils = require('../../utils/helpers');
const facebook = require('../login-adapters/facebook/index');
const reddit = require('../login-adapters/reddit/index');
const google = require('../login-adapters/google/index');

function initializeStrategies() {
  facebook.initializePassportStrategy();
  reddit.initializePassportStrategy();
  google.initializePassportStrategy();
}
module.exports = { initializeStrategies };
