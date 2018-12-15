const db = require('../../../db/knex');
const helpers = require('../../utils/helpers');

async function createOrUpdateSourceVideo(user_id, video) {
  const exists = await db.select('*').
    from('source_video').
    where({ youtube_video_id: video.video_id });
  if (exists.length === 0) {
    return db.into('source_video').insert({
      title: video.title,
      youtube_video_id: video.video_id,
      youtube_channel_id: video.channel_id,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      category: video.category,
    }).returning('id');
  } else {
    return db.from('source_video').update({
      title: video.title,
      youtube_video_id: video.video_id,
      youtube_channel_id: video.channel_id,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
    }).where('youtube_video_id', video.video_id).returning('id');
  }
}

async function addVideoToPlaylist(user_id, video) {
  const source = (await  db.select('*').
    from('source_video').
    where('youtube_video_id', video.video_id))[0];

  const isOwner = await isOwnerOnPlaylist(user_id, video.playlist_id);
  if (source) {
    const exists = await db.select('*').
      from('video').
      where({ source_video_id: source.id, playlist_id: video.playlist_id }).
      reduce(i => i[0]);
    const total = parseInt((await db.max('position').
      from('video').
      where('playlist_id', video.playlist_id).
      reduce(i => i[0])).max) || 0;
    if (!exists) {
      if (!isOwner) return { success: false, reason: 'This playlist is owned by another user.' };
      video.source_video_id = source.id;
      return db.insert({
        user_id: user_id,
        playlist_id: video.playlist_id,
        source_video_id: source.id,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        position: video.position + 1 || total + 1,
      }).
        into('video').
        then(() => ({ success: true, data: { position: total + 1 } }));
    } else {
      return { success: false, reason: 'Video already added to playlist.' };
    }

  } else {
    throw new Error('Attempted to add a Video that is not in Source Video');
  }
}

function getVideosForPlaylist(playlist_id) {
  const fields = [
    'video.*',
    'source_video.youtube_channel_id as channel_id',
    'source_video.thumbnail_url',
    'source_video.youtube_video_id as video_id',
    'source_video.title as original_title',
    'source_video.duration',
    'source_video.category'];
  return db.from('video').
    select(db.raw(fields.join(','))).
    join('source_video', 'source_video.id', 'video.source_video_id').
    where('playlist_id', playlist_id).
    orderBy('position');
}

function updateVideo(user_id, video) {
  return db.from('video').
    update({title: video.title, description: video.description}).
    where({ id: video.id, user_id });
}

async function deleteVideo(user_id, playlist_id, video_id) {
  const isOwner = await isOwnerOnPlaylist(user_id, playlist_id);
  if (!isOwner) return { success: false, reason: "This playlist is owned by another user." };
  return db.from('video').where({ id: video_id, playlist_id, user_id }).del().then(() => Promise.resolve({success: true}));
}

async function isOwnerOnPlaylist(user_id, playlist_id) {
  const playlist = await db.select('*').from("playlist").where('id', playlist_id).reduce(helpers.getFirst);
  return playlist && playlist.user_id === user_id;
}

module.exports = {
  createOrUpdateSourceVideo,
  addVideoToPlaylist,
  getVideosForPlaylist,
  updateVideo,
  deleteVideo,
  isOwnerOnPlaylist
};
