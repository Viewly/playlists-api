const passport = require('passport');
const utils = require('../../utils/helpers');
const FacebookStrategy = require('passport-facebook').Strategy;
const RedditStrategy = require('passport-reddit').Strategy;

function initializeStrategies() {
  passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      redirect_url: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile, ":P")
      // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
    }
  ));

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
  ));
}
module.exports = { initializeStrategies };
