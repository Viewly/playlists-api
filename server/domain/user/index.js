const db = require('../../../db/knex');
const helpers = require('../../utils/helpers');
const jwtPassword = process.env.JWT_PASSWORD;
const jwt = require('jsonwebtoken');

async function registerUser(user){
    const exists = await db.select('*').from('user').where('email', user.email).reduce(helpers.getFirst)
    if (exists) return { success: false, reason: "User already exists." };
    else {
        const uuid = helpers.generateUuid();
        const password_hash = await helpers.createBcryptHash(user.password);

        await db.insert({
          id: uuid,
          password_hash,
          email: user.email,
          full_name: user.full_name
        }).into('user');

        return uuid;
    }
}

async function loginUser(email, password) {
  const user = await db.select('*').from('user').where('email', email).reduce(helpers.getFirst);
  if (user) {
    const isPasswordValid = await helpers.compareBcryptHash(password, user.password_hash);
    const data = {email: user.email, full_name: user.full_name, id: user.id};
    return !isPasswordValid
      ? {success: false, reason: "Invalid password."}
      : {success: true, data, jwt: jwt.sign(JSON.stringify(data), jwtPassword)}
  } else {
    return {success: false, reason: "User with this email does not exist."}
  }
}

function resetPasswordRequest() {}

function resetPasswordProcess() {}

function changePassword() {}

module.exports = { registerUser, loginUser, resetPasswordRequest, resetPasswordProcess, changePassword };
