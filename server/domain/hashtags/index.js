const db = require('../../../db/knex');

async function saveAndIncrementHashtag(hashtags, save, increment){
  hashtags = lintHashtags(hashtags).split(' ');
  let existing = await db.select('*').from('hashtag').whereIn('hashtag', hashtags);
  let ids = existing.map(i => i.id);
  let newTags = hashtags.filter(i => existing.findIndex(x => x.hashtag === i) === -1);
  if (save) {
    await Promise.all(newTags.map((i) => {
      return db.insert({ hashtag: i, search_count: 1 }).into('hashtag');
    }));
  }
  if (increment) {
    await Promise.all(ids.map((id) => {
      return db.increment('search_count', 1).where('id', id).from('hashtag');
    }));
  }
  return true;
}

async function getHashtags(search){
  return db.select('*').from('hashtag').orderBy('search_count', 'desc').modify(q => {
    if (search) {
      q.where('hashtag', 'ILIKE', search);
    }
  });
}

function lintHashtags(hashtags) {
  return hashtags.split(' ').map(i => {
    if (!i.startsWith('#')){
      i = '#' + i;
    }
    i.split('-').join('_');
    return i;
  }).join(' ');

}

module.exports = { saveAndIncrementHashtag, getHashtags };
