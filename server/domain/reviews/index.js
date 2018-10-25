const db = require('../../../db/knex');

function createReview(user_id, review) {
  return db.insert({
    user_id,
    playlist_id: review.playlist_id,
    title: review.title,
    description: review.description,
    rating: review.rating
  }).into('review');
}

function getReviewsForPlaylist(playlist_id) {
  return db.select('review.*', 'user.first_name', 'user.last_name').from('review').join('user', 'user.id', 'review.user_id')
    .where('playlist_id', playlist_id);
}

function deleteReview(user_id, playlist_id) {
  return db.del().from('review').where({user_id, playlist_id});
}

module.exports = { createReview, getReviewsForPlaylist, deleteReview  };
