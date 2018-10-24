exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.string('url');
    t.string('youtube_playlist_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.dropColumn('url');
    t.dropColumn('youtube_playlist_id');
  });
};
