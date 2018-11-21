const utils = require('../../utils/helpers');
const facebook = require('../login-adapters/facebook/index');
const reddit = require('../login-adapters/facebook/index');

function initializeStrategies() {
  facebook.initializePassportStrategy();
  reddit.initializePassportStrategy();
}
module.exports = { initializeStrategies };
