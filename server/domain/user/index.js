const db = require('../../../db/knex');
const helpers = require('../../utils/helpers');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const youtube = require('../youtube/index');
const emails = require('../email/index');

async function registerOrLoginUser(code){ //For Youtube
  const googleUser = await youtube.getUserInfoByCode(code);

  let data = await registerUser({
    email: googleUser.email,
    first_name: googleUser.given_name,
    last_name: googleUser.family_name,
    g_access_token: googleUser.g_access_token,
    g_refresh_token: googleUser.g_refresh_token,
    avatar_url: googleUser.picture
  });
  data.user = getCleanUserAndJwt(data.user);
  return data;

}

async function registerUser(user){
    const existing = await db.select('*').from('user').where('email', user.email).reduce(helpers.getFirst);
    if (existing) {
      user.id = existing.id;
      if (existing.g_access_token && user.g_access_token) {
        return { success: true, user };

      } else if (!existing.g_access_token && user.g_access_token) {
        await updateUserDetails(user);
        return { success: true, user, message: "Thanks for linking your account with your Youtube account." };

      } else {
        return { success: false, reason: "User already exists." };
      }
    }
    else {
        user.id = helpers.generateUuid();
        const password_hash = user.password ? await helpers.createBcryptHash(user.password): '';

        await db.insert({
          id: user.id,
          password_hash,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar_url: user.avatar_url,
          g_access_token: user.g_access_token,
          g_refresh_token: user.g_refresh_token,
          email_confirmed: !!user.g_access_token
        }).into('user');
        Promise.all([emails.sendWelcomeEmail(user), sendConfirmEmailLink(user.email)]);
        return { success: true, user: getCleanUserAndJwt(user), registered: true };
    }
}

async function loginUser(email, password) {
  const user = await db.select('*').from('user').where('email', email).reduce(helpers.getFirst);
  if (user) {
    const isPasswordValid = await helpers.compareBcryptHash(password, user.password_hash);
    const data = getCleanUserAndJwt(user);
    return !isPasswordValid
      ? {success: false, reason: "Invalid password."}
      : {success: true, user: data}
  } else {
    return {success: false, reason: "User with this email does not exist."}
  }
}

async function resetPasswordRequest(email) {
  const exists = await userExists(email);
  if (!exists) return { success: false, message: "The provided email does not seem to be registered with us." };
  const uuid = helpers.generateUuid();
  await db.update({
    password_reset_token: uuid,
    password_reset_token_expiry: moment(new Date()).add(24, 'hours')
  }).from('user').where('email', email);
  await emails.sendResetPasswordEmail({email, password_reset_token: uuid});
  return { success: true, message: "Reset password link has been sent to your email." };
}

async function resetPasswordProcess(password_reset_token, password) {
  const password_hash = await helpers.createBcryptHash(password);
  const exists = await db.select('*').from('user').where('password_reset_token', password_reset_token).reduce(helpers.getFirst);
  if (exists) {
    if (moment(exists.password_reset_token_expiry) > moment(new Date())) {
      await db.update({
        password_reset_token: null,
        password_reset_token_expiry: null,
        password_hash
      }).from('user').where('email', exists.email);
      return { success: true, message: "Password changed successfully!" }
    } else {
      return { success: false, message: "Link is expired. Please request a new link." }
    }
  } else {
    return { success: false, message: "Link is invalid." }
  }

}

function confirmEmail(email_confirm_token) {
  return db.from('user').update({
    email_confirmed: true
  }).where('email_confirm_token', email_confirm_token)
}

async function sendConfirmEmailLink(email) {
  const user = await userExists(email);
  if (user) {
    if (!user.email_confirmed) {
      const uuid = helpers.generateUuid();
      await db.from('user').update('email_confirm_token', uuid).where('email', email);
      await emails.sendConfirmEmail({email, email_confirm_token: uuid});
      return { success: true, message: "An email with confirmation link has been sent." }
    } else {
      return { success: false, message: "Email already confirmed." }
    }
  } else {
    return { success: false, message: "A user with this email does not exist." }
  }
}

function updateUserDetails(user) {
  return db.from('user').update({
    first_name: user.first_name,
    last_name: user.last_name,
    g_access_token: user.g_access_token,
    g_refresh_token: user.g_refresh_token,
    avatar_url: user.avatar_url
  }).where('id', user.id)
}

function updateUserPassword(user_id, hash){
  return db.from('user').update({
    password_hash: hash,
  }).where('id', user_id)
}

function getCleanUserAndJwt(user) {
  const data = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    created_at: user.created_at,
    avatar_url: user.avatar_url,
    email_confirmed: user.email_confirmed
  };
  data.jwt = jwt.sign(data, process.env.JWT_PASSWORD);
  return data;
}

function userExists(email) {
  return db.select('*').from('user').where('email', email).reduce(helpers.getFirst);
}

async function getUserById(user_id) {
  return db.select('*').from('user').where('id', user_id).reduce(helpers.getFirst).then(i => getCleanUserAndJwt(i));
}

module.exports = { registerUser, loginUser, resetPasswordRequest, resetPasswordProcess, registerOrLoginUser, updateUserPassword, sendConfirmEmailLink, confirmEmail, getUserById };
