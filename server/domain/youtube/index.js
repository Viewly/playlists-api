const {google} = require('googleapis');
const JWT = google.auth.JWT;
const OAuth2 = google.auth.OAuth2;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const creds = require(`./credentials.${process.env.NODE_ENV || 'staging'}`);
const oAuthCreds = require(`./credentials.oauth.${process.env.NODE_ENV || 'staging'}`);

const categories = fs.readFileSync(path.join(__dirname, './categories.txt'), 'utf-8');
const yt_categories = {};
categories.split('\n').forEach(i => {
  const arr = i.split(' - ');
  if (arr[0]) yt_categories[arr[0].trim()] = arr[1];
});

function getAuthClientJwt(){ //Used for server side things
  const privateKey = _.replace(creds.private_key, /\\n/g, '\n');
  const scope = ['https://www.googleapis.com/auth/youtube'];
  return new JWT(creds.client_email, null, privateKey, scope, null);
}

function getAuthClientOauth(tokens){ //Used for logging in
  let url = process.env.REDIRECT_ENDPOINT;
  const oauth2Client = new OAuth2(
    oAuthCreds.web.client_id,
    oAuthCreds.web.client_secret,
    url
  );

  if(tokens)
    oauth2Client.credentials = tokens;
  return oauth2Client;
}

function getAuthUrl(){
  return Promise.resolve(getAuthClientOauth().generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
  }));
}

function getAccessToken(code){
  return new Promise((resolve, reject) => {
    getAuthClientOauth().getToken(code).then(res => {
      resolve(res.tokens)
    }, err => {
      reject(err);
    })
  })
}

const auth = getAuthClientJwt();
const service = google.youtube({
  version: 'v3',
  auth
});

auth.authorize((err) => {
  if (err) throw err;
});


async function getVideoMetadata(video_id) {
  return new Promise((resolve, reject) => {

    service.videos.list({
      part: 'snippet,contentDetails,statistics',
      id: video_id
    },  (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      } else {
        const metadata = response.data.items[0].snippet;
        const thumbnails = metadata.thumbnails;
        const contentDetails = response.data.items[0].contentDetails;
        getChannelThumbnail(metadata.channelId).then(data => {
          const res = {
            video_id,
            channel_title: metadata.channelTitle,
            channel_id: metadata.channelId,
            channel_thumbnail: data.thumbnail,
            title: metadata.title,
            thumbnail_url: (thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default).url,
            duration: contentDetails.duration,
            definition: contentDetails.definition,
            category: yt_categories[metadata.categoryId]
          };
          resolve(res);
        });
      }
    });
  })
}

async function getChannelThumbnail(channel_id){
  return new Promise((resolve, reject) => {
    service.channels.list({
      part: 'snippet',
      id: channel_id
    }, (err, response) => {
      if (err) {
        reject(err)
      } else {
        const metadata = response.data.items[0].snippet;
        //TODO: Safe access
        resolve({thumbnail: (metadata.thumbnails.standard || metadata.thumbnails.default).url});
      }
    })
  })

}

function getCategories(){
  return Object.keys(yt_categories).map(key => ({id: key, name: yt_categories[key]}))
}

async function getUserInfo(auth){
  const oauth2 = google.oauth2({
    auth,
    version: 'v2'
  });
  return new Promise((resolve, reject) => {
    oauth2.userinfo.get(
      function(err, res) {
        if (err) {
          reject(err);
        } else {
          res.data.g_access_token = auth.credentials.access_token;
          res.data.g_refresh_token = auth.credentials.refresh_token;
          resolve(res.data)
        }
      });
  })
}

function getUserInfoByCode(code){
  return getAccessToken(code).then(tokens => getUserInfo(getAuthClientOauth(tokens)))
}



module.exports = { getVideoMetadata, getCategories, getAuthUrl, getUserInfoByCode };
