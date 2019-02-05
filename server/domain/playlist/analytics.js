const utils = require('../../utils/helpers');
const analytics_endpoint = 'https://vidflow-analytics-api.view.ly';

async function getFeaturedPlaylists(timeframe, category_id, limit = 10) {
  let results = [];
    try {
      results = await utils.get(`${analytics_endpoint}/high_engagement_playlists/${category_id || 'all'}/${timeframe}?limit=${limit }`);
    } catch (ex) {
      console.error(ex);
    }
    return results.map(x => x.playlist_id);
}
module.exports = { getFeaturedPlaylists };
