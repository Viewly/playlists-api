const request = require('request');
const _ = require('lodash');

async function getUserTwitter(link) {
  const username = link.split('twitter.com/')[1].split('/')[0];

  return new Promise((resolve, reject) => {
    request(
      `https://api.twitter.com/1.1/users/show.json?screen_name=${username}`, {
        headers: {
          'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAHZ39AAAAAAANcjyp0GXPItX5S%2FNZmp88C5RTVA%3DgIjgyeu37uSMxNpn6br3uE3rN3ROW3OsWJGxqRwcOc90ck1qDU',
        },
      }, (err, res, body) => {
        if (err) reject(err);
        else {
          body = JSON.parse(body);
          const {
            id, name, screen_name, followers_count, friends_count, listed_count, created_at, profile_background_image_url_https, profile_image_url_https, description
          } = body;
          resolve({
            id,
            name,
            screen_name,
            followers_count,
            friends_count,
            listed_count,
            created_at,
            profile_background_image_url_https,
            profile_image_url_https,
            description
          });
        }
      });
  });

}


function getLastTweets(username, count = 10) {
  return new Promise((resolve, reject) => {
    request(
      `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${username}&count=${count}`, {
        headers: {
          'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAAHZ39AAAAAAANcjyp0GXPItX5S%2FNZmp88C5RTVA%3DgIjgyeu37uSMxNpn6br3uE3rN3ROW3OsWJGxqRwcOc90ck1qDU',
        },
      }, (err, res, body) => {
        if (err) reject(err);
        else {
          body = JSON.parse(body);
          resolve(body.map(x => ({
            id: x.id_str,
            created_at: x.created_at,
            favorite_count: x.favorite_count,
            retweet_count: x.retweet_count,
            media: _.get(x, 'entities.media'),
            text: x.text,
            avatar: x.user.profile_image_url_https,
            name: x.user.name,
            display_name: x.user.display_name,
            user_id: x.user.id_str
          })));
        }
      });
  });


}
//getUserTwitter('https://twitter.com/Sodapoppintv').then(console.log);
module.exports = { getUserTwitter, getLastTweets };
