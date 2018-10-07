const db = require('../../../db/knex');
const video = require('../video/index');
const uuid = require('uuid');

function getPlaylists() {
  return db.select('*').from('playlist').orderBy('created_at', 'desc');
}

function getPlaylist(playlist_id) {
  return Promise.all([
    db.select('*').from('playlist').where('id', playlist_id).reduce(i => i[0]),
    video.getVideosForPlaylist(playlist_id)]).then(data => {
    data[0].videos = data[1];
    return Promise.resolve(data[0]);
  });
}

function createPlaylist(user_id, playlist) {
  const playlist_id = uuid.v4();
  return db.insert({
    id: playlist_id,
    user_id: user_id,
    title: playlist.title,
    description: playlist.description,
    category: playlist.category,
    status: playlist.status || 'published',
  }).into('playlist').then(() => Promise.resolve(playlist_id));
}

function reorderPlaylist(user_id, playlist_id, videos) {
  return Promise.all(videos.map(i => db.from('video').
    update('position', i.position).
    where({ id: i.id, playlist_id, user_id })));
}

async function deletePlaylist(user_id, playlist_id) {
  await db.from('video').where({ user_id, playlist_id }).del();
  await db.from('playlist').where({ user_id, id: playlist_id }).del();
  return true;
}

async function updatePlaylist(user_id, playlist) {
  return db.from('playlist').
    update({
      title: playlist.title,
      description: playlist.description,
      category: playlist.category,
      status: playlist.status
    }).where({ user_id, id: playlist.id });
}

module.exports = {
  getPlaylists,
  updatePlaylist,
  getPlaylist,
  createPlaylist,
  reorderPlaylist,
  deletePlaylist,
};
