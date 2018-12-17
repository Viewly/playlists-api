const router = require('express').Router();
const users = require('../domain/user/index');
const helpers = require('../utils/helpers');
const bookmarks = require('../domain/bookmarks/index');
const passport = require('passport');
const userValidators = require('../validators/user');


router.post('/register', userValidators.registerUser, (req, res) => {
  users.registerUser(req.body).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.post('/login', userValidators.loginUser, (req, res) => {
  users.loginUser(req.body.email, req.body.password).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.get('/auth', (req, res, next) => passport.authenticate(req.query.platform || 'google', { session: false, scope: ['email'] })(req, res, next));
router.get('/auth/:platform', (req, res, next) => passport.authenticate(req.params.platform, (err, user, info) => {
  if (err) {
    console.error(err || info);
    res.status(500).json(err || info);
  } else {
    res.json(user)
  }
})(req, res, next));

router.post('/reset-password-request', userValidators.resetPasswordRequest, (req, res) => {
  const email = req.body.email;
  email ? users.resetPasswordRequest(email).then(data => {
      res.json(data);
    }) : res.json({success: false, reason: "Email address is required."})
});

router.post('/reset-password', userValidators.resetPassword, (req, res) => {
    users.resetPasswordProcess(req.body.password_reset_token, req.body.password).then(data => {
      res.json(data)
    }).catch(err => res.json(err))
});

router.post('/confirm-email-request', userValidators.confirmEmailRequest, (req, res) => {
    users.sendConfirmEmailLink(req.body.email).then(data => {
      res.json(data);
    }).catch(err => res.json(err))
});

router.post('/confirm-email', userValidators.confirmEmail, (req, res) => {
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

router.put('/info', userValidators.updateUserInfo, (req, res) => {
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

router.post('/bookmark', userValidators.createBookmark, (req, res) => {
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

router.put('/onboarding', userValidators.onboarding, (req, res) => {
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
