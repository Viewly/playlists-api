exports.up = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.string('playlist_thumbnail_url');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("playlist", function(t) {
    t.dropColumn('playlist_thumbnail_url');
  });
};
