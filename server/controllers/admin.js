const router = require('express').Router();
const path = require('path');
const playlist = require('../domain/playlist/index');
const youtube = require('../domain/youtube/index');

router.get('/managestaffpickedplaylists', (req, res) => {
  res.sendFile(path.join(__dirname, '../resources/playlist-website/index.html'))
});

router.put('/classification', (req, res) => {
  const { playlist_id, classification } = req.body;
  playlist.updatePlaylistClassificaiton(playlist_id, classification).then(data => {
    res.json({success: !!data});
  }).catch(err => res.json(err))
});
router.get('/q', (req, res) => {
  youtube.searchPlaylist(req.query.q).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

// router.get('/authy', (req, res) => {
//   user.registerOrLoginUserGoogle(req.query.code).then(data => {
//     res.json(data);
//   }).catch(err => res.json(err))
// });
module.exports = router;
