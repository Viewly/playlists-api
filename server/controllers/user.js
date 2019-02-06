const router = require('express').Router();
const users = require('../domain/user/index');
const helpers = require('../utils/helpers');
const bookmarks = require('../domain/bookmarks/index');
const passport = require('passport');
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

router.get('/auth', (req, res, next) => passport.authenticate(req.query.platform || 'google', { session: true, scope: ['email'] })(req, res, next));
router.get('/auth/:platform', (req, res, next) => passport.authenticate(req.params.platform, (err, user, info) => {
  if (err) {
    console.error(err || info);
    res.status(500).json(err || info);
  } else {
    res.json(user)
  }
})(req, res, next));

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
  users.registerOrLoginUserGoogle(req.body.code).then(data => {
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


router.get('/info', helpers.authOptional, async (req, res) => {
  const uuid = req.query.alias ? await users.getUserIdByAlias(req.query.alias) : req.user ? req.user.id : null;
  if (uuid) {
    users.getUserById(uuid).then(user => {
      if (req.query.alias) { helpers.deleteProps(user, ['email', 'jwt', 'email_confirmed']); }
      res.json(user);
    }).catch(err => res.json(err))
  } else {
    res.json({success: false, reason: "JWT might not be valid or alias param is missing."})
  }
});
router.use(helpers.auth);
router.put('/info', (req, res) => {
  const user = req.body;
  user.id = req.user.id;
  if (user.id) {
    users.updateUserBasicInfo(user).then((data) => {
      res.json(data);
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
    res.json(data || { success: false, error: "Please onboard first" });
  }).catch(err => res.json(err));
});
module.exports = router;
