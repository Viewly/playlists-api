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

async function getReviewsForPlaylist(user_id, playlist_id) {
  //const countLikesSub = await db.from('review_likes').count('id').where('review_id', ).as('likes_count');
  return db.raw(`
  SELECT review.description, review.id as review_id, parent_id, review.created_at, review.updated_at, review.status,
  COUNT(DISTINCT review.id) AS comment_count, 
  (SELECT COUNT(nullif(review_likes.status,1)) FROM review_likes WHERE review_likes.review_id=review.id)  AS dislikes_count, 
  (SELECT COUNT(nullif(review_likes.status,-1))FROM review_likes WHERE review_likes.review_id=review.id)  AS likes_count,
  (SELECT status FROM review_likes WHERE review_likes.user_id = '${user_id}' AND review_likes.review_id = review.id) as like_status,
  json_build_object('email', "user".email, 'alias', "user".alias, 'first_name', "user".first_name, 'avatar_url', "user".avatar_url) userobj
  FROM review
  LEFT JOIN review_likes ON review.id=review_likes.review_id 
  LEFT JOIN "user" ON "user".id = review.user_id
  WHERE review.playlist_id = '${playlist_id}'
  GROUP BY review.id, "user".email, "user".alias, "user".first_name, "user".avatar_url;
    
  `).then(data => data.rows.map(x => {
    x.user = x.userobj;
    delete x.userobj;
    x.comment_count = parseInt(x.comment_count);
    x.likes_count = parseInt(x.likes_count);
    x.dislikes_count = parseInt(x.dislikes_count);
    x.like_status = x.like_status || 0;
    return x;
  }))
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

// 0 - nothing, 1 - like, -1 - dislike
async function likeReview(user_id, review_id, playlist_id, status){
  const exists = await db.select('*').from('review_likes').where({user_id, playlist_id, review_id}).reduce(helpers.getFirst);

  if (exists) {
    if (status !== 0) {
      await db.update({status}).from('review_likes').where({id: exists.id, user_id});
    } else {
      await db.del().from('review_likes').where({id: exists.id, user_id});
    }

  } else {
    await db.into('review_likes').insert({user_id, review_id, playlist_id, status});
  }
  return { success: true };
}


module.exports = { createReview, getReviewsForPlaylist, deleteReview, updateReview, likeReview  };
