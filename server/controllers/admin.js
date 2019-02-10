const router = require('express').Router();
const path = require('path');
const playlist = require('../domain/playlist/index');

router.get('/managestaffpickedplaylists', (req, res) => {
  res.sendFile(path.join(__dirname, '../resources/playlist-website/index.html'))
});

router.put('/manageplaylist', (req, res) => {
  const { playlist_id, classification, status } = req.body;
  playlist.updatePlaylistClassificaiton(playlist_id, classification, status).then(data => {
    res.json({success: !!data});
  }).catch(err => res.json(err))
});
// router.get('/facebook', (req, res) => {
//   facebook.getUserInfoByCode(req.query.code, req.query.state).then(data => {
//     res.json(data);
//   }).catch(err => res.json(err))
// });

// router.get('/authy', (req, res) => {
//   user.registerOrLoginUserGoogle(req.query.code).then(data => {
//     res.json(data);
//   }).catch(err => res.json(err))
// });
module.exports = router;
