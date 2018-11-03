const router = require('express').Router();
const path = require('path');
const user = require('../domain/user/index');

router.get('/managexyz', (req, res) => {
  res.sendFile(path.join(__dirname, '../resources/playlist-website/index.html'))
});


router.get('/authy', (req, res) => {
  user.registerOrLoginUser(req.query.code).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});
module.exports = router;
