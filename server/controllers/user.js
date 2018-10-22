const router = require('express').Router();
const user = require('../domain/user/index');
const helpers = require('../utils/helpers');
const bookmarks = require('../domain/bookmarks/index');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res) => {
  user.registerUser(req.body).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.post('/login', (req, res) => {
  user.loginUser(req.body.email, req.body.password).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.get('/auth', (req, res) => {
  youtube.getAuthUrl(req.query.is_content_creator).then(url => {
    res.json({url})
  }).catch(err => res.json(err))
});
router.post('/youtube-login', async (req, res) => {
  users.registerOrLoginUser(req.body.code).then(data => {
    data.token = jwt.sign(data.user, process.env.JWT_PASSWORD);
    res.json(data);
  }).catch(err => res.json(err.message))
});

router.use(helpers.auth);

router.get('/bookmarks', (req, res) => {
  const uuid = req.user.id || 'Viewly';
  bookmarks.getBookmarksForUser(uuid).then(data => {
    res.json(data);
  }).catch(err => res.json(err));
});

router.post('/bookmark', (req, res) => {
  const uuid = req.user.id || 'Viewly';
  bookmarks.createBookmark(uuid, req.body.playlist_id).then(data => {
    res.json(data);
  }).catch(err => res.json(err));
});

router.delete('/bookmark/:bookmark_id', (req, res) => {
  const uuid = req.user.id || 'Viewly';
  bookmarks.deleteBookmark(uuid, req.params.bookmark_id).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err));
});
module.exports = router;
