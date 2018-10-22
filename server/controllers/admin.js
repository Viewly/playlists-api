const router = require('express').Router();
const path = require('path');
const fs = require('fs');

router.get('/somerandom1235domain6777', (req, res) => {
  res.sendFile(path.join(__dirname, '../resources/playlist-website/index.html'))
});

module.exports = router;
