const api = require('twitch-api-v5');
const _ = require('lodash');
const getUrls = require('get-urls');
const twitter = require('../twitter/index');
const youtube = require('../youtube/index');
const extractor = require('extract-data-from-text');

api.clientID = 'bcpp9nnnjxotwg0itscsvrubs4rglw';

async function extractSocialMediaFromPanels(channel_name) {
  const panels = await getPanelsForChannel(channel_name).catch(console.error);
  const twitch_user = (await getUserDetails(channel_name)).users[0];
  const twitch_stream_status = await getLiveStreamDetails(twitch_user._id);
  const twitch_channel = await getChannelDetailsById(twitch_user._id);
  const social = {
    twitch_stream_status,
    twitch_metadata: twitch_user,
    twitch_channel_metadata: twitch_channel,
    other: new Set(),
    emails: []
  };
  await Promise.all(panels.map(async(x) => {
    const link = _.get(x, 'data.link', '');
    const description = _.get(x, 'data.description', '');

    Object.assign(social, await extractFromLink(link, social));

    if (description) {
      const links = Array.from(getUrls(description)).map(x => cleanup(decodeURI(x)));
      const emails = extractor.emails(description);
      if (emails.length > 0) {
        social.emails.push(...emails);
      }
      await Promise.all(links.map(async (link) => await extractFromLink(link, social)));
    }
    return true;
  }));
  social.amazon_referrals = [];
  social.youtube_links = [];
  social.other = Array.from(social.other).filter(x => x.length > 0).filter(x => {
    if (x.includes('amazon') || x.includes('amzn')) {
      social.amazon_referrals.push(x);
      return false;
    } else if (x.includes('youtube')) {
      social.youtube_links.push(x);
      return false;
    }
    else return true;
  });
  return social;
}

async function extractFromLink(link, found) {
  const possibleAttributes = [
    {name: 'youtube', search: 'youtube.com/'},
    {name: 'facebook', search: 'facebook.com/'},
    {name: 'instagram', search: 'instagram.com/'},
    {name: 'twitter', search: 'twitter.com/'},
    {name: 'discord', search: 'discord.gg/'}
  ];
  let included = false;
  await Promise.all(  possibleAttributes.map(async (x) => {
    if (link.includes(x.search)) {
      included = true;
      if (!found[x.name]) {
        found[x.name] = link;
        switch (x.name) {
          case 'twitter':
            found.twitter_metadata = await twitter.getUserTwitter(link);
            found.tweets = await twitter.getLastTweets(found.twitter_metadata.screen_name);
            break;
          case 'youtube':
            if (!found.youtube_metadata)
              found.youtube_metadata = await youtube.fetchYoutubeProfileByChannel(link);
            break;
        }
      } else if (found[x.name] && link.length < found[x.name].length) {
        found.other.add(found[x.name]);
        found[x.name] = link;
      }
    }
    return true;
  }));
  if (!included) {
    found.other.add(link)
  }

  return found;
}

async function getPanelsForChannel(channel_name) {
  return new Promise((resolve, reject) => {
    api.other.panels({channelName: channel_name}, (err, res) => {
      err ? reject(err) : resolve(res)
    });
  })
}

async function getUserDetails(channel_name) {
  return new Promise((resolve, reject) => {
    api.users.usersByName({users: channel_name}, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  });
}

async function getChannelDetailsById(channel_id) {
  return new Promise((resolve, reject) => {
    api.channels.channelByID({channelID: channel_id}, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  });

}

async function getLiveStreamDetails(channel_name) {
  console.log(channel_name);
  return new Promise((resolve, reject) => {
    api.streams.channel({channelID: channel_name, stream_type: 'live'}, (err, res) => {
      err ? reject(err) : resolve(res);
    })
  });
}
getChannelDetailsById('26490481').then(console.log);
function cleanup(url){
  if (url.includes(')')) {
    url = url.split(')')[0];
  }
  if (url.includes('*')) {
    url = url.split('*')[0];
  }

  return url;
}

// async function main() {
//   const social = await extractSocialMediaFromPanels('sodapoppin');
//   console.log(social)
//   // const text = 'Lorem ipsum dolor sit amet, //sindresorhus.com consectetuer adipiscing http://yeoman.io elit.';
//   //
//   // console.log(Array.from(getUrls(text)));
// }
// console.log(main());
module.exports = { extractSocialMediaFromPanels };
