const {google} = require('googleapis');
const OAuth2 = google.auth.JWT;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const creds = require(`./credentials.${process.env.NODE_ENV || 'staging'}`);
const video = require('../video/index');

const categories = fs.readFileSync(path.join(__dirname, './categories.txt'), 'utf-8');
const yt_categories = {};
categories.split('\n').forEach(i => {
  const arr = i.split(' - ');
  yt_categories[arr[0].trim()] = arr[1];
});
console.log(yt_categories);

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
  getVideoMetadata('KYfADOlstwc').then(console.log)
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
        const contentDetails = response.data.items[0].contentDetails;
        getChannelThumbnail(metadata.channelId).then(data => {
          const res = {
            video_id,
            channel_title: metadata.channelTitle,
            channel_id: metadata.channelId,
            channel_thumbnail: data.thumbnail,
            content_title: metadata.title,
            content_thumbnail: metadata.thumbnails.default.url,
            duration: contentDetails.duration,
            definition: contentDetails.definition,
            category: yt_categories[metadata.categoryId]
          };
          video.createOrUpdateSourceVideo('', res).then(console.log);
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
        resolve({thumbnail: metadata.thumbnails.default.url});
      }
    })
  })

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



module.exports = { getVideoMetadata};
