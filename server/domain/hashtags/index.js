const db = require('../../../db/knex');

async function saveHashtags(hashtags, playlist_id){
  await db.del().from('hashtag').where('playlist_id', playlist_id);

  hashtags && await Promise.all(lintHashtagsToArray(hashtags).map(hashtag => {
    return db.insert({hashtag, playlist_id}).into('hashtag')
  }));
  return true;
}

async function getHashtags(search){
  return db.select('*').from('hashtag').orderBy('search_count', 'desc').modify(q => {
    if (search) {
      q.where('hashtag', 'ILIKE', search);
    }
  });
}

function lintHashtagsToArray(hashtags = []) {
  return hashtags.split(' ').map(i => {
    if (!i.startsWith('#')){
      i = '#' + i;
    }
    i.split('-').join('_');
    return i;
  });

}

module.exports = { saveHashtags, getHashtags };
