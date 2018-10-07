const db = require('../../../db/knex');

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
  const source = await  db.select('*').
    from('source_video').
    where('youtube_video_id', video.video_id).
    reduce(i => i[0]);

  const isOwner = (await db.select('*').from('playlist').where('id', video.playlist_id).reduce(i => i[0])).user_id === user_id;
  if (source && isOwner) {
    const exists = await db.select('*').
      from('video').
      where({ source_video_id: source.id, playlist_id: video.playlist_id }).
      reduce(i => i[0]);
    const total = parseInt((await db.max('position').
      from('video').
      where('playlist_id', video.playlist_id).
      reduce(i => i[0])).max) || 0;
    if (!exists) {
      video.source_video_id = source.id;
      return db.insert({
        user_id: user_id,
        playlist_id: video.playlist_id,
        source_video_id: source.id,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        position: total + 1,
      }).
        into('video').
        then(() => ({ success: true, data: { position: total + 1 } }));
    } else {
      return { success: false, reason: 'Video already added to playlist.' };
    }

  } else {
    if (!isOwner) {
      return {success: false, reason: 'Attempted to add a Video to a playlist that is not owned by this user.'};
    } else {
      throw new Error('Attempted to add a Video that is not in Source Video');
    }
  }
}

function getVideosForPlaylist(playlist_id) {
  return db.from('video').select('*').where('playlist_id', playlist_id).orderBy('position');
}

function updateVideo(user_id, video) {
  return db.from('video').update(video).where({video_id: video.id, user_id: user_id});
}

function deleteVideo(user_id, playlist_id, video_id) {
  return db.from('video').where({video_id, playlist_id, user_id}).del();
}

module.exports = {
  createOrUpdateSourceVideo,
  addVideoToPlaylist,
  getVideosForPlaylist,
  updateVideo,
  deleteVideo,
};
