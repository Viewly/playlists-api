const utils = require('../../utils/helpers');
const analytics_endpoint = 'https://vidflow-analytics-api.view.ly';

async function getFeaturedPlaylists(timeframe, category_id, limit = 10) {
  const results = await utils.get(`${analytics_endpoint}/high_engagement_playlists/${category_id || 'all'}/${timeframe}?limit=${limit }`);
  return results.map(x => x.playlist_id);
}
module.exports = { getFeaturedPlaylists };
