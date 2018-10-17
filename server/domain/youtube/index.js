const {google} = require('googleapis');
const OAuth2 = google.auth.JWT;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const creds = require(`./credentials.${process.env.NODE_ENV || 'staging'}`);


const categories = fs.readFileSync(path.join(__dirname, './categories.txt'), 'utf-8');
const yt_categories = {};
categories.split('\n').forEach(i => {
  const arr = i.split(' - ');
  if (arr[0]) yt_categories[arr[0].trim()] = arr[1];
});

function getAuthClient(){
  const privateKey = _.replace(creds.private_key, /\\n/g, '\n');
  const scope = ['https://www.googleapis.com/auth/youtube'];
  return new OAuth2(creds.client_email, null, privateKey, scope, null);
}
const auth = getAuthClient();
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

// async function getChannelDetails(user_id){
//
//   return new Promise((resolve, reject) => {
//     service.channels.list({
//       auth,
//       part: 'snippet,contentDetails,statistics',
//       //mine: true
//     }, (err, response) => {
//       if (err) {
//         console.log('The API returned an error: ' + err);
//         reject(err);
//       }
//       const metadata = response.data.items[0];
//       const statistics = metadata.statistics;
//       const snippet = metadata.snippet;
//
//       resolve({
//         channel_id: metadata.id,
//         thumbnail_url: snippet.thumbnails.default.url,
//         title: snippet.title,
//         comment_count: parseInt(statistics.commentCount),
//         subscriber_count: parseInt(statistics.subscriberCount),
//         video_count: parseInt(statistics.videoCount),
//         view_count: parseInt(statistics.viewCount)
//       });
//     })
//   })
// }

module.exports = { getVideoMetadata, getCategories };
