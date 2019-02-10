const utils = require('../../utils/helpers');
const analytics_endpoint = 'https://vidflow-analytics-api.view.ly';

async function getFeaturedPlaylists(timeframe, category_id, limit = 10) {
  let results = [];
    try {
      let url = category_id
        ? `${analytics_endpoint}/high_engagement_playlists/category/${category_id}/${timeframe}?limit=${limit}`
        : `${analytics_endpoint}/high_engagement_playlists/all/${timeframe}?limit=${limit}`;
      results = await utils.get(url);
    } catch (ex) {
      console.error(ex);
    }
    return results;
}

async function getFeaturedPlaylistsByTag(timeframe, tag, limit = 10) {
  let results = [];
  try {
    results = await utils.get(`${analytics_endpoint}/high_engagement_playlists/tag/${tag}/${timeframe}?limit=${limit }`);
  } catch (ex) {
    console.error(ex);
  }
  return results;
}

async function getWatchHistory(user_id, limit = 5) {
  let results = [];
  try {
    results = await utils.get(`${analytics_endpoint}/playlist_history/${user_id}?limit=${limit}`);
  } catch (ex) {
    console.error(ex);
  }
  return results;
}
module.exports = { getFeaturedPlaylists, getWatchHistory, getFeaturedPlaylistsByTag };
