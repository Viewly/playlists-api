const utils = require('../../../utils/helpers');
const users = require('../../user/index');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const db = require('../../../../db/knex');
const _ = require('lodash');

function initializePassportStrategy() {
  console.log("Twitter passport strategy initialized");
  passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_APP_ID,
      consumerSecret: process.env.TWITTER_APP_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL || `${process.env.CURRENT_ENDPOINT}/v1/api/user/auth/twitter`,
      userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
    },
    async (accessToken, refreshToken, profile, cb) => {
      profile.email = _.get(profile, 'emails[0].value', '');
      const exists = await users.getUserByEmail(profile.email);
      const user = {
        twitter_access_token: accessToken,
        twitter_refresh_token: refreshToken,
        twitter_id: profile.id,
        first_name: exists.first_name || profile.displayName,
        avatar_url: exists && exists.avatar_url ? exists.avatar_url : _.get(profile, 'photos[0].value', ''),
        email: profile.email,
        alias: profile.username,
        email_confirmed: true
      };
      let response = {};
      if (exists && !exists.twitter_access_token) { //Existed but never logged with twitter
        user.id = exists.id;
        await updateUser(user);
        response.message = "Thanks for linking your account with your Twitter account.";
      } else if (!exists) { //Never existed
        user.id = await registerUser(user);
        response.registered = true;
        users.afterRegisterProcess(user);
      }
      response.user = users.getCleanUserAndJwt(await users.getUserByEmail(user.email));
      response.success = true;
      cb(null, response);
    }
  ));
}

async function updateUser(user) {
  return db.from('user').update(user).where('id', user.id)
}

async function registerUser(user){
  user.id = utils.generateUuid();
  user.alias = user.alias || await utils.getRandomAlias();
  return db.into('user').insert(user).then(() => Promise.resolve(user.id));
}

module.exports = { initializePassportStrategy };
