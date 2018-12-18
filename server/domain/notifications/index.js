const db = require('../../../db/knex');
const templates = require('./templates');

function getNotifications(user_id) {
  return db.select('*').from('notification').where('user_id', user_id).orderBy('created_at', 'desc').limit(50);
}

function createNotification(notification) {
  return db.insert(notification).into('notification');
}

function createBatchNotifications(notifications) {
  return db.batchInsert('notification', notifications, notifications.length)
}

function markAsRead(user_id, notification_ids) {
  return db.update({status: 'read'}).from('notification').whereIn('id', Array.isArray(notification_ids) ? notification_ids : [notification_ids])
    .andWhere('user_id', user_id);
}

function deleteNotification() {}

function sendNotification() {}


//Notifications below (created by templates)
async function afterPlaylistComment (comment_owner, playlist_id, comment_id) {
  await createNotification(await templates.commentedOnPlaylist(comment_owner, playlist_id, comment_id));
  await createBatchNotifications(await templates.commentedOnPlaylistAll(comment_owner, playlist_id, comment_id))
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
