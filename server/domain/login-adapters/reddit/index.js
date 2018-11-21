const utils = require('../../../utils/helpers');
const users = require('../../user/index');
const request = require('request');
const RedditStrategy = require('passport-reddit').Strategy;
const passport = require('passport');

function initializePassportStrategy() {
  passport.use(new RedditStrategy({
      clientID: process.env.REDDIT_APP_ID,
      clientSecret: process.env.REDDIT_APP_SECRET,
      callbackURL: "https://vidflow.com/authy",
      state: utils.generateUuid()
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile, ":P")
      // User.findOrCreate({ redditId: profile.id }, function (err, user) {
      //   return done(err, user);
      // });
    }
  ))
}


const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.REDDIT_APP_ID,
    secret: process.env.REDDIT_APP_SECRET
  },
  auth: {
    authorizeHost: 'https://www.reddit.com',
    authorizePath: '/api/v1/authorize',

    tokenHost: 'https://www.reddit.com',
    tokenPath: '/api/v1/access_token'
  }
});

function getAuthUrl() {
  return Promise.resolve(oauth2.authorizationCode.authorizeURL({
    redirect_uri: 'https://vidflow.com/authy',
    scope: ['identity'],
    state: utils.generateUuid()
  }));
}

async function getUserInfoByCode(code, state){
  try {
    // The resulting token.
    const result = await oauth2.authorizationCode.getToken({
      code,
      state,
      redirect_uri: 'https://vidflow.com/authy'
    });

    // Exchange for the access token.
    const data = oauth2.accessToken.create(result);
    const token = data.token;
    return new Promise((resolve, reject) => {
      request('https://oauth.reddit.com/api/v1/me', {
        headers: {
          'authorization': `Bearer ${token.access_token}`,
          'user-agent': 'Vidflow/denkomanceski'
        }
      }, (err, res, body) => {
        console.log(err, res, body);
        body = JSON.parse(body);
        if (err || res.statusCode !== 200) reject(err || body);
        else {
          resolve({
            username: body.name,
            thumbnail: body.icon_img,
            over_18: body.over_18,
            is_gold: body.is_gold,
            is_mod: body.is_mod,
            email_confirmed: body.has_verified_email,
            pref_nightmode: body.pref_nightmode,
            comment_karma: body.comment_karma,
            created_utc: body.created_utc
          })
        }


      })
    });

  } catch (error) {
    return Promise.reject(error);
  }
}

async function registerOrLoginUserReddit(code){ //Maybe link reddit
  const user = await getUserInfoByCode(code);

  let data = await users.registerUser({
    reddit_username: user.username,
    avatar_url: user.picture,
    email_confirmed: user.email_confirmed

  });
  data.user = getCleanUserAndJwt(data.user);
  return data;

}



module.exports = { initializePassportStrategy, getAuthUrl, getUserInfoByCode };
