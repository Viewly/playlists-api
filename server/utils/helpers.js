const moment = require('moment');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const validateUuid = require('uuid-validate');

const getFirst = (_, i) => {
  return i[0];
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

async function timeout(seconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

function durationToReadable(durationString) {
  const duration = moment.duration(durationString);
  return moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
}

function createBcryptHash(string) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(string, 10, (err, hash) => {
      err ? reject(err) : resolve(hash);
    });
  });
}

function compareBcryptHash(string, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(string, hash, function (err, res) {
      if (err) reject(err);
      else if (res) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

function generateUuid() {
  return uuid.v4();
}

const auth = (req, res, next) => {
  jwt.verify(req.headers['authorization'], process.env.JWT_PASSWORD, (err, decoded) => {
    if (err) res.json({ error: 'Unauthorized' });
    else {
      req.user = decoded;
      next();
    }
  });
};

const authOptional = (req, res, next) => {
  req.headers['authorization'] ?
  jwt.verify(req.headers['authorization'], process.env.JWT_PASSWORD, (err, decoded) => {
      req.user = !err ? decoded : null;
      next();
  }) : next();
};

function deleteProps(obj, props) {
  props.forEach((prop) => {
    delete obj[prop]
  })
}

module.exports = {
  getFirst,
  getParameterByName,
  timeout,
  generateUuid,
  createBcryptHash,
  compareBcryptHash,
  durationToReadable,
  auth,
  validateUuid,
  deleteProps,
  authOptional
};
