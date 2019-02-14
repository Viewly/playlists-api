const db = require('../../../db/knex');
const video = require('../video/index');
const hashtag = require('../hashtags/index');
const utils = require('../../utils/helpers');
const uuid = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const analytics = require('./analytics');


async function getPlaylists(query, user_id) {
  let { limit, page, title, hashtags, slug, order, q, bookmarked, mine, tag, alias, type, category_id, purchased  }  = query;
  utils.deleteProps(query, ['page', 'limit', 'title', 'hashtags', 'slug', 'order', 'q', 'bookmarked', 'mine', 'tag', 'alias', 'type', 'category_id', 'purchased']);


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
    'playlist.premium',
    'playlist.price',
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
    fields.push('bookmark.id as bookmark_id');
    fields.push('purchases.id as purchase_id');
  }
  let ids = [];
  if (type) {
    ids = await filterIdsFromAnalytics(type, category_id, tag, user_id, limit, page);
  } else {
    ids = await filterIdsByProperties(query, q, title, hashtags, user_id, mine, slug, alias, bookmarked, limit, page)
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
      tx.leftJoin('purchases', function() {
        this.on('purchases.playlist_id', '=', 'playlist.id').onIn('purchases.user_id', [ user_id ])
      });
      if (bookmarked) {
        tx.andWhere('bookmark.user_id', '=', user_id);
      }
      if (purchased) {
        tx.andWhere('purchases.user_id', '=', user_id);
      }
    }
    tx.where('playlist.id', 'in', ids.map(x => x.id))
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
      if (purchased) {
        tx.andWhere('purchases.user_id', '=', user_id);
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
            premium: i.premium,
            price: i.price,
            status: i.status,
            hashtags: i.hashtags,
            noVideos: 0,
            publish_date: i.publish_date
          }
        }
        if (user_id) {
          playlistMap[id].bookmarked = !!i.bookmark_id;
          playlistMap[id].purchased = !!i.purchase_id;
        }
        if (type) {
          let found = ids.find(x => x.id === playlistMap[id].id);
          let playlist = playlistMap[id];
          if (found) {
            if (type === 'watch_history') {
              playlist.watch_time = found.watch_time;
              playlist.started_watching = found.created_at;
            } else {
              playlist.avg_watch_time = found.avg_watch_time;
              playlist.watch_pct = found.watch_pct;
            }
          }
        }
        if (i.id) {
          playlistMap[id].duration.add(moment.duration(i.duration));
          playlistMap[id].noVideos++;
        }
      });

      return Object.keys(playlistMap).map(i => {
          let playlist = playlistMap[i];
          playlist.duration = utils.durationToReadable(playlist.duration);
          return Object.assign({id: i}, playlist)
      });

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
    'alias',
    'avatar_url'
  ];
  if (user_id) {
    fields.push('bookmark.id as bookmark_id');
    fields.push('purchases.id as purchase_id');
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
        q.leftJoin('purchases', function() {
          this.on('purchases.playlist_id', '=', 'playlist.id').onIn('purchases.user_id', [ user_id ])
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
        playlist.purchased = !!playlist.purchase_id;
        delete playlist.purchase_id;
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
        alias: playlist.alias,
        avatar_url: playlist.avatar_url
      };
      utils.deleteProps(playlist, ['category_id', 'category_name', 'category_slug', 'email', 'first_name', 'last_name', 'alias', 'user_id', 'avatar_url']);
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

async function updatePlaylistClassificaiton(playlist_id, classification, status) {
  return db.from("playlist").update({classification, status}).where('id', playlist_id);
}

async function filterIdsFromAnalytics(type, category_id, tag, user_id, limit, page){

    let ids = [];
    switch (type) {
      case 'featured_monthly':
        ids = tag
          ? await analytics.getFeaturedPlaylistsByTag(30, tag, limit)
          : await analytics.getFeaturedPlaylists(30, category_id, limit);
        break;
      case 'featured_weekly':
        ids = tag
          ? await analytics.getFeaturedPlaylistsByTag(10, tag, limit)
          : await analytics.getFeaturedPlaylists(10, category_id, limit);
        break;

      case 'watch_history':
        ids = await analytics.getWatchHistory(user_id, limit);
        break;
      case 'new_for_me':
        const onboarding = await db.select('*').from('onboarding').where('user_id', user_id).reduce(utils.getFirst);
        let categories_ids = onboarding ? onboarding.categories_ids: [];
        ids = await db.select('url as playlist_id').from('playlist').whereIn('category_id', categories_ids);
        break;
    }

    let playlists = await db.select('id', 'url').from('playlist').limit(limit).offset(page * limit).orderBy('created_at', 'desc').whereIn('url', ids.map(x => x.playlist_id));

     playlists.forEach(playlist => {
       let found = ids.find(x => x.playlist_id === playlist.url);
       Object.assign(playlist, found);
     });
    return playlists;

}

async function filterIdsByProperties(query, q, title, hashtags, user_id, mine, slug, alias, bookmarked, limit, page){
  return db.select('playlist.id', 'playlist.url').from('playlist')
  .leftJoin('category', 'playlist.category_id', 'category.id')
  .leftJoin('user', 'playlist.user_id', 'user.id')
  .limit(limit).offset(page * limit).orderBy('playlist.created_at', 'desc')
  .modify((tx) => {
    if (user_id) { //Bookmarks
      tx.leftJoin('bookmark', function() {
        this.on('bookmark.playlist_id', '=', 'playlist.id').onIn('bookmark.user_id', [ user_id ])
      });
      if (bookmarked) {
        tx.andWhere('bookmark.user_id', '=', user_id);
      }
    }
  })
  .modify(async(tx) => {
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
    if (user_id && mine) {
      tx.andWhere('playlist.user_id', '=', user_id);
    }
    if (slug) { // Exact search by slug (category shortname)
      tx.andWhere('category.slug', '=', slug);
    }
    if (alias) {
      tx.andWhere('user.alias', '=', alias);
    }
  })

}

module.exports = {
  getPlaylists,
  updatePlaylist,
  getPlaylist,
  createPlaylist,
  reorderPlaylist,
  deletePlaylist,
  playlistUuidConvert,
  updatePlaylistClassificaiton
};
