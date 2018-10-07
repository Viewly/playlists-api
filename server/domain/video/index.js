const db = require('../../../db/knex');

async function createOrUpdateSourceVideo(user_id, video) {
  const exists = await db.select('*').from('source_video').where({youtube_video_id: video.video_id});
  if (exists.length === 0 ) {
    return db.into('source_video').insert({
      title: video.content_title,
      youtube_video_id: video.video_id,
      youtube_channel_id: video.channel_id,
      thumbnail_url: video.content_thumbnail,
      duration: video.duration
    })
  } else {
    return db.from('source_video').update({
      title: video.content_title,
      youtube_video_id: video.video_id,
      youtube_channel_id: video.channel_id,
      thumbnail_url: video.content_thumbnail,
      duration: video.duration
    }).where('youtube_video_id', video.video_id)
  }
}

function addVideosToPlaylist(user_id, playlist_id, videos) {
  return db.batchInsert('videos', videos)
  .returning('id');
}

function updateVideo(user_id, video) {

}

function deleteVideo(user_id, video_id) {

}

module.exports = { createOrUpdateSourceVideo, addVideosToPlaylist, updateVideo, deleteVideo };
