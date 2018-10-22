const db = require('../../../db/knex');
const helpers = require('../../utils/helpers');
const jwtPassword = process.env.JWT_PASSWORD;
const jwt = require('jsonwebtoken');
const youtube = require('../youtube/index');

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
        }).into('user');

        return { success: true, user, registered: true };
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

function resetPasswordRequest() {}

function resetPasswordProcess() {}

function changePassword() {}

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
  delete user.g_access_token;
  delete user.g_refresh_token;
  delete user.password_hash;
  delete user.updated_at;
  user.jwt = jwt.sign(user, process.env.JWT_PASSWORD);
  return user;
}

module.exports = { registerUser, loginUser, resetPasswordRequest, resetPasswordProcess, changePassword, registerOrLoginUser, updateUserPassword };
