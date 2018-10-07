const router = require('express').Router();
const playlist = require('../domain/playlist/index');
const youtube = require('../domain/youtube/index');
const jwt = require('jsonwebtoken');
const jwtPassword = process.env.JWT_PASSWORD;

router.get('/playlists', (req, res) => {
  playlist.getPlaylists().then(playlists => {
    res.json(playlists);
  }).catch(err => res.json(err))
});

router.get('/playlist/:playlist_id', (req, res) => {
  playlist.getPlaylist(req.params.playlist_id).then(playlist => {
    res.json(playlist);
  }).catch(err => res.json(err))
});

router.post('/playlist', async (req, res) => {
  playlist.createPlaylist(req.body).then(id => {
    res.json({id});
  }).catch(err => res.json(err))
});
router.post('/playlist-reorder', async (req, res) => {
  playlist.reorderPlaylist(req.body).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))
});
router.get('/video-prefill', (req, res) => {

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
