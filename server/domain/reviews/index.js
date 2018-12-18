const db = require('../../../db/knex');
const notification = require('../notifications/index');
const helpers = require('../../utils/helpers');
async function createReview(user_id, review) {

  return db.insert({
    user_id,
    playlist_id: review.playlist_id,
    title: review.title,
    description: review.description,
    rating: review.rating
  }).into('review').returning('id')
  .then(async (data) => {
    const comment_id = data[0];
    return notification.messages.afterPlaylistComment(user_id, review.playlist_id, comment_id)
  });
}

function getReviewsForPlaylist(playlist_id) {
  return db.select('review.*', 'user.first_name', 'user.last_name', 'user.alias', 'user.id', 'user.email').from('review').join('user', 'user.id', 'review.user_id')
    .where('playlist_id', playlist_id).then((all) => Promise.resolve(all.map(x => {
      const review = x;
      review.user = {
        id: review.user_id,
        email: review.email,
        first_name: review.first_name,
        last_name: review.last_name,
        alias: review.alias
      };
      helpers.deleteProps(review, [
        'email', 'first_name', 'last_name', 'alias', 'user_id']);
      return review;
    })
  ));
}

function deleteReview(user_id, playlist_id) {
  return db.del().from('review').where({user_id, playlist_id});
}

module.exports = { createReview, getReviewsForPlaylist, deleteReview  };
