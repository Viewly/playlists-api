const db = require('../../../db/knex');

async function saveHashtags(hashtags, playlist_id){
  await db.del().from('hashtag').where('playlist_id', playlist_id);

  hashtags && await Promise.all(lintHashtagsToArray(hashtags).map(hashtag => {
    return db.insert({hashtag, playlist_id}).into('hashtag')
  }));
  return true;
}

async function getHashtags(limit = 20){
  return db.raw(`select hashtag, count(id) as mentions from hashtag group by hashtag order by mentions desc limit ${limit};`).then(a => Promise.resolve(a.rows))
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
