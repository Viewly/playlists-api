var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
const creds = require(`./credentials.${process.env.NODE_ENV || 'staging'}`);
const db = require('../../../db/knex');
const utils = require('../../utils/helpers');

function getAuthClient(tokens, is_content_creator){
  //If user_id is supplied, it will fetch the tokens from the db
  let url = process.env.REDIRECT_ENDPOINT;
  if (is_content_creator) url += '?t=cc';
  const oauth2Client = new OAuth2(
    creds.web.client_id,
    creds.web.client_secret,
    url
  );

  if(tokens)
    oauth2Client.credentials = tokens;
  return oauth2Client;
}

const youtube = google.youtube({
  version: 'v3',
  auth: getAuthClient()
});

function getAuthUrl(is_content_creator){
  return Promise.resolve(getAuthClient(null, is_content_creator).generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/youtubepartner', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
  }));
}

function getAccessToken(code, is_content_creator){
  return new Promise((resolve, reject) => {
    getAuthClient(null, is_content_creator).getToken(code).then(res => {
      resolve(res.tokens)
    }, err => {
      reject(err);
    })
  })
}

async function getChannelNameFromUrl(video_id, user_id) {
  const tokens = await  getAuthTokens(user_id);
  const auth = getAuthClient(tokens);
  //const id = querystring.parse(url.split('?')[1]).v;
  return new Promise((resolve, reject) => {
    const service = google.youtube({
      version: 'v3',
      auth
    });
    service.videos.list({
      auth,
      part: 'snippet,contentDetails,statistics',
      id: video_id
    },  (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      } else {
        const metadata = response.data.items[0].snippet;
        getChannelThumbnail(service, auth, metadata.channelId).then(data => {
          resolve({channel_title: metadata.channelTitle, channel_id: metadata.channelId, channel_thumbnail: data.thumbnail, content_title: metadata.title, content_thumbnail: metadata.thumbnails.default.url});
        });
      }
    });
  })
}

async function getChannelThumbnail(service, authInstance, channel_id){
  return new Promise((resolve, reject) => {
    service.channels.list({
      auth: authInstance,
      part: 'snippet',
      id: channel_id
    }, (err, response) => {
      if (err) {
        reject(err)
      } else {
        const metadata = response.data.items[0].snippet;
        //TODO: Safe access
        resolve({thumbnail: metadata.thumbnails.default.url});
      }
    })
  })

}

async function getChannelDetails(user_id, auth){
  if (!auth) {
    const tokens = await db.select('g_access_token as access_token', 'g_refresh_token as refresh_token').from('users').where('user_id', user_id).reduce(utils.getFirst);
    auth = getAuthClient(tokens);
  }
  return new Promise((resolve, reject) => {
    youtube.channels.list({
      auth,
      part: 'snippet,contentDetails,statistics',
      mine: true
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      }
      const metadata = response.data.items[0];
      const statistics = metadata.statistics;
      const snippet = metadata.snippet;

      resolve({
        channel_id: metadata.id,
        thumbnail_url: snippet.thumbnails.default.url,
        title: snippet.title,
        comment_count: parseInt(statistics.commentCount),
        subscriber_count: parseInt(statistics.subscriberCount),
        video_count: parseInt(statistics.videoCount),
        view_count: parseInt(statistics.viewCount)
      });
    })
  })
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

function getUserInfoByCode(code, is_content_creator){
  return this.getAccessToken(code, is_content_creator).then(tokens => {
    return getUserInfo(getAuthClient(tokens))
  })
}

async function getAuthTokens(user_id){
  return db.select('g_access_token as access_token', 'g_refresh_token as refresh_token').from('users').where('user_id', user_id).reduce(utils.getFirst);
}

module.exports = { getAuthUrl, getAccessToken };
