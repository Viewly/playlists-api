const db = require('../../../db/knex');
const notification = require('../notifications/index');
const helpers = require('../../utils/helpers');
async function createReview(user_id, review) {
  const exists = await db.select('*').from('playlist').where('id', review.playlist_id).reduce(helpers.getFirst);
  if (!exists) return { success: false, message: "Playlist does not exist." };
  return db.insert({
    user_id,
    playlist_id: review.playlist_id,
    title: review.title,
    description: review.description,
    rating: review.rating,
    parent_id: review.parent_id
  }).into('review').returning('id')
  .then(async (data) => {
    const comment_id = data[0];
    return notification.messages.afterPlaylistComment(user_id, review.playlist_id, comment_id).then(() => Promise.resolve({success: true, id: comment_id}))
  });
}

function getReviewsForPlaylist(playlist_id) {
  return db.select('review.*', 'user.first_name', 'user.last_name', 'user.alias', 'user.email', 'user.avatar_url').from('review').join('user', 'user.id', 'review.user_id')
    .where('playlist_id', playlist_id).orderBy('review.created_at', 'desc').then((all) => Promise.resolve(all.map(x => {
      const review = x;
      review.user = {
        id: review.user_id,
        email: review.email,
        first_name: review.first_name,
        last_name: review.last_name,
        alias: review.alias,
        avatar_url: review.avatar_url
      };
      helpers.deleteProps(review, [
        'email', 'first_name', 'last_name', 'alias', 'avatar_url']);
      return review;
    })
  ));
}

async function deleteReview(user_id, review_id) {
  const review = await db.select('*').from('review').where('id', review_id).reduce(helpers.getFirst);
  if (review) {
    const playlist = await db.select('*').from('playlist').where('id', review.playlist_id).reduce(helpers.getFirst);
    if (review.user_id === user_id || playlist.user_id === user_id) {
      const hasReplies = await db.select('*').from('review').where({parent_id: review.id, id: review_id});
      if (review.parent_id !== -1 || hasReplies.length > 0) {
        await db.from("review").update({description: `[deleted by ${review.user_id === user_id ? 'user' : 'playlist admin.'}]`, status: 'deleted'}).where('id', review_id);
      } else {
        await db.del().from('review').where('id', review_id);
      }
      return { success: true }
    } else {
      return { success: false, message: 'Only the playlist admin or the comment author can delete this comment.' }
    }
  } else {
    return { success: false, message: 'Comment does not exist.' }
  }
}

async function updateReview(user_id, review) {
  const exists = await db.select('*').from('review').where('id', review.id).reduce(helpers.getFirst);
  if (exists && exists.status !== 'deleted') {
    await db.from("review").update({description: review.description, status: 'edited'}).where('id', review.id);
    return { success: true }
  } else if (exists.status === 'deleted') {
    return { success: false, message: 'Cannot edit a deleted comment.' }
  } else {
    return { success: false, message: 'Comment does not exist.' }
  }
}

module.exports = { createReview, getReviewsForPlaylist, deleteReview, updateReview  };
