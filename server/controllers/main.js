const router = require('express').Router();
const youtube = require('../domain/youtube/index');
const jwt = require('jsonwebtoken');
const jwtPassword = process.env.JWT_PASSWORD;

router.get('/playlists', (req, res) => {
  youtube.getAuthUrl(req.query.is_content_creator).then(url => {
    res.json({url})
  }).catch(err => res.json(err))
});

router.get('/playlist/:playlist_id', (req, res) => {
  youtube.getAuthUrl(req.query.is_content_creator).then(url => {
    res.json({url})
  }).catch(err => res.json(err))
});

router.post('/playlist', async (req, res) => {
  users.registerOrLoginUser(req.body.code, req.body.is_content_creator).then(data => {
    data.token = jwt.sign(data.user, jwtPassword);
    res.json(data);
  }).catch(err => res.json(err.message))
});
router.post('/playlist-reorder', async (req, res) => {
  users.registerOrLoginUser(req.body.code, req.body.is_content_creator).then(data => {
    data.token = jwt.sign(data.user, jwtPassword);
    res.json(data);
  }).catch(err => res.json(err.message))
});


router.use((req, res, next) => {
  jwt.verify(req.headers['authorization'], jwtPassword, (err, decoded) => {
    if (err) res.json({error: 'Unauthorized'});
    else {
      req.user = decoded;
      next();
    }
  });
});


module.exports = router;
