const db = require('../../../db/knex');
const helpers = require('../../utils/helpers');

async function createBookmark(user_id, playlist_id){
  const exists = await db.select('*').from('bookmark').where({user_id, playlist_id}).reduce(helpers.getFirst);
  if (exists) return { success: false, reason: "Bookmark already exists" };
  else return db.insert({ user_id, playlist_id }).into('bookmark').returning('id')
    .then(data => Promise.resolve({success: true, id: data[0]}));

}

function deleteBookmark(user_id, bookmark_id){
  return db.del().from('bookmark').where({id: bookmark_id, user_id});
}

function getBookmarksForUser(user_id){
  return db.count().from('bookmark').where('bookmark.user_id', user_id).reduce(helpers.getFirst);
}

module.exports = { createBookmark, deleteBookmark, getBookmarksForUser };
