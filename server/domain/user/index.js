const db = require('../../../db/knex');
const helpers = require('../../utils/helpers');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const youtube = require('../youtube/index');
const emails = require('../email/index');
const crm = require('../crm/index');

async function registerOrLoginUserGoogle(code){ //For Google
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

async function registerUser(user, platform = 'google'){
    const existing = await db.select('*').from('user').where('email', user.email).reduce(helpers.getFirst);
    if (existing) {
      user.id = existing.id;
      if ((existing.g_access_token && user.g_access_token) || user.facebook_id) {
        return { success: true, user: getCleanUserAndJwt(user) };

      } else if (!existing.g_access_token && user.g_access_token) {
        await updateUserDetails(user);
        return { success: true, user: getCleanUserAndJwt(user), message: "Thanks for linking your account with your Youtube account." };

      } else {
        return { success: false, reason: "User already exists." };
      }
    }
    else {
        //user.id = helpers.generateUuid();

        let newUser = {};
        switch (platform) {
          case 'google':
            break;
          case 'facebook':
            newUser = {
              email: user.email,
              email_confirmed: true,
              first_name: user.name,
              facebook_id: user.id
            };
            break;
          case 'local':
            const password_hash = user.password ? await helpers.createBcryptHash(user.password): '';
            newUser = {
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              password_hash
            };
            break;
          case 'twitter':
            newUser = {}; //TBD
            break;
            //sendConfirmEmailLink(user.email)
        }

        newUser.id = helpers.generateUuid();
        await db.insert(newUser).into('user');
        await createOnboarding(newUser.id);
        Promise.all([emails.sendWelcomeEmail(newUser), crm.createUser(newUser)]);
        return { success: true, user: getCleanUserAndJwt(newUser), registered: true };
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

function updateUserBasicInfo(user) {
  return db.from('user').update({
    first_name: user.first_name,
    last_name: user.last_name,
    avatar_url: user.avatar_url
  }).where('id', user.id)
}

function updateUserPassword(user_id, hash){
  return db.from('user').update({
    password_hash: hash,
  }).where('id', user_id)
}

async function validateUserPassword(user_id, password) {
  const user = await db.from('user').select('password_hash').where('id', user_id).reduce(helpers.getFirst);
  return helpers.compareBcryptHash(password, user.password_hash);
}

async function changeUserPassword(user_id, old_password, new_password) {
  const valid = await validateUserPassword(user_id, old_password);
  if (valid) {
    //TODO: some more validation for the new password.
    const new_hash = await helpers.createBcryptHash(new_password);
    await updateUserPassword(user_id, new_hash);
    return { success: true, message: 'Password changed successfully!' }
  }  else {
    return { success: false, message: 'Current password is wrong.' }
  }
}

function getCleanUserAndJwt(user) {
  const data = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    created_at: user.created_at,
    avatar_url: user.avatar_url,
    email_confirmed: user.email_confirmed || !!user.g_access_token
  };
  data.jwt = jwt.sign(data, process.env.JWT_PASSWORD);
  return data;
}

function userExists(email) {
  return db.select('*').from('user').where('email', email).reduce(helpers.getFirst);
}

async function getUserById(user_id) {
  let user = await db.select('*').from('user').where('id', user_id).reduce(helpers.getFirst).then(i => getCleanUserAndJwt(i));
  user.playlists = await db.select('*').from('playlist').where('user_id', user_id);
  return user;
}

async function createOnboarding(user_id) {
  return db.insert({ user_id }).into('onboarding')
}

async function updateOnboarding(user_id, onboarding){
  const user = await getUserById(user_id);
  const categories = await youtube.getCategories();
  user.categories_ids = onboarding.categories_ids || [];
  user.categories = user.categories_ids.map(i => {
    let found = categories.find(x => x.id === i);
    return found.name;
  });
  return db.update({
    step: onboarding.step,
    time_to_spend: onboarding.time_to_spend,
    categories_ids: JSON.stringify(user.categories_ids)
  }).from('onboarding').where('user_id', user_id).then(() => crm.updateUser(user));
}

async function getOnboarding(user_id){
  return db.select('*').from('onboarding').where('user_id', user_id).reduce(helpers.getFirst);
}
module.exports = { updateOnboarding, getOnboarding, registerUser, loginUser, resetPasswordRequest, resetPasswordProcess, registerOrLoginUserGoogle, updateUserPassword, sendConfirmEmailLink, confirmEmail, getUserById, updateUserBasicInfo, changeUserPassword };
