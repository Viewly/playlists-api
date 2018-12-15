const utils = require('../../../utils/helpers');
const users = require('../../user/index');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const db = require('../../../../db/knex');
const _ = require('lodash');

function initializePassportStrategy() {
  console.log("Facebook passport strategy initialized");
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || `${process.env.CURRENT_ENDPOINT}/v1/api/user/auth/facebook`,
      profileFields: ['id', 'displayName', 'email', 'picture', 'first_name', 'last_name']
    },
    async (accessToken, refreshToken, profile, cb) => {
      profile = JSON.parse(profile._raw);
      const exists = await users.getUserByEmail(profile.email);
      const user = {
        facebook_access_token: accessToken,
        facebook_refresh_token: refreshToken,
        facebook_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        avatar_url: exists && exists.avatar_url ? exists.avatar_url : _.get(profile, 'picture.data.url', ''),
        email: profile.email,
        email_confirmed: true
      };
      let response = {};
      if (exists && !exists.facebook_id) { //Existed but never logged with facebook
        user.id = exists.id;
        await updateUser(user);
        response.message = "Thanks for linking your account with your Facebook account.";
      } else if (!exists) { //Never existed
        await registerUser(user);
        response.registered = true;
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
  return db.into('user').insert(user);
}

module.exports = { initializePassportStrategy };
