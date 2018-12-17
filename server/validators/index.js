const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const { check } = require('express-validator/check');

const generalValidators = {
  email: check('email').isEmail().trim().withMessage('Email must be a valid email address.'),
  password: check('password').isLength({ min: 8 }).withMessage('Password must be contain at least 8 characters.'),
};


function validateErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else next();

}
function matchData(req, res, next){
  req.body = matchedData(req, { locations: ['body'] });
  next();
}
module.exports = { generalValidators, validateErrors, matchData };
