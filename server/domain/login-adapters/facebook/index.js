const utils = require('../../../utils/helpers');
const users = require('../../user/index');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

function initializePassportStrategy() {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/v1/api/user/auth/facebook",
      profileFields: ['id', 'displayName', 'email']
    },
    async (accessToken, refreshToken, profile, cb) => {
      console.log(profile, ":P");
      profile = JSON.parse(profile._raw);
      cb(null, await users.registerUser({
        facebook_access_token: accessToken,
        facebook_refresh_token: refreshToken,
        facebook_id: profile.id,
        name: profile.name,
        email: profile.email
      }, 'facebook'));
    }
  ));
}

function getAuthUrl() {

}

async function getUserInfoByCode(code, state){
}

async function registerOrLoginUserFacebook(user){ //Maybe link reddit


  let data = await users.registerUser({
    reddit_username: user.username,
    avatar_url: user.picture,
    email_confirmed: user.email_confirmed

  });
  data.user = getCleanUserAndJwt(data.user);
  return data;

}

module.exports = { initializePassportStrategy };
