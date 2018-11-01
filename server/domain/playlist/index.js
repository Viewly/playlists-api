const db = require('../../../db/knex');
const video = require('../video/index');
const utils = require('../../utils/helpers');
const uuid = require('uuid');
const moment = require('moment');

function getPlaylists(query, headers) {
  const fields = [
    'playlist.id as playlist_id',
    'playlist.title as playlist_title',
    'playlist.description as playlist_description',
    'playlist.playlist_thumbnail_url',
    'playlist.hashtags',
    'playlist.url',
    'playlist.category',
    'playlist.user_id',
    'playlist.status',
    'playlist.classification',
    'playlist.created_at',
    'video.id',
    'video.title',
    'video.description',
    'source_video.duration'
  ];
  return db.select(db.raw(fields.join(','))).from('playlist')
  .leftJoin('video', 'video.playlist_id', 'playlist.id')
  .leftJoin('source_video', 'video.source_video_id', 'source_video.id')
  .orderBy('playlist.created_at', 'desc')
  .modify(async (q) => {
    if (query && Object.keys(query).length > 0){
      let search = {};
      const title = query.title;
      delete query.title;
      Object.keys(query).forEach(key => { search['playlist.' + key] = query[key]});
      q.where(search);
      if (title) {
        q.where('playlist.title', 'ILIKE', `%${title}%`);
        let log = {keyword: title};
        if (headers) {
          log.identifier = headers.identifier;
          log.email = headers.email;
        }
        await db.insert(log).into('searchlog');
      }
    }
  })
    .then(data => {
      const playlistMap = {};
      data.map(i => {
        let id = i.playlist_id;
        if (!playlistMap[id]) {
          playlistMap[id] = {
            id: id,
            title: i.playlist_title,
            url: i.url,
            playlist_thumbnail_url: i.playlist_thumbnail_url,
            description: i.playlist_description,
            classification: i.classification,
            category: i.category,
            duration: moment.duration(),
            created_at: i.created_at,
            status: i.status,
            hashtags: i.hashtags,
            user_id: i.user_id,
            noVideos: 0
          }
        }
        if (i.id) {
          playlistMap[id].duration.add(moment.duration(i.duration));
          playlistMap[id].noVideos++;
        }
      });

      const playlists = Object.keys(playlistMap).map(i => {
          let playlist = playlistMap[i];
          playlist.duration = utils.durationToReadable(playlist.duration);
          return Object.assign({id: i}, playlist)
      });
      return Promise.resolve(playlists);
  });
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
    url: playlist.url,
    description: playlist.description,
    category: playlist.category,
    hashtags: playlist.hashtags,
    status: playlist.status || 'hidden',
    playlist_thumbnail_url: playlist.playlist_thumbnail_url,
    youtube_playlist_id: playlist.youtube_playlist_id
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
      url: playlist.url,
      description: playlist.description,
      category: playlist.category,
      status: playlist.status,
      playlist_thumbnail_url: playlist.playlist_thumbnail_url,
      classification: playlist.classification,
      hashtags: playlist.hashtags
    }).where({ user_id, id: playlist.id });
}

async function playlistUuidConvert(playlist_id){
  const uuid = utils.validateUuid(playlist_id, 4);
  if (uuid) {
    return playlist_id;
  } else {
    const playlist = await db.select('*').from('playlist').where('url', playlist_id).reduce(utils.getFirst);
    return playlist.id;
  }
}

module.exports = {
  getPlaylists,
  updatePlaylist,
  getPlaylist,
  createPlaylist,
  reorderPlaylist,
  deletePlaylist,
  playlistUuidConvert
};
