const db = require('../../../db/knex');
const video = require('../video/index');
const hashtag = require('../hashtags/index');
const utils = require('../../utils/helpers');
const uuid = require('uuid');
const moment = require('moment');
const _ = require('lodash');

function getPlaylists(query, user_id) {
  let { limit, page, title, hashtags, slug, order, q, bookmarked, mine, alias  }  = query;
  utils.deleteProps(query, ['page', 'limit', 'title', 'hashtags', 'slug', 'order', 'q', 'bookmarked', 'mine', 'alias']);

  const fields = [
    'playlist.id as playlist_id',
    'playlist.title as playlist_title',
    'playlist.description as playlist_description',
    'playlist.playlist_thumbnail_url',
    'playlist.hashtags',
    'playlist.url',
    'playlist.category_id',
    'playlist.user_id',
    'playlist.status',
    'playlist.classification',
    'playlist.created_at',
    'playlist.publish_date',
    'video.id',
    'video.title',
    'video.description',
    'source_video.duration',
    'category.id as category_id',
    'category.name as category_name',
    'category.slug as category_slug',
    'email',
    'first_name',
    'last_name',
    'alias'
  ];

  if (user_id) {
    fields.push('bookmark.id as bookmark_id')
  }

  return db.select(db.raw(fields.join(','))).from('playlist')
  .leftJoin('video', 'video.playlist_id', 'playlist.id')
  .leftJoin('source_video', 'video.source_video_id', 'source_video.id')
  .leftJoin('category', 'playlist.category_id', 'category.id')
  .leftJoin('user', 'playlist.user_id', 'user.id')
  .orderBy(`playlist.${order || 'created_at'}`, 'desc')
  .modify(async (tx) => {
    if (user_id) { //Bookmarks
      tx.leftJoin('bookmark', function() {
        this.on('bookmark.playlist_id', '=', 'playlist.id').onIn('bookmark.user_id', [ user_id ])
      });
      if (bookmarked) {
        tx.andWhere('bookmark.user_id', '=', user_id);
      }
    }
  })
  .modify(async (tx) => {
      if (Object.keys(query).length > 0) { //General search by attributes
        let search = {};
        Object.keys(query).forEach(key => { search['playlist.' + key] = query[key]});
        tx.andWhere(search);
      }
      if (q) {
        let sub = db.from("playlist").select('id').where('title', 'ILIKE', `%${q}%`)
        .orWhere('description', 'ILIKE', `%${q}%`)
        .orWhere('hashtags', 'ILIKE', `%${q}%`);
        tx.andWhere('playlist.id', 'in', sub);
        let log = {keyword: q};
        await db.insert(log).into('searchlog');
      }
      if (title) { // ILIKE search by title
        tx.andWhere('playlist.title', 'ILIKE', `%${title}%`);
      }
      if (hashtags) { // ILIKE search by hashtags
        tx.andWhere('playlist.hashtags', 'ILIKE', `%${hashtags}%`);
      }
      if (slug) { // Exact search by slug (category shortname)
        tx.andWhere('category.slug', '=', slug);
      }
      if (mine) {
        tx.andWhere('playlist.user_id', '=', user_id);
      }
      if (alias) {
        tx.andWhere('user.alias', '=', alias);
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
            category: {
              id: i.category_id,
              name: i.category_name,
              slug: i.category_slug
            },
            user: {
              id: i.user_id,
              email: i.email,
              first_name: i.first_name,
              last_name: i.last_name,
              alias: i.alias
            },
            duration: moment.duration(),
            created_at: i.created_at,
            status: i.status,
            hashtags: i.hashtags,
            noVideos: 0,
            publish_date: i.publish_date
          }
        }
        if (user_id) {
          playlistMap[id].bookmarked = !!i.bookmark_id
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
      }).slice(page * limit, (page + 1) * limit);
      return Promise.resolve(playlists);
  });
}

function getPlaylist(playlist_id, user_id) {
  const fields = [
    'playlist.*',
    'category.id as category_id',
    'category.name as category_name',
    'category.slug as category_slug',
    'email',
    'first_name',
    'last_name',
    'alias'
  ];
  if (user_id) {
    fields.push('bookmark.id as bookmark_id')
  }

  return Promise.all([
    db.select(db.raw(fields.join(','))).from('playlist')
    .leftJoin('category', 'category.id', 'playlist.category_id')
    .leftJoin('user', 'playlist.user_id', 'user.id')
    .modify((q) => {
      if (user_id) { //Bookmarks
        q.leftJoin('bookmark', function() {
          this.on('bookmark.playlist_id', '=', 'playlist.id').onIn('bookmark.user_id', [ user_id ])
        });
      }

    })
    .where('playlist.id', playlist_id).reduce(utils.getFirst),
    video.getVideosForPlaylist(playlist_id),
    db.count('id').from('review').where('playlist_id', playlist_id)
    ]).then(async (data) => {
      const playlist = data[0] || {};
      playlist.comment_count = parseInt(_.get(data, '[2][0].count', 0));
      if (user_id) {
        playlist.bookmarked = !!playlist.bookmark_id;
        delete playlist.bookmark_id;
      }
      playlist.category =  {
        id: playlist.category_id,
        name: playlist.category_name,
        slug: playlist.category_slug
      };
      playlist.user = {
        id: playlist.user_id,
        email: playlist.email,
        first_name: playlist.first_name,
        last_name: playlist.last_name,
        alias: playlist.alias
      };
      utils.deleteProps(playlist, ['category_id', 'category_name', 'category_slug', 'email', 'first_name', 'last_name', 'alias', 'user_id']);
      playlist.videos = data[1];
      return Promise.resolve(playlist);
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
    category_id: playlist.category_id,
    hashtags: playlist.hashtags,
    status: playlist.status || 'hidden',
    playlist_thumbnail_url: playlist.playlist_thumbnail_url,
    youtube_playlist_id: playlist.youtube_playlist_id,
    publish_date: playlist.status === 'published' ? new Date(): null
  }).into('playlist')
  .then(() => hashtag.saveHashtags(playlist.hashtags, playlist_id))
  .then(() => Promise.resolve(playlist_id));
}

function reorderPlaylist(user_id, playlist_id, videos) {
  return Promise.all(videos.map(i => db.from('video').
    update('position', i.position).
    where({ id: i.id, playlist_id, user_id })));
}

async function deletePlaylist(user_id, playlist_id) {
  await db.from('video').where({ user_id, playlist_id }).del();
  await db.from('playlist').where({ user_id, id: playlist_id }).del();
  await db.from('hashtag').where({ playlist_id: playlist_id }).del();
  return true;
}

async function  updatePlaylist(user_id, playlist) {
  const isOwner = await video.isOwnerOnPlaylist(user_id, playlist.id);
  if (!isOwner) return { success: false, reason: 'This playlist is owned by another user.' };
  return db.from('playlist').
    update({
      title: playlist.title,
      url: playlist.url,
      description: playlist.description,
      category_id: playlist.category.id,
      status: playlist.status,
      playlist_thumbnail_url: playlist.playlist_thumbnail_url,
      classification: playlist.classification,
      hashtags: playlist.hashtags,
      publish_date: playlist.publish_date
    }).where({ user_id, id: playlist.id })
    .then(() => hashtag.saveHashtags(playlist.hashtags, playlist.id))
    .then(() => Promise.resolve({ success: true }));
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
