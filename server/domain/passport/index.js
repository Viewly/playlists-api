const facebook = require('../login-adapters/facebook/index');
const reddit = require('../login-adapters/reddit/index');
const google = require('../login-adapters/google/index');
const twitter = require('../login-adapters/twitter/index');

function initializeStrategies() {
  facebook.initializePassportStrategy();
  reddit.initializePassportStrategy();
  google.initializePassportStrategy();
  twitter.initializePassportStrategy();
}
module.exports = { initializeStrategies };
