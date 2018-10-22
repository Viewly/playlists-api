const router = require('express').Router();
const user = require('../domain/user/index');

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

module.exports = router;
