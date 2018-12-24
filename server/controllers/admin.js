const router = require('express').Router();
const path = require('path');
const twitch = require('../domain/twitch/index');

router.get('/managexyz', (req, res) => {
  res.sendFile(path.join(__dirname, '../resources/playlist-website/index.html'))
});
const cache = {};
router.get('/twitch', (req, res) => {
  if (cache[req.query.username]) res.json(cache[req.query.username]);
  else {
    twitch.extractSocialMediaFromPanels(req.query.username).then(data => {
      cache[req.query.username] = data;
      res.json(data);
    }).catch(err => res.json(err))
  }

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
