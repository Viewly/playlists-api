const router = require('express').Router();
const users = require('../domain/user/index');
const helpers = require('../utils/helpers');
const bookmarks = require('../domain/bookmarks/index');
const youtube = require('../domain/youtube/index');
const reddit = require('../domain/reddit/index');
const passport = require('passport');
const authAdapters = {
  google: youtube,
  reddit
};
const jwt = require('jsonwebtoken');


router.post('/register', (req, res) => {
  users.registerUser(req.body).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.post('/login', (req, res) => {
  users.loginUser(req.body.email, req.body.password).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.get('/auths', (req, res, next) => {
  passport.authenticate('reddit', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});

router.get('/auth', (req, res) => {
  const adapter = authAdapters[req.query.adapter || 'google'];
  if (!adapter) res.json({success: false, error: "Adapter does not exist"});
  else {
    adapter.getAuthUrl().then(url => {
      res.json({url})
    }).catch(err => res.json(err))
  }
});

router.post('/reset-password-request', (req, res) => {
  const email = req.body.email;
  email ? users.resetPasswordRequest(email).then(data => {
      res.json(data);
    }) : res.json({success: false, reason: "Email address is required."})
});

router.post('/reset-password', (req, res) => {
  if (!req.body.password_reset_token) {
    res.json({success: false, reason: "Missing token."})
  } else if (!req.body.password) {
    res.json({success: false, reason: "Missing password."})
  } else {
    users.resetPasswordProcess(req.body.password_reset_token, req.body.password).then(data => {
      res.json(data)
    }).catch(err => res.json(err))
  }
});

router.post('/youtube-login', async (req, res) => {
  users.registerOrLoginUser(req.body.code).then(data => {
    data.token = jwt.sign(data.user, process.env.JWT_PASSWORD);
    res.json(data);
  }).catch(err => res.json(err.message))
});

router.post('/confirm-email-request', (req, res) => {
  if (!req.body.email) res.json({ success: false, reason: "Email is missing." });
  else {
    users.sendConfirmEmailLink(req.body.email).then(data => {
      res.json(data);
    }).catch(err => res.json(err))
  }
});

router.post('/confirm-email', (req, res) => {
  users.confirmEmail(req.body.email_confirm_token).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.use(helpers.auth);

router.get('/info', (req, res) => {
  const uuid = req.user.id;
  if (uuid) {
    users.getUserById(req.user.id).then(user => {
      res.json(user);
    }).catch(err => res.json(err))
  } else {
    res.json({success: false, reason: "JWT might not be valid."})
  }
});

router.put('/info', (req, res) => {
  const user = req.body;
  user.id = req.user.id;
  if (user.id) {
    users.updateUserBasicInfo(user).then(async () => {
      res.json({success: true, user: await users.getUserById(req.user.id)});
    }).catch(err => res.json(err))
  } else {
    res.json({success: false, reason: "JWT might not be valid."})
  }
});

router.put('/change-password', (req, res) => {
  const uuid = req.user.id;
  const { current_password, new_password } = req.body;
  uuid
    ? users.changeUserPassword(uuid, current_password, new_password).then(data => {
      res.json(data);
    }).catch(err => res.json(err))
    : res.json({success: false, reason: "JWT might not be valid."})
});

router.get('/bookmarks', (req, res) => {
  const uuid = req.user.id;
  bookmarks.getBookmarksForUser(uuid).then(data => {
    res.json(data);
  }).catch(err => res.json(err));
});

router.post('/bookmark', (req, res) => {
  const uuid = req.user.id;
  bookmarks.createBookmark(uuid, req.body.playlist_id).then(data => {
    res.json(data);
  }).catch(err => res.json(err));
});

router.delete('/bookmark/:playlist_id', (req, res) => {
  const uuid = req.user.id;
  bookmarks.deleteBookmark(uuid, req.params.playlist_id).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err));
});

router.put('/onboarding', (req, res) => {
  const uuid = req.user.id;
  users.updateOnboarding(uuid, req.body).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err));
});

router.get('/onboarding', (req, res) => {
  const uuid = req.user.id;
  users.getOnboarding(uuid).then(data => {
    res.json(data);
  }).catch(err => res.json(err));
});
module.exports = router;
