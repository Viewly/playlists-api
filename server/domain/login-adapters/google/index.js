const utils = require('../../../utils/helpers');
const users = require('../../user/index');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const db = require('../../../../db/knex');
const _ = require('lodash');

function initializePassportStrategy() {
  console.log("Google passport strategy initialized");
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_APP_ID,
      clientSecret: process.env.GOOGLE_APP_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.CURRENT_ENDPOINT}/v1/api/user/auth/google`,
    },
    async (accessToken, refreshToken, profile, cb) => {
      profile.email = _.get(profile, 'emails[0].value', '');
      const exists = (await db.select('*').from('user').where('email', profile.email))[0];
      const user = {
        g_access_token: accessToken,
        g_refresh_token: refreshToken,
        //facebook_id: profile.id,
        first_name: _.get(profile, 'name.givenName', profile.displayName),
        last_name: _.get(profile, 'name.familyName', ''),
        avatar_url: exists && exists.avatar_url ? exists.avatar_url : _.get(profile, 'image.url', ''),
        email: profile.email,
        email_confirmed: true
      };
      let response = {};
      if (exists && !exists.g_access_token) { //Existed but never logged with facebook
        user.id = exists.id;
        await updateUser(user);
        response.message = "Thanks for linking your account with your Google account.";
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
