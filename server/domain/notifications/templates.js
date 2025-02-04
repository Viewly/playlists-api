const db = require('../../../db/knex');

async function commentedOnPlaylist(comment_sender, playlist, comment_id) {
  //const comment_sender = (await db.select('*').from('user').where('id', comment_owner))[0];
  //const playlist = (await db.select('*').from('playlist').where('id', playlist_id))[0];


  return {
    template_name: 'playlist_comment_for_owner',
    playlist_id: playlist.id,
    metadata: {
      playlist_url: playlist.url || playlist.id,
      playlist_id: playlist.id,
      comment_id,
      comment_owner: comment_sender.id,
      playlist_owner: playlist.user_id,
      comment_owner_avatar_url: comment_sender.avatar_url
    },
    title: `${comment_sender.alias || comment_sender.first_name || 'Some mysterious user'} just commented on your playlist ${playlist.title}.`,
    status: 'unread',
    user_id: playlist.user_id
  }
}

async function commentedOnPlaylistAll(comment_sender, playlist, comment_id) {
  const all_comments = await db.distinct('user_id', 'email').
    from('review').
    join('user', 'user.id', 'review.user_id').
    where('playlist_id', playlist.id).whereNotIn('user_id', [comment_sender.id, playlist.user_id]);

  return all_comments.map(comment => {
        return {
          template_name: 'playlist_comment_for_all',
          playlist_id: playlist.id,
          metadata: {
            playlist_url: playlist.url || playlist.id,
            playlist_id: playlist.id,
            comment_id,
            comment_owner: comment_sender.id,
            playlist_owner: playlist.user_id,
            comment_owner_avatar_url: comment_sender.avatar_url,
            receiver_email: comment.email
          },
          title: `${comment_sender.alias || comment_sender.first_name ||
          'Some mysterious user'} just added a comment on the playlist ${playlist.title}.`,
          status: 'unread',
          user_id: comment.user_id
        }
  })
}
module.exports = { commentedOnPlaylist, commentedOnPlaylistAll };
