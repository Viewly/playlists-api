const { check } = require('express-validator/check');
const { validateErrors, matchData, generalValidators } = require('./index');

const registerUser = [
  generalValidators.email,
  generalValidators.password,
  check(['first_name', 'last_name']).trim().optional(),
  check('avatar_url').optional().trim().isURL().withMessage('Must be a valid url.')
];

const loginUser = [
  generalValidators.email,
  generalValidators.password,
];

const youtubeLogin = [
  check('code').trim().withMessage('Code is required.')
];

const resetPasswordRequest = [
  generalValidators.email
];

const resetPassword = [
  generalValidators.email,
  generalValidators.password,
  check('password_reset_token').isUUID()
];

const confirmEmailRequest = [
  generalValidators.email
];

const confirmEmail = [
  check('email').isEmail().trim().withMessage('Email must be a valid email address.'),
  check('email_confirm_token').isUUID()
];

const createBookmark = [
  check('playlist_id').isUUID()
];

const onboarding = [
  check('categories_ids').isArray(),
  check('time_to_spend').isInt().optional(),
  check('step').isInt().optional()
];

const validators = {registerUser, loginUser, youtubeLogin, resetPasswordRequest, resetPassword, confirmEmailRequest, confirmEmail, createBookmark, onboarding};
Object.keys(validators).forEach(key => { validators[key].push(validateErrors, matchData) });

module.exports = validators;
