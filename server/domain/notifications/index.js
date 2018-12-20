const db = require('../../../db/knex');
const emails = require('../email/index');
const templates = require('./templates');

function getNotifications(user_id) {
  return db.select('*').from('notification').where('user_id', user_id).orderBy('created_at', 'desc').limit(50);
}

function createNotification(notification) {
  return db.insert(notification).into('notification');
}

function createBatchNotifications(notifications) {
  return notifications.length > 0 ? db.batchInsert('notification', notifications, notifications.length) : Promise.resolve();
}

function markAsRead(user_id, notification_ids) {
  return db.update({status: 'read'}).from('notification').whereIn('id', Array.isArray(notification_ids) ? notification_ids : [notification_ids])
    .andWhere('user_id', user_id);
}

function deleteNotification() {}

function sendNotification() {}


//Notifications below (created by templates)
async function afterPlaylistComment (comment_owner, playlist_id, comment_id) {
  const comment_sender = (await db.select('*').from('user').where('id', comment_owner))[0];
  const playlist = (await db.select('*').from('playlist').where('id', playlist_id))[0];
  const playlist_owner = (await db.select('*').from('user').where('id', playlist.user_id))[0];
  //Send email and notification to owner
  if (comment_sender.id !== playlist_owner.id) {
    await createNotification(await templates.commentedOnPlaylist(comment_sender, playlist, comment_id));
    emails.sendCommentActivityEmail(playlist_owner.email, comment_sender, playlist, comment_id);
  }
  //Send email and notification to people that commented on that playlist
  const all = await templates.commentedOnPlaylistAll(comment_sender, playlist, comment_id);
  await createBatchNotifications(all);
  await Promise.all(all.map(comment => emails.sendCommentActivityEmail(comment.metadata.receiver_email, comment_sender, playlist, comment_id)));

  return true;
}

const messages = {
  afterPlaylistComment
};

module.exports = { getNotifications,
  createNotification,
  createBatchNotifications,
  markAsRead,
  deleteNotification,
  sendNotification, messages };
